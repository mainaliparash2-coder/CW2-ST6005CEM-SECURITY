const LoginAttempt = require("../models/LoginAttempt");

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes

exports.checkBlocked = async (ip, email) => {
  const record = await LoginAttempt.findOne({ ip, email });

  if (record && record.blockedUntil && record.blockedUntil > Date.now()) {
    return true;
  }

  return false;
};

exports.recordFailedAttempt = async (ip, email) => {
  const record = await LoginAttempt.findOne({ ip, email });

  if (!record) {
    await LoginAttempt.create({ ip, email });
    return;
  }

  record.attempts += 1;
  record.lastAttemptAt = Date.now();

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = new Date(Date.now() + BLOCK_TIME);
  }

  await record.save();
};

exports.resetAttempts = async (ip, email) => {
  await LoginAttempt.deleteOne({ ip, email });
};
