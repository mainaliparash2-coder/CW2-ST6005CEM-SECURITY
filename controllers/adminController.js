const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Admin Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    
    if (!admin) {
      return res.status(401).json({
        status: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = await admin.generateAuthToken();

    // Set cookie
    res.cookie('AdminToken', token, {
      expires: new Date(Date.now() + 86400000), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      status: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Login failed',
      error: error.message
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

// Admin Logout
exports.logout = async (req, res) => {
  try {
    // Remove current token
    req.adminUser.tokens = req.adminUser.tokens.filter(
      tokenObj => tokenObj.token !== req.token
    );
    
    await req.adminUser.save();

    // Clear cookie
    res.clearCookie('AdminToken');

    res.status(200).json({
      status: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

  // Get current admin profile
  exports.getProfile = async (req, res) => {
    try {
      const admin = await Admin.findById(req.adminId).select('-password -tokens');
      
      res.status(200).json({
        status: true,
        admin
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  };

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      { $set: updateData },
      { new: true }
    ).select('-password -tokens');

    res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      admin
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.adminId);
    
    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword; // Will be hashed by pre-save middleware
    await admin.save();

    res.status(200).json({
      status: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// ===== User Management =====

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password -tokens')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ _id: -1 })
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      status: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -tokens');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const usersWithOrders = await User.countDocuments({
      'orders.0': { $exists: true }
    });

    const usersWithCart = await User.countDocuments({
      'cart.0': { $exists: true }
    });

    const recentUsers = await User.find()
      .select('-password -tokens')
      .sort({ _id: -1 })
      .limit(10);

    res.status(200).json({
      status: true,
      stats: {
        totalUsers,
        usersWithOrders,
        usersWithCart,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ===== Admin Management (Superadmin only) =====

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password -tokens');

    res.status(200).json({
      status: true,
      admins
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};

// Toggle admin active status
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: 'Admin not found'
      });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      status: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error updating admin status',
      error: error.message
    });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.adminId.toString()) {
      return res.status(400).json({
        status: false,
        message: 'Cannot delete your own account'
      });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({
        status: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
};