const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default || require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ["player", "organiser"],
    default: "player"
  },
  gameUsername: {
    type: String,
    trim: true,
    default: ""
  },
  bio: {
    type: String,
    maxlength: 300,
    default: ""
  },
  tournamentsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }],
  tournamentsOrganised: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament"
  }]
}, { timestamps: true });

// Adds username, hash, salt fields + Passport methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);