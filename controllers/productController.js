const Product = require("../models/Product");

// Get all products with pagination and filters
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "id",
      order = "asc",
    } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { id: !isNaN(search) ? parseInt(search) : null },
          ],
        }
      : {};

    const sortOrder = order === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.status(200).json({
      status: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};
// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id: parseInt(id) });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};



