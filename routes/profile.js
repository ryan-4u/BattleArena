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

// Report a user profile
router.post("/:id/report", isLoggedIn, async (req, res) => {
  const { reason } = req.body;

  if (req.params.id === req.user._id.toString()) {
    req.flash("error", "You cannot report your own profile.");
    return res.redirect(`/profile/${req.params.id}`);
  }

  const profileUser = await User.findById(req.params.id);
  if (!profileUser) {
    req.flash("error", "User not found.");
    return res.redirect("/tournaments");
  }

  const alreadyReported = profileUser.profileReports.some(
    r => r.reportedBy.equals(req.user._id)
  );

  if (alreadyReported) {
    req.flash("error", "You have already reported this profile.");
    return res.redirect(`/profile/${req.params.id}`);
  }

  await User.findByIdAndUpdate(req.params.id, {
    $push: { profileReports: { reportedBy: req.user._id, reason: reason || "" } }
  });

  req.flash("success", "Profile reported. Admin will review.");
  res.redirect(`/profile/${req.params.id}`);
});

module.exports = router;