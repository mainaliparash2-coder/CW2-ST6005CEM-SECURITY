// Libraries
const mongoose = require("mongoose");
const db_url = process.env.DB_URL;

// Database Connection Function
const connectDB = async () => {
  try {
    await mongoose.connect(db_url);
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    process.exit(1);
  }
};

// Create initial admin function
const createInitialAdmin = async () => {
  try {
    const Admin = require("../models/Admin");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@amazon.com" });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists!");
      console.log("   Email: admin@amazon.com");
      return;
    }

    // Create new superadmin
    const admin = new Admin({
      name: "Super Admin",
      email: "admin@amazon.com",
      password: "admin123", // Will be hashed automatically
      role: "superadmin",
    });

    await admin.save();

    console.log("✅ Initial admin user created successfully!");
    console.log("====================================");
    console.log("Email: admin@amazon.com");
    console.log("Password: admin123");
    console.log("Role: superadmin");
    console.log("====================================");
  } catch (error) {
    console.error("⚠️  Error creating admin:", error.message);
  }
};

// Export functions
module.exports = { connectDB, createInitialAdmin };
