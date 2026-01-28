// Libraries
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
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
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Token generation for admin
const adminSecretKey = process.env.ADMIN_SECRET_KEY || process.env.SECRET_KEY;
adminSchema.methods.generateAuthToken = async function() {
  try {
    const token = jwt.sign({ 
      _id: this._id, 
      role: this.role,
      isAdmin: true 
    }, adminSecretKey, {
      expiresIn: '24h'
    });
    this.tokens = this.tokens.concat({token: token});
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

// Model
const Admin = mongoose.model("admins", adminSchema);

// Export model
module.exports = Admin;