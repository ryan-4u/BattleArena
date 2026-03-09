const express = require("express");
const router = express.Router();
const Tournament = require("../models/tournament");
const { isLoggedIn, isOrganiser, isTournamentOwner } = require("../middleware");

// INDEX
router.get("/", async (req, res) => {
  const { search, game, status } = req.query;
  let filter = { blocked: false }; // hide blocked tournaments
  if (search) filter.title = { $regex: search, $options: "i" };
  if (game)   filter.game  = { $regex: game,   $options: "i" };
  if (status) filter.status = status;

  const tournaments = await Tournament.find(filter).populate("organiser").sort({ createdAt: -1 });
  res.render("tournaments/index", { tournaments, query: req.query });
});

// NEW
router.get("/new", isLoggedIn, isOrganiser, (req, res) => {
  res.render("tournaments/new");
});

// CREATE
router.post("/", isLoggedIn, isOrganiser, async (req, res) => {
  try {
    const t = new Tournament({ ...req.body.tournament, organiser: req.user._id });
    await t.save();
    req.user.tournamentsOrganised.push(t._id);
    await req.user.save();
    req.flash("success", "Tournament created successfully!");
    res.redirect(`/tournaments/${t._id}`);
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/tournaments/new");
  }
});

// SHOW
router.get("/:id", async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate("organiser")
    .populate("applicants.player");

  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  // If blocked and viewer is not organiser or admin — deny access
  if (tournament.blocked) {
    const isOwner = req.user && tournament.organiser._id.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      req.flash("error", "This tournament has been removed by an admin.");
      return res.redirect("/tournaments");
    }
  }

  let isAccepted = false;
  if (req.user) {
    const entry = tournament.applicants.find(
      a => a.player && a.player._id.equals(req.user._id) && a.status === "accepted"
    );
    isAccepted = !!entry;
  }

  res.render("tournaments/show", { tournament, isAccepted });
});

// EDIT
router.get("/:id/edit", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  res.render("tournaments/edit", { tournament });
});

// UPDATE
router.put("/:id", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  await Tournament.findByIdAndUpdate(req.params.id, { ...req.body.tournament });
  req.flash("success", "Tournament updated!");
  res.redirect(`/tournaments/${req.params.id}`);
});

// DELETE
router.delete("/:id", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  await Tournament.findByIdAndDelete(req.params.id);
  req.flash("success", "Tournament deleted.");
  res.redirect("/tournaments");
});

module.exports = router;