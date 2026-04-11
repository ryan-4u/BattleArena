const express    = require("express");
const router     = express.Router();
const User       = require("../models/user");
const Tournament = require("../models/tournament");
const OrgApplication = require("../models/orgApplication");
const { isLoggedIn, isAdmin } = require("../middleware");

// All admin routes require login + admin role
router.use(isLoggedIn, isAdmin);

// ── DASHBOARD ──
router.get("/", async (req, res) => {
  const [totalUsers, totalPlayers, totalOrganisers,
         totalTournaments, blockedTournaments, activeTournaments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "player" }),
    User.countDocuments({ role: "organiser" }),
    Tournament.countDocuments(),
    Tournament.countDocuments({ blocked: true }),
    Tournament.countDocuments({ status: { $in: ["upcoming", "ongoing"] }, blocked: false }),
  ]);
  const bannedUsers = await User.countDocuments({ banned: true });
  const pendingApplications = await OrgApplication.countDocuments({ status: "pending" });

  res.render("admin/dashboard", {
    stats: {
      totalUsers, totalPlayers, totalOrganisers,
      totalTournaments, blockedTournaments, activeTournaments,
      bannedUsers, pendingApplications
    }
  });
});

// ── ALL USERS ──
router.get("/users", async (req, res) => {
  const { role, search } = req.query;
  let filter = { role: { $ne: "admin" } };
  if (role)   filter.role     = role;
  if (search) filter.username = { $regex: search, $options: "i" };

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.render("admin/users", { users, query: req.query });
});

// ── BAN USER ──
router.patch("/users/:id/ban", async (req, res) => {
  const { reason } = req.body;
  await User.findByIdAndUpdate(req.params.id, {
    banned: true,
    banReason: reason || "Violation of platform rules."
  });
  req.flash("success", "User banned.");
  res.redirect("/admin/users");
});

// ── UNBAN USER ──
router.patch("/users/:id/unban", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { banned: false, banReason: "" });
  req.flash("success", "User unbanned.");
  res.redirect("/admin/users");
});

// ── DELETE USER ──
router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash("success", "User deleted.");
  res.redirect("/admin/users");
});

// ── CHANGE ROLE ──
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["player", "organiser"].includes(role)) {
    req.flash("error", "Invalid role.");
    return res.redirect("/admin/users");
  }
  await User.findByIdAndUpdate(req.params.id, { role });
  req.flash("success", "User role updated.");
  res.redirect("/admin/users");
});

// ── ALL TOURNAMENTS ──
router.get("/tournaments", async (req, res) => {
  const { status, search } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (search) filter.title  = { $regex: search, $options: "i" };

  const tournaments = await Tournament.find(filter)
    .populate("organiser")
    .sort({ createdAt: -1 });
  res.render("admin/tournaments", { tournaments, query: req.query });
});

// ── BLOCK TOURNAMENT ──
router.patch("/tournaments/:id/block", async (req, res) => {
  const { reason } = req.body;
  await Tournament.findByIdAndUpdate(req.params.id, {
    blocked: true,
    blockedReason: reason || "Violates platform guidelines."
  });
  req.flash("success", "Tournament blocked.");
  res.redirect("/admin/tournaments");
});

// ── UNBLOCK TOURNAMENT ──
router.patch("/tournaments/:id/unblock", async (req, res) => {
  await Tournament.findByIdAndUpdate(req.params.id, {
    blocked: false,
    blockedReason: ""
  });
  req.flash("success", "Tournament unblocked.");
  res.redirect("/admin/tournaments");
});

// ── ORGANISER APPLICATIONS ──
router.get("/organiser-applications", async (req, res) => {
  const { status } = req.query;
  let filter = {};
  if (status) filter.status = status;

  const applications = await OrgApplication.find(filter)
    .populate("applicant")
    .populate("reviewedBy")
    .sort({ createdAt: -1 });

  res.render("admin/organiser-applications", { applications, query: req.query });
});

// ── APPROVE APPLICATION ──
router.patch("/organiser-applications/:id/approve", async (req, res) => {
  const application = await OrgApplication.findById(req.params.id).populate("applicant");

  if (!application) {
    req.flash("error", "Application not found.");
    return res.redirect("/admin/organiser-applications");
  }

  await OrgApplication.findByIdAndUpdate(req.params.id, {
    status: "approved",
    reviewedBy: req.user._id,
    reviewedAt: new Date()
  });

  await User.findByIdAndUpdate(application.applicant._id, {
    role: "organiser"
  });

  req.flash("success", `${application.applicant.username} is now an organiser.`);
  res.redirect("/admin/organiser-applications");
});

// ── REJECT APPLICATION ──
router.patch("/organiser-applications/:id/reject", async (req, res) => {
  const { reason } = req.body;
  const application = await OrgApplication.findById(req.params.id).populate("applicant");

  if (!application) {
    req.flash("error", "Application not found.");
    return res.redirect("/admin/organiser-applications");
  }

  await OrgApplication.findByIdAndUpdate(req.params.id, {
    status: "rejected",
    rejectionReason: reason || "Application did not meet requirements.",
    reviewedBy: req.user._id,
    reviewedAt: new Date()
  });

  req.flash("success", `Application from ${application.applicant.username} rejected.`);
  res.redirect("/admin/organiser-applications");
});

module.exports = router;