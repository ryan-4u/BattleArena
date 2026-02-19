const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

// Register - Show Form
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

// Register - Handle Logic
router.post("/register", async (req, res) => {
    try {
        const { username, email, age, role, password } = req.body;
        const user = new User({ username, email, age, role });
        await User.register(user, password);
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