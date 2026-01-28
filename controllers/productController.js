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


// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { id, url, resUrl, price, value, accValue, discount, mrp, name, points } = req.body;

    // Check if product with same ID exists
    const existingProduct = await Product.findOne({ id: id });
    if (existingProduct) {
      return res.status(400).json({
        status: false,
        message: 'Product with this ID already exists'
      });
    }

    const newProduct = new Product({
      id,
      url,
      resUrl,
      price,
      value,
      accValue,
      discount,
      mrp,
      name,
      points: points || []
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      status: true,
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};


// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow changing the product ID
    delete updateData.id;
    delete updateData._id;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: parseInt(id) },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};


