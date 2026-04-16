const express = require("express");
const router = express.Router();
const Tournament = require("../models/tournament");
const User = require("../models/user");
const { isLoggedIn, isPlayer, isOrganiser } = require("../middleware");
const nodemailer = require("nodemailer");

// Apply to tournament
router.post("/:id/apply", isLoggedIn, isPlayer, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  // ── NEW GUARDS ──────────────────────────────────────────
  const now = new Date();

  if (now > new Date(tournament.registrationDeadline)) {
    req.flash("error", "Registration deadline has passed. You can no longer apply.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  if (tournament.status === "ongoing" || tournament.status === "completed") {
    req.flash("error", "Registration is closed — this tournament is already underway.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }
  // ────────────────────────────────────────────────────────

  const alreadyApplied = tournament.applicants.some(
    a => a.player.equals(req.user._id)
  );
  if (alreadyApplied) {
    req.flash("error", "You have already applied to this tournament.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const acceptedCount = tournament.applicants.filter(a => a.status === "accepted").length;
  if (acceptedCount >= tournament.maxPlayers) {
    req.flash("error", "Tournament is full.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  tournament.applicants.push({ player: req.user._id });
  await tournament.save();

  req.flash("success", "Application submitted! Wait for organiser approval.");
  res.redirect(`/tournaments/${req.params.id}`);
});

// Accept applicant
router.patch("/:id/applicants/:uid/accept", isLoggedIn, isOrganiser, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate("applicants.player");
  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  const applicant = tournament.applicants.find(
    a => a.player._id.equals(req.params.uid)
  );
  if (!applicant) {
    req.flash("error", "Applicant not found.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  applicant.status = "accepted";
  await tournament.save();

  await User.findByIdAndUpdate(req.params.uid, {
    $addToSet: { tournamentsJoined: tournament._id }
  });

  // Email notification (room details removed — just acceptance notice)
  if (applicant.player.email) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      await transporter.sendMail({
        from: `"BattleArena" <${process.env.EMAIL_USER}>`,
        to: applicant.player.email,
        subject: `✅ Accepted: ${tournament.title}`,
        html: `
          <h2>You're in!</h2>
          <p>Your registration for <strong>${tournament.title}</strong> has been accepted.</p>
          <p><strong>Start Date:</strong> ${new Date(tournament.startDate).toLocaleString()}</p>
          <p>Check the tournament page for announcements and match details.</p>
          <p>Good luck!</p>
        `
      });
    } catch (emailErr) {
      console.log("Email error:", emailErr.message);
    }
  }

  req.flash("success", "Participant accepted!");
  res.redirect(`/tournaments/${req.params.id}`);
});

// Reject applicant
router.patch("/:id/applicants/:uid/reject", isLoggedIn, isOrganiser, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  const applicant = tournament.applicants.find(
    a => a.player.equals(req.params.uid)
  );
  if (applicant) {
    applicant.status = "rejected";
    await tournament.save();
  }
  req.flash("success", "Applicant rejected.");
  res.redirect(`/tournaments/${req.params.id}`);
});

// Withdraw application (player only, pending only)
router.delete("/:id/withdraw", isLoggedIn, isPlayer, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  const app = tournament.applicants.find(a => a.player.equals(req.user._id));

  if (!app) {
    req.flash("error", "You haven't applied to this tournament.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  if (app.status !== "pending") {
    req.flash("error", "You can only withdraw a pending application.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  tournament.applicants = tournament.applicants.filter(
    a => !a.player.equals(req.user._id)
  );
  await tournament.save();

  req.flash("success", "Application withdrawn.");
  res.redirect(`/tournaments/${req.params.id}`);
});

module.exports = router;