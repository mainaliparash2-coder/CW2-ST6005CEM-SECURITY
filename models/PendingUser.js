// VULNERABLE VERSION - PendingUser model (actually this is the FIXED version)
// For vulnerable implementation, we skip this and save directly to User model

const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpiry: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes
  }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
