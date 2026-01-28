const Admin = require("../models/Admin");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

// Admin Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });

    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = await admin.generateAuthToken();

    // Set cookie
    res.cookie("AdminToken", token, {
      expires: new Date(Date.now() + 86400000), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


// Admin Register (for creating new admins - superadmin only)
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()
      });
    }

    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role: role || 'admin'
    });

    await newAdmin.save();

    res.status(201).json({
      status: true,
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};
