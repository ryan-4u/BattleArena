const express = require("express");
const router = express.Router();
const OrgApplication = require("../models/orgApplication");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// Show form or status page
router.get("/", isLoggedIn, async (req, res) => {
  // Already an organiser
  if (req.user.role === "organiser") {
    req.flash("error", "You are already an organiser.");
    return res.redirect("/profile");
  }

  // Check for existing application
  const existing = await OrgApplication.findOne({ applicant: req.user._id })
    .sort({ createdAt: -1 });

  // Has pending application
  if (existing && existing.status === "pending") {
    return res.render("organiser/status", { application: existing, status: "pending" });
  }

  // Was rejected — check 30 day cooldown
  if (existing && existing.status === "rejected") {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (existing.reviewedAt && existing.reviewedAt > thirtyDaysAgo) {
      return res.render("organiser/status", { application: existing, status: "rejected" });
    }
  }

  // Show application form
  res.render("organiser/apply");
});

// Submit application
router.post("/", isLoggedIn, async (req, res) => {
  if (req.user.role === "organiser") {
    req.flash("error", "You are already an organiser.");
    return res.redirect("/profile");
  }

  const {
    fullName, tournamentType, activity,
    hasExperience, experienceDetails,
    expectedParticipants, motivation,
    socialLink, agreedToCoC
  } = req.body;

  if (!agreedToCoC) {
    req.flash("error", "You must agree to the Organiser Code of Conduct.");
    return res.redirect("/become-organiser");
  }

  // Check no pending application exists
  const existing = await OrgApplication.findOne({
    applicant: req.user._id,
    status: "pending"
  });

  if (existing) {
    req.flash("error", "You already have a pending application.");
    return res.redirect("/become-organiser");
  }

  await OrgApplication.create({
    applicant: req.user._id,
    fullName: fullName.trim(),
    tournamentType,
    activity: activity.trim(),
    hasExperience: hasExperience === "yes",
    experienceDetails: experienceDetails || "",
    expectedParticipants,
    motivation: motivation.trim(),
    socialLink: socialLink || "",
    agreedToCoC: true
  });

  req.flash("success", "Application submitted! Admin will review it shortly.");
  res.redirect("/become-organiser");
});

module.exports = router;