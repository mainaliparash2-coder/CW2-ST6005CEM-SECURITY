// Admin authorization middleware
// File: /middleware/isAdmin.js

const isAdmin = async function(req, res, next) {
  try {
    // Check if user exists (from authenticate middleware)
    if (!req.rootUser) {
      return res.status(401).json({
        status: false,
        message: "Authentication required"
      });
    }

    // Check if user has admin role
    if (req.rootUser.role !== 'admin') {
      return res.status(403).json({
        status: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Authorization error"
    });
  }
};

module.exports = isAdmin;
