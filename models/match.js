const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true
  },

  // "prelim", "R64", "R32", "R16", "QF", "SF", "Final"
  round: { type: String, required: true },
  roundNumber: { type: Number, required: true }, // 0 = prelim, 1 = R1, etc.
  matchNumber: { type: Number, required: true }, // position within the round

  player1: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Self-reported results
  player1Result: { type: String, enum: ["win", "loss", null], default: null },
  player2Result: { type: String, enum: ["win", "loss", null], default: null },

  status: {
    type: String,
    enum: ["pending", "confirmed", "conflict", "bye", "awaiting"], // awaiting = waiting for prev match winner
    default: "pending"
  },

  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Where winner advances to
  nextMatchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null },
  // Which slot in next match (1 or 2)
  nextMatchSlot: { type: Number, enum: [1, 2], default: null }

}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);