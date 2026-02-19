const express = require("express");
const router = express.Router();
// Use "../" to go up one folder, then into models
const Tournament = require("../models/tournament.js");

// 1. List all tournaments
router.get("/", async (req, res) => {
    try {
        const tournaments = await Tournament.find(); // Fetch from DB
        res.render("tournaments/index.ejs", { tournaments });
    } catch (err) {
        console.log(err);
        res.send("Error loading tournaments");
    }
});

// 2. Show form to create new tournament
router.get("/new", (req, res) => {
    res.render("tournaments/new.ejs");
});

// 3. Create tournament (handle form submit)
router.post("/", async (req, res) => {
    try {
        const newTournament = new Tournament(req.body.tournament);
        await newTournament.save();
        res.redirect("/tournaments");
    } catch (err) {
        console.log(err);
        res.send("Error creating tournament");
    }
});

// 4. Show single tournament details
router.get("/:id", async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        res.render("tournaments/show.ejs", { tournament });
    } catch (err) {
        console.log(err);
        res.send("Tournament not found");
    }
});

// 5. Delete tournament
router.delete("/:id", async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);
        res.redirect("/tournaments");
    } catch (err) {
        console.log(err);
        res.send("Error deleting tournament");
    }
});

module.exports = router;