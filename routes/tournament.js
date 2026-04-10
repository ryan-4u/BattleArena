const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Tournament = require("../models/tournament");
const { isLoggedIn, isOrganiser, isTournamentOwner } = require("../middleware");

// INDEX
router.get("/", async (req, res) => {
  const { search, game, status } = req.query;
  
  let filter = { blocked: false };
  if (search) filter.title = { $regex: search, $options: "i" };
  if (game)   filter.game  = { $regex: game,   $options: "i" };
  if (status) filter.status = status;

  const tournaments = await Tournament.aggregate([
    { $match: filter },
    {
      $addFields: {
        statusOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", "ongoing"]   }, then: 1 },
              { case: { $eq: ["$status", "upcoming"]  }, then: 2 },
              { case: { $eq: ["$status", "completed"] }, then: 3 },
            ],
            default: 4
          }
        }
      }
    },
    { $sort: { statusOrder: 1, startDate: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "organiser",
        foreignField: "_id",
        as: "organiser"
      }
    },
    { $unwind: "$organiser" }
  ]);

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
    .populate("applicants.player")
    .populate("winner");

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

// Update room details (organiser only)
router.patch("/:id/room", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  const { roomId, roomPassword } = req.body;

  if (!roomId || !roomPassword) {
    req.flash("error", "Both Room ID and Password are required.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  await Tournament.findByIdAndUpdate(req.params.id, {
    roomId:       roomId.trim(),
    roomPassword: roomPassword.trim()
  });

  req.flash("success", "Room details updated. Accepted players can now see them.");
  res.redirect(`/tournaments/${req.params.id}`);
});

// Declare winner — organiser only, ongoing tournaments
router.patch("/:id/declare-winner", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  const { winnerId } = req.body;

  if (!winnerId) {
    req.flash("error", "Please select a winner.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  if (tournament.status === "completed") {
    req.flash("error", "Winner has already been declared.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const isAcceptedPlayer = tournament.applicants.some(
    a => a.player.equals(winnerId) && a.status === "accepted"
  );

  if (!isAcceptedPlayer) {
    req.flash("error", "Selected winner must be an accepted participant.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const updated = await Tournament.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        winner: winnerId,
        winnerDeclaredAt: new Date(),
        status: "completed"
      }
    },
    { new: true }
  );

  await User.findByIdAndUpdate(winnerId, {
    $addToSet: { tournamentsWon: tournament._id }
  });

  req.flash("success", "Winner declared! Tournament is now completed.");
  res.redirect(`/tournaments/${req.params.id}`);
});

module.exports = router;