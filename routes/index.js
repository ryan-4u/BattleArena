const express = require("express");
const router = express.Router();

// Mount tournament routes
const tournamentRoutes = require("./tournaments.js");
const authRoutes = require("./auth.js");

// Home Page
router.get("/", (req, res) => {
    res.render('home.ejs');
});

// Auth Routes
router.use(authRoutes);

// Static Pages - FIXED PATHS
router.get("/about", (req, res) => {
    res.render("about.ejs");
});
router.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

// Tournament Routes
router.use("/tournaments", tournamentRoutes);

module.exports = router;