const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Configure Passport
passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) return done(null, false, { message: "User not found" });
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });
        
        if (user.isBlocked) return done(null, false, { message: "Your account is blocked" });
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Register - Show Form
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

// Register - Handle Logic
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, age, mobile, role } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            req.flash("error", "User already exists");
            return res.redirect("/register");
        }
        
        const newUser = new User({ username, email, password, age, mobile, role });
        await newUser.save();
        
        req.flash("success", "Welcome! Registration successful.");
        res.redirect("/tournaments");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/register");
    }
});

// Login - Show Form
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

// Login - Handle Logic
router.post("/login", 
    passport.authenticate("local", {
        successRedirect: "/tournaments",
        failureRedirect: "/login",
        failureFlash: true
    })
);

// Logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Goodbye!");
        res.redirect("/");
    });
});

module.exports = router;