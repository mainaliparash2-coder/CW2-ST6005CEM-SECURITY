const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true
  },

  email: {
    type: String,
    lowercase: true,
    index: true
  },

  attempts: {
    type: Number,
    default: 1
  },

  blockedUntil: {
    type: Date,
    default: null
  },

  lastAttemptAt: {
    type: Date,
    default: Date.now
  }
});

// 🔥 Auto-delete record after 24 hours (TTL index)
loginAttemptSchema.index(
  { lastAttemptAt: 1 },
  { expireAfterSeconds: 86400 }
);

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
