const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // Max 5 attempts per IP in 15 minutes
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,     // Disable old headers

  message: {
    status: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
});

module.exports = loginLimiter;


