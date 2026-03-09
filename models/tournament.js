const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  game: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  mode: {
    type: String,
    enum: ["Solo", "Duo", "Squad"],
    required: true
  },
  prizePool: { type: String, default: "No Prize" },
  entryFee: { type: Number, default: 0 },
  maxPlayers: { type: Number, required: true },
  startDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  rules: { type: String, default: "" },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },
  organiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  applicants: [applicantSchema],
  // Hidden from players unless accepted
  roomId: { type: String, default: "" },
  roomPassword: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);