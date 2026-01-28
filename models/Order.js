// Libraries
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  userDetails: {
    name: String,
    email: String,
    number: String
  },
  products: [
    {
      productId: Number,
      productDetails: {
        name: String,
        url: String,
        price: String,
        discount: String
      },
      quantity: {
        type: Number,
        default: 1
      },
      priceAtPurchase: String
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'card', 'upi'],
    default: 'razorpay'
  },
  razorpayDetails: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  trackingNumber: {
    type: String,
    default: null
  },
  deliveryDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate order ID
orderSchema.statics.generateOrderId = function() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
};

// Model
const Order = mongoose.model("orders", orderSchema);

// Export model
module.exports = Order;