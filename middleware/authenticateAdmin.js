const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const adminSecretKey = process.env.ADMIN_SECRET_KEY || process.env.SECRET_KEY;

const authenticateAdmin = async function(req, res, next) {
  try {
    // Check for token in cookie or Authorization header
    let token = req.cookies.AdminToken;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      throw new Error("No authentication token provided");
    }

    // Verify token
    const verifyToken = jwt.verify(token, adminSecretKey);

    // Check if it's an admin token
    if (!verifyToken.isAdmin) {
      throw new Error("Not authorized as admin");
    }

    // Find admin user
    const adminUser = await Admin.findOne({ 
      _id: verifyToken._id,
      isActive: true
    });

    if (!adminUser) {
      throw new Error("Admin user not found or inactive");
    }

    // Attach admin info to request
    req.token = token;
    req.adminUser = adminUser;
    req.adminId = adminUser._id;
    req.adminRole = adminUser.role;

    next();

  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Authentication failed",
      error: error.message
    })
  }
}

// Middleware to check if admin is superadmin
const requireSuperAdmin = async function(req, res, next) {
  try {
    if (req.adminRole !== 'superadmin') {
      return res.status(403).json({
        status: false,
        message: "This action requires superadmin privileges"
      });
    }
    next();
  } catch (error) {
    res.status(403).json({
      status: false,
      message: "Authorization failed",
      error: error.message
    })
  }
}

module.exports = { authenticateAdmin, requireSuperAdmin };