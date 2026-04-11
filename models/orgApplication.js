const mongoose = require("mongoose");

const orgApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fullName: { type: String, required: true, trim: true },
  tournamentType: { type: String, required: true },
  activity: { type: String, required: true, trim: true },
  hasExperience: { type: Boolean, default: false },
  experienceDetails: { type: String, default: "" },
  expectedParticipants: { type: String, required: true },
  motivation: { type: String, required: true },
  socialLink: { type: String, default: "" },
  agreedToCoC: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  rejectionReason: { type: String, default: "" },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("OrgApplication", orgApplicationSchema);