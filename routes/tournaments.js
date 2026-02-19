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

// Player clicks "Join" button
router.post("/:id/join", async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        
        // Check if already requested
        const alreadyRequested = tournament.joinRequests.find(
            r => r.player.toString() === req.body.userId // You'll get this from auth later
        );
        
        if (alreadyRequested) {
            return res.send("You have already requested to join this tournament");
        }
        
        // Add player to joinRequests
        tournament.joinRequests.push({ player: req.body.userId, status: "pending" });
        await tournament.save();
        
        res.redirect(`/tournaments/${req.params.id}`);
    } catch (err) {
        console.log(err);
        res.send("Error joining tournament");
    }
});

// Organiser views requests for their tournament
router.get("/:id/requests", async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate("joinRequests.player", "username email");
        
        res.render("tournaments/requests.ejs", { tournament });
    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});

// Organiser accepts or rejects a player
router.put("/:id/requests/:playerId", async (req, res) => {
    try {
        const { id, playerId } = req.params;
        const { action } = req.body; // action = "accepted" or "rejected"
        
        const tournament = await Tournament.findById(id);
        const request = tournament.joinRequests.find(r => r.player.toString() === playerId);
        
        if (request) {
            request.status = action;
            
            // If accepted, add to participants
            if (action === "accepted") {
                tournament.participants.push(playerId);
            }
            
            await tournament.save();
        }
        
        res.redirect(`/tournaments/${id}/requests`);
    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});

module.exports = router;