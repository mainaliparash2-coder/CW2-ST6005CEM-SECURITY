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