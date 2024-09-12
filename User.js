const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subreddits: {
    type: [String],
    default: [],
  },
});

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
