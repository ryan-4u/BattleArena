const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// Own profile
router.get("/", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("tournamentsJoined")
    .populate("tournamentsOrganised")
    .populate("tournamentsWon");
  res.render("profile/show", { profileUser: user, isOwn: true });
});

// Edit profile form
router.get("/edit", isLoggedIn, (req, res) => {
  res.render("profile/edit", { profileUser: req.user });
});

// Update profile
router.put("/edit", isLoggedIn, async (req, res) => {
  const { gameUsername, bio } = req.body;
  await User.findByIdAndUpdate(req.user._id, { gameUsername, bio });
  req.flash("success", "Profile updated!");
  res.redirect("/profile");
});

// View any player profile
router.get("/:id", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("tournamentsJoined")
    .populate("tournamentsOrganised")
    .populate("tournamentsWon");
  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/tournaments");
  }
  res.render("profile/show", { profileUser: user, isOwn: false });
});

module.exports = router;