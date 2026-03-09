require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Tournament = require("../models/tournament");

// Home — landing page
router.get("/", async (req, res) => {
  const featuredTournaments = await Tournament.find({
    status: { $in: ["ongoing", "upcoming"] }
  }).limit(4).sort({ createdAt: -1 });

  const totalTournaments = await Tournament.countDocuments();
  const totalPlayers     = await User.countDocuments({ role: "player" });
  const completed        = await Tournament.countDocuments({ status: "completed" });

  res.render("landing", {
    featuredTournaments,
    stats: {
      tournaments: totalTournaments,
      players: totalPlayers,
      completed: completed,
      prizeTotal: 80
    }
  });
});

// Register
router.get("/register", (req, res) => res.render("auth/register"));

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, role, gameUsername, bio } = req.body;
    const user = new User({ username, email, role, gameUsername, bio });
    const registered = await User.register(user, password);
    req.login(registered, err => {
      if (err) return next(err);
      req.flash("success", `Welcome to BattleArena, ${registered.username}!`);
      res.redirect("/tournaments");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// Login
router.get("/login", (req, res) => res.render("auth/login"));

router.post("/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    res.redirect("/tournaments");
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/login");
  });
});

module.exports = router;