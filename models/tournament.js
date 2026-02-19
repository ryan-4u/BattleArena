const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    game: String,
    mode: String,
    slots: Number,
    pool: String,
    timing: Date,
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // NEW FIELDS FOR JOIN SYSTEM
    joinRequests: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, default: "pending" } // pending, accepted, rejected
    }],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);