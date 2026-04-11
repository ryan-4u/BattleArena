if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Tournament = require("../models/tournament");
const nodemailer = require("nodemailer");

// ── EMAIL HELPER ──────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, username) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"BattleArena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your BattleArena account",
    html: `
      <div style="font-family:Arial,sans-serif; max-width:480px; margin:0 auto; background:#050d1a; color:#e2e8f0; padding:32px; border:1px solid rgba(56,189,248,0.2);">
        <h2 style="font-family:monospace; color:#38bdf8; letter-spacing:0.1em; margin-bottom:8px;">
          ⬡ BATTLEARENA
        </h2>
        <p style="color:#64748b; font-size:0.85rem; margin-bottom:24px;">Email Verification</p>
        <p style="margin-bottom:8px;">Hey <strong style="color:#38bdf8;">${username}</strong>,</p>
        <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:24px;">
          Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="text-align:center; background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.3); padding:24px; margin-bottom:24px;">
          <div style="font-family:monospace; font-size:2.5rem; font-weight:900; letter-spacing:0.4em; color:#38bdf8;">
            ${otp}
          </div>
        </div>
        <p style="font-size:0.75rem; color:#475569;">
          If you didn't create a BattleArena account, ignore this email.
        </p>
      </div>
    `
  });
}

// ── LANDING ───────────────────────────────────────────────
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
      completed,
      prizeTotal: 80
    }
  });
});

// ── REGISTER ──────────────────────────────────────────────
router.get("/register", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/tournaments");
  res.render("auth/register");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, gameUsername, bio } = req.body;

    // Check username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("error", "Username already taken.");
      return res.redirect("/register");
    }

    // Check email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/register");
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending user data in session — NOT in DB yet
    req.session.pendingUser = {
      username,
      email: email.toLowerCase().trim(),
      password,
      gameUsername: gameUsername || "",
      bio: bio || "",
      otp,
      otpExpiry,
      attempts: 0,
      resendCount: 0
    };

    // Send OTP email
    await sendOTPEmail(email, otp, username);

    req.flash("success", `OTP sent to ${email}. Enter it below to activate your account.`);
    res.redirect("/verify-email");
  } catch (e) {
    console.error("Register error:", e.message);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/register");
  }
});

// ── VERIFY EMAIL ──────────────────────────────────────────
router.get("/verify-email", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/tournaments");
  if (!req.session.pendingUser) {
    req.flash("error", "No pending registration found. Please register first.");
    return res.redirect("/register");
  }
  res.render("auth/verify-email", {
    email: req.session.pendingUser.email,
    resendCount: req.session.pendingUser.resendCount || 0
  });
});

router.post("/verify-email", async (req, res, next) => {
  const pending = req.session.pendingUser;

  if (!pending) {
    req.flash("error", "Session expired. Please register again.");
    return res.redirect("/register");
  }

  const { otp } = req.body;

  // Check attempts
  if (pending.attempts >= 3) {
    req.session.pendingUser = null;
    req.flash("error", "Too many incorrect attempts. Please register again.");
    return res.redirect("/register");
  }

  // Check expiry
  if (new Date() > new Date(pending.otpExpiry)) {
    req.session.pendingUser = null;
    req.flash("error", "OTP expired. Please register again.");
    return res.redirect("/register");
  }

  // Check OTP
  if (otp.trim() !== pending.otp) {
    req.session.pendingUser.attempts += 1;
    const remaining = 3 - req.session.pendingUser.attempts;
    req.flash("error", `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
    return res.redirect("/verify-email");
  }

  // OTP correct — create user in DB
  try {
    const user = new User({
      username: pending.username,
      email: pending.email,
      role: "player",
      gameUsername: pending.gameUsername,
      bio: pending.bio
    });

    const registered = await User.register(user, pending.password);

    // Clear pending session data
    req.session.pendingUser = null;

    // Log them in
    req.login(registered, err => {
      if (err) return next(err);
      req.flash("success", `Welcome to BattleArena, ${registered.username}! Your account is verified.`);
      res.redirect("/tournaments");
    });
  } catch (e) {
    console.error("User creation error:", e.message);
    req.flash("error", "Something went wrong creating your account. Please try again.");
    res.redirect("/register");
  }
});

// ── RESEND OTP ────────────────────────────────────────────
router.post("/resend-otp", async (req, res) => {
  const pending = req.session.pendingUser;

  if (!pending) {
    req.flash("error", "No pending registration. Please register again.");
    return res.redirect("/register");
  }

  if (pending.resendCount >= 3) {
    req.session.pendingUser = null;
    req.flash("error", "Maximum resend limit reached. Please register again.");
    return res.redirect("/register");
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  req.session.pendingUser.otp = otp;
  req.session.pendingUser.otpExpiry = otpExpiry;
  req.session.pendingUser.attempts = 0;
  req.session.pendingUser.resendCount += 1;

  try {
    await sendOTPEmail(pending.email, otp, pending.username);
    req.flash("success", `New OTP sent to ${pending.email}.`);
  } catch (e) {
    req.flash("error", "Failed to send OTP. Please try again.");
  }

  res.redirect("/verify-email");
});

// ── LOGIN ─────────────────────────────────────────────────
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/tournaments");
  res.render("auth/login");
});

router.post("/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  async (req, res) => {
    if (req.user.banned) {
      req.logout(err => { if (err) console.log(err); });
      return res.redirect("/banned?reason=" + encodeURIComponent(req.user.banReason || "Violation of terms."));
    }
    req.flash("success", `Welcome back, ${req.user.username}!`);
    res.redirect("/tournaments");
  }
);

// ── LOGOUT ────────────────────────────────────────────────
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/login");
  });
});

// ── BANNED ────────────────────────────────────────────────
router.get("/banned", (req, res) => {
  res.render("auth/banned", { query: req.query });
});

module.exports = router;