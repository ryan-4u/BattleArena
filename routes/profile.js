const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");
const nodemailer = require("nodemailer");

// ── EMAIL HELPER ──────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, username, purpose) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: `"BattleArena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: purpose === "email-change"
      ? "Verify your new email — BattleArena"
      : "Verify your identity — BattleArena",
    html: `
      <div style="font-family:Arial,sans-serif; max-width:480px; margin:0 auto;
        background:#050d1a; color:#e2e8f0; padding:32px;
        border:1px solid rgba(56,189,248,0.2);">
        <h2 style="font-family:monospace; color:#38bdf8; letter-spacing:0.1em; margin-bottom:8px;">
          ⬡ BATTLEARENA
        </h2>
        <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:24px;">
          Hey <strong style="color:#38bdf8;">${username}</strong>,
          use this OTP to ${purpose === "email-change" ? "verify your new email address" : "verify your identity"}.
          Expires in <strong>10 minutes</strong>.
        </p>
        <div style="text-align:center; background:rgba(56,189,248,0.06);
          border:1px solid rgba(56,189,248,0.3); padding:24px; margin-bottom:24px;">
          <div style="font-family:monospace; font-size:2.5rem; font-weight:900;
            letter-spacing:0.4em; color:#38bdf8;">${otp}</div>
        </div>
        <p style="font-size:0.75rem; color:#475569;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `
  });
}

// ── OWN PROFILE ───────────────────────────────────────────
router.get("/", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("tournamentsJoined")
    .populate("tournamentsOrganised")
    .populate("tournamentsWon");
  res.render("profile/show", { profileUser: user, isOwn: true });
});

// ── EDIT FORM ─────────────────────────────────────────────
router.get("/edit", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("profile/edit", { profileUser: user });
});

// ── UPDATE BASIC INFO ─────────────────────────────────────
router.put("/edit", isLoggedIn, async (req, res) => {
  const { username, gameUsername, bio } = req.body;

  // Check username taken by someone else
  if (username && username !== req.user.username) {
    const existing = await User.findOne({ username });
    if (existing) {
      req.flash("error", "Username already taken.");
      return res.redirect("/profile/edit");
    }
  }

  await User.findByIdAndUpdate(req.user._id, {
    username: username || req.user.username,
    gameUsername: gameUsername || "",
    bio: bio || ""
  });

  req.flash("success", "Profile updated!");
  res.redirect("/profile");
});

router.post("/change-password", isLoggedIn, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    req.flash("error", "New passwords do not match.");
    return res.redirect("/profile/edit");
  }

  if (newPassword.length < 6) {
    req.flash("error", "New password must be at least 6 characters.");
    return res.redirect("/profile/edit");
  }

  try {
    const user = await User.findById(req.user._id);

    user.authenticate(currentPassword, async (err, authenticatedUser) => {
      if (err || !authenticatedUser) {
        req.flash("error", "Current password is incorrect.");
        return res.redirect("/profile/edit");
      }

      await user.setPassword(newPassword);
      await user.save();

      // Re-login with updated user so session stays valid
      req.login(user, (loginErr) => {
        if (loginErr) {
          req.flash("error", "Password changed but session error. Please login again.");
          return res.redirect("/login");
        }
        req.flash("success", "Password changed successfully.");
        res.redirect("/profile");
      });
    });
  } catch (e) {
    console.error("Password change error:", e.message);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/profile/edit");
  }
});

// ── SEND EMAIL CHANGE OTP ─────────────────────────────────
router.post("/change-email/send-otp", isLoggedIn, async (req, res) => {
  const { newEmail } = req.body;

  if (!newEmail || !newEmail.includes("@")) {
    req.flash("error", "Please enter a valid email address.");
    return res.redirect("/profile/edit");
  }

  const newEmailClean = newEmail.toLowerCase().trim();

  if (newEmailClean === req.user.email) {
    req.flash("error", "This is already your current email.");
    return res.redirect("/profile/edit");
  }

  const existing = await User.findOne({ email: newEmailClean });
  if (existing) {
    req.flash("error", "This email is already in use.");
    return res.redirect("/profile/edit");
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  req.session.emailChange = {
    newEmail: newEmailClean,
    otp,
    otpExpiry,
    attempts: 0
  };

  try {
    await sendOTPEmail(newEmailClean, otp, req.user.username, "email-change");
    req.flash("success", `OTP sent to ${newEmailClean}. Enter it below to confirm.`);
  } catch (e) {
    req.flash("error", "Failed to send OTP. Please try again.");
  }

  res.redirect("/profile/edit");
});

// ── VERIFY EMAIL CHANGE OTP ───────────────────────────────
router.post("/change-email/verify", isLoggedIn, async (req, res) => {
  const { otp } = req.body;
  const pending = req.session.emailChange;

  if (!pending) {
    req.flash("error", "No email change request found. Please start again.");
    return res.redirect("/profile/edit");
  }

  if (pending.attempts >= 3) {
    req.session.emailChange = null;
    req.flash("error", "Too many incorrect attempts. Please start again.");
    return res.redirect("/profile/edit");
  }

  if (new Date() > new Date(pending.otpExpiry)) {
    req.session.emailChange = null;
    req.flash("error", "OTP expired. Please start again.");
    return res.redirect("/profile/edit");
  }

  if (otp.trim() !== pending.otp) {
    req.session.emailChange.attempts += 1;
    const remaining = 3 - req.session.emailChange.attempts;
    req.flash("error", `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
    return res.redirect("/profile/edit");
  }

  await User.findByIdAndUpdate(req.user._id, { email: pending.newEmail });
  req.session.emailChange = null;

  req.flash("success", `Email updated to ${pending.newEmail}.`);
  res.redirect("/profile");
});

// ── VIEW ANY PROFILE ──────────────────────────────────────
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

// ── REPORT PROFILE ────────────────────────────────────────
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