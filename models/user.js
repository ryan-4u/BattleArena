const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    mobile: {
        type: String,
        required: false  // Optional
    },
    role: {
        type: String,
        enum: ["player", "organiser", "admin"],
        default: "player"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// This automatically adds username, salt, hash (password) fields
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);