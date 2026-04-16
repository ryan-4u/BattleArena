const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  appliedAt: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  postedAt: { type: Date, default: Date.now }
});

const tournamentSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  game:        { type: String, required: true, trim: true },
  sportCategory: {
    type: String,
    enum: ["battle-royale", "fps-shooter", "chess", "badminton", "coding", "offline-sport", "other"],
    default: "battle-royale"
  },
  description: { type: String, required: true },
  mode: {
    type: String,
    enum: ["Solo", "Duo", "Squad", "1v1", "Team", "Individual"],
    required: true
  },
  tournamentFormat: {
    type: String,
    enum: ["simple", "bracket"],
    default: "bracket"
  },
  prizePool:            { type: String, default: "No Prize" },
  entryFee:             { type: Number, default: 0 },
  maxPlayers:           { type: Number, required: true },
  startDate:            { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  rules:                { type: String, default: "" },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },
  organiser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applicants: [applicantSchema],

  // Room credentials removed

  blocked:       { type: Boolean, default: false },
  blockedReason: { type: String, default: "" },

  announcements: [announcementSchema],

  // Bracket fields
  bracketGenerated: { type: Boolean, default: false },
  totalRounds:      { type: Number, default: 0 },

  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  winnerDeclaredAt: { type: Date, default: null },

  resultSupports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  resultReports:  [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reason: { type: String, default: "" } }]
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);