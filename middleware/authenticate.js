const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secretKey = process.env.SECRET_KEY;

const authenticate = async function(req, res, next) {
  try {
    // const token = await req.cookies.AmazonClone;
    // const verifyToken = await jwt.verify(token, secretKey);
    // const rootUser = await User.findOne({ _id: verifyToken._id });

    // if (!rootUser) {
    //   throw new Error("User not found");
    // }


      const token = req.cookies.AmazonClone;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const verifyToken = jwt.verify(token, secretKey);

    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token  
    });

    if (!rootUser) {
      return res.status(401).json({ message: "Token is invalid or logged out" });
    }


    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    next();

  } catch (error) {
    res.status(400).json({
      status: false,
      message: "No token provided",
      error: error
    })
  }
} 

module.exports = authenticate;