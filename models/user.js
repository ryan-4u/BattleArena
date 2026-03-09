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
    enum: ["player", "organiser", "admin"],
    default: "player"
  },
  gameUsername: { type: String, trim: true, default: "" },
  bio:          { type: String, maxlength: 300, default: "" },
  banned:       { type: Boolean, default: false },
  banReason:    { type: String, default: "" },
  tournamentsJoined:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }],
  tournamentsOrganised: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }]
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);