// Libraries
const router = require('express').Router();
const { check } = require('express-validator');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/authenticateAdmin');

// Controllers
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');

// ===== ADMIN AUTHENTICATION ROUTES =====

// Admin Login
router.post('/auth/login', [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required')
], adminController.login);

// Admin Register (Superadmin only)
router.post('/auth/register', authenticateAdmin, requireSuperAdmin, [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
], adminController.register);

// Admin Logout
router.post('/auth/logout', authenticateAdmin, adminController.logout);

// Get Admin Profile
router.get('/auth/profile', authenticateAdmin, adminController.getProfile);

// Update Admin Profile
router.put('/auth/profile', authenticateAdmin, adminController.updateProfile);

// Change Password
router.post('/auth/change-password', authenticateAdmin, [
  check('currentPassword').notEmpty().withMessage('Current password is required'),
  check('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain a number')
], adminController.changePassword);

// ===== PRODUCT MANAGEMENT ROUTES =====

// Get all products (with pagination, search, filters)
router.get('/products', authenticateAdmin, productController.getAllProducts);

// Get single product
router.get('/products/:id', authenticateAdmin, productController.getProductById);

// Create new product
router.post('/products', authenticateAdmin, [
  check('id').isNumeric().withMessage('Product ID must be numeric'),
  check('name').notEmpty().withMessage('Product name is required'),
  check('price').notEmpty().withMessage('Price is required'),
  check('url').notEmpty().withMessage('Image URL is required')
], productController.createProduct);

// Update product
router.put('/products/:id', authenticateAdmin, productController.updateProduct);

// Delete product
router.delete('/products/:id', authenticateAdmin, productController.deleteProduct);

// Bulk delete products
router.post('/products/bulk-delete', authenticateAdmin, productController.bulkDeleteProducts);

// Get product statistics
router.get('/stats/products', authenticateAdmin, productController.getProductStats);

// ===== ORDER MANAGEMENT ROUTES =====

// Get all orders (with pagination, search, filters)
router.get('/orders', authenticateAdmin, orderController.getAllOrders);

// Get single order
router.get('/orders/:id', authenticateAdmin, orderController.getOrderById);

// Get orders by user ID
router.get('/orders/user/:userId', authenticateAdmin, orderController.getOrdersByUserId);

// Update order status
router.put('/orders/:id/status', authenticateAdmin, orderController.updateOrderStatus);

// Update payment status
router.put('/orders/:id/payment', authenticateAdmin, orderController.updatePaymentStatus);

// Cancel order
router.post('/orders/:id/cancel', authenticateAdmin, orderController.cancelOrder);

// Delete order (cleanup only)
router.delete('/orders/:id', authenticateAdmin, requireSuperAdmin, orderController.deleteOrder);

// Get order statistics
router.get('/stats/orders', authenticateAdmin, orderController.getOrderStats);

// Get revenue analytics
router.get('/analytics/revenue', authenticateAdmin, orderController.getRevenueAnalytics);

// ===== USER MANAGEMENT ROUTES =====

// Get all users
router.get('/users', authenticateAdmin, adminController.getAllUsers);

// Get single user
router.get('/users/:id', authenticateAdmin, adminController.getUserById);

// Get user statistics
router.get('/stats/users', authenticateAdmin, adminController.getUserStats);

// Delete user
router.delete('/users/:id', authenticateAdmin, requireSuperAdmin, adminController.deleteUser);

// ===== ADMIN MANAGEMENT ROUTES (Superadmin only) =====

// Get all admins
router.get('/admins', authenticateAdmin, requireSuperAdmin, adminController.getAllAdmins);

// Toggle admin active status
router.patch('/admins/:id/toggle-status', authenticateAdmin, requireSuperAdmin, adminController.toggleAdminStatus);

// Delete admin
router.delete('/admins/:id', authenticateAdmin, requireSuperAdmin, adminController.deleteAdmin);

// ===== DASHBOARD STATS =====

// Get dashboard overview
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get stats from all controllers
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const User = require('../models/User');

    const [totalProducts, totalOrders, totalUsers, pendingOrders, recentOrders, totalRevenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.status(200).json({
      status: true,
      dashboard: {
        totalProducts,
        totalOrders,
        totalUsers,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;