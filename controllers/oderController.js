const Order = require("../models/Order");
const User = require("../models/User");

// Get all orders with pagination and filters
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      paymentStatus = '',
      search = '',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const query = {};
    
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'userDetails.name': { $regex: search, $options: 'i' } },
        { 'userDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const orders = await Order.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email number')
      .exec();

    const count = await Order.countDocuments(query);

    res.status(200).json({
      status: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id })
      .populate('userId', 'name email number');

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};


// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      orders,
      totalOrders: orders.length
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching user orders',
      error: error.message
    });
  }
};


// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, notes } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // If status is delivered, set delivery date
    if (orderStatus === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        status: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};


// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: id },
      { $set: { paymentStatus } },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        status: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Payment status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};
// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus === 'delivered') {
      return res.status(400).json({
        status: false,
        message: 'Cannot cancel delivered orders'
      });
    }

    order.orderStatus = 'cancelled';
    order.notes = reason || 'Cancelled by admin';
    await order.save();

    res.status(200).json({
      status: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};


// Delete order (admin only - for cleanup)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findOneAndDelete({ orderId: id });

    if (!deletedOrder) {
      return res.status(404).json({
        status: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Order deleted successfully',
      order: deletedOrder
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.status(200).json({
      status: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};