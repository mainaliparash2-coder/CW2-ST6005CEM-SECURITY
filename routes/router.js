// Libraries
const router = require("express").Router();
const Product = require("../models/Product");
const User = require("../models/User");
const Razorpay = require("razorpay");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const { check, validationResult } = require("express-validator");
const loginLimiter = require("../middleware/rateLimitor");
const OTP = require("../models/Otp");
const { sendOTP } = require("../services/emailService");
const PendingUser = require("../models/PendingUser");
// Get products API
router.get("/products", async function (req, res) {
  try {
    // Fetching data from database
    const productsData = await Product.find();
    res.status(200).json(productsData);
  } catch (error) {
    console.log(error);
  }
});

// Get individual data
router.get("/product/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const individualData = await Product.findOne({ id: id });
    res.status(200).json(individualData);
  } catch (error) {
    console.log(error);
  }
});

// Post register data
router.post(
  "/register",
  [
    // Check Validation of Fields
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name can't be empty")
      .trim()
      .escape(),

    check("number")
      .not()
      .isEmpty()
      .withMessage("Number can't be empty")
      .isNumeric()
      .withMessage("Number must only consist of digits")
      .isLength({ max: 10, min: 10 })
      .withMessage("Number must consist of 10 digits"),

    // check('password').not().isEmpty().withMessage("Password can't be empty")
    //   .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    //   .matches(/\d/).withMessage("Password must contain a number")
    //   .isAlphanumeric().withMessage("Password can only contain alphabets and numbers"),
    // FIXED: STRONG PASSWORD VALIDATION
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password can't be empty")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&#]/)
      .withMessage("Password must contain at least one special character"),

    check("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm Password can't be empty"),

    check("email")
      .not()
      .isEmpty()
      .withMessage("Email can't be empty")
      .isEmail()
      .withMessage("Email format is invalid")
      .normalizeEmail(),
  ],
  async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array(),
      });
    } else {
      const { name, number, email, password, confirmPassword } = req.body;
      const errors = [];

      // Check Duplicate Emails
      User.findOne({ email: email }, function (err, duplicateEmail) {
        if (err) {
          console.log(err);
        } else {
          if (duplicateEmail) {
            errors.push({ msg: "Please Check Your Credentials Below" });
            return res.status(400).json({
              status: false,
              message: errors,
            });
          } else {
            // Check Duplicate Numbers
            User.findOne(
              { number: number },
              async function (err, duplicateNumber) {
                if (err) {
                  console.log(err);
                } else {
                  if (duplicateNumber) {
                    errors.push({ msg: "Invalid Data" });
                    return res.status(400).json({
                      status: false,
                      message: errors,
                    });
                  } else {
                    // Check if Passwords Match
                    if (password != confirmPassword) {
                      errors.push({ msg: "Passwords don't match" });
                      return res.status(400).json({
                        status: false,
                        message: errors,
                      });
                    } else {
                      // Hashing the password
                      const saltRounds = 10;
                      const salt = await bcrypt.genSalt(saltRounds);
                      const hashedPassword = await bcrypt.hash(password, salt);

                      // //buggy code > created user beore otp was verified
                      // const newUser = new User({
                      //   name: name,
                      //   number: number,
                      //   email: email,
                      //   password: hashedPassword
                      // })

                      // const savedUser = await newUser.save();
                      // res.status(201).json(savedUser);

                      //after fixing otp
                      const otpCode = Math.floor(
                        100000 + Math.random() * 900000
                      ).toString();

                      await PendingUser.create({
                        name,
                        number,
                        email,
                        password: hashedPassword,
                        otp: otpCode,
                        otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
                      });

                      await sendOTP(email, otpCode);

                      return res.status(201).json({
                        status: true,
                        message: "OTP sent. Verify to complete registration.",
                        email,
                      });
                    }
                  }
                }
              }
            );
          }
        }
      });
    }
  }
);
router.post("/verify-otp", async function (req, res) {
  const { email, otp } = req.body;

  try {
    const pending = await PendingUser.findOne({ email, otp });

    if (!pending) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    // Now create the real user
    const newUser = new User({
      name: pending.name,
      number: pending.number,
      email: pending.email,
      password: pending.password,
      role: "user",
      isVerified: true,
    });

    await newUser.save();

    // Delete pending record
    await PendingUser.deleteOne({ email });

    return res.status(200).json({
      status: true,
      message: "Email verified! Account created.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Verification failed" });
  }
});

// Post registered data / login
// router.post('/login', loginLimiter, [
//   // Check fields validation
//   check('email').not().isEmpty().withMessage("Email can't be empty")
//     .isEmail().withMessage("Email format invalid")
//     .normalizeEmail(),

//   // check('password').not().isEmpty().withMessage("Password can't be empty")
//   //                 .isLength({min: 6}).withMessage("Password must be at least 6 characters long")
//   //                 .matches(/\d/).withMessage("Password must contain a number")
//   //                 .isAlphanumeric().withMessage("Password can only contain alphabets and numbers")
//   // FIXED: STRONG PASSWORD VALIDATION
//   check('password')
//     .not().isEmpty().withMessage("Password can't be empty")
//     .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
//     .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
//     .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
//     .matches(/[0-9]/).withMessage("Password must contain at least one number")
//     .matches(/[@$!%*?&#]/).withMessage("Password must contain at least one special character"),

// ], async function (req, res) {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       "status": false,
//       "message": errors.array()
//     })
//   } else {
//     const { email, password } = req.body;
//     const errors = [];

//     // Check if email exists
//     User.findOne({ email: email }, async function (err, found) {
//       if (err) {
//         console.log(err);
//       } else {
//         if (!found) {
//           errors.push({ msg: "Incorrect Email or Password" });
//           return res.status(400).json({
//             "status": false,
//             "message": errors
//           })

//         } else {
//           // Comparing the password
//           bcrypt.compare(password, found.password, async function (err, result) {
//             if (result) {

//               // Token generation
//               const token = await found.generateAuthToken();

//               // Cookie generation
//               res.cookie("AmazonClone", token, {
//                 expires: new Date(Date.now() + 3600000), // 60 Mins
//                 httpOnly: true,

//               });

//               //  res.cookie("AmazonClone", token, {
//               //   expires: new Date(Date.now() + 3600000), // 60 Mins
//               //   httpOnly: true,
//               //   secure: true,      // only works on HTTPS
//               //   sameSite: "strict" // prevents cross-site attacks
//               // });

//               return res.status(201).json({
//                 "status": true,
//                 "message": "Logged in successfully!"
//               })
//             } else {
//               errors.push({ msg: "Incorrect Email or Password" });
//               return res.status(400).json({
//                 "status": false,
//                 "message": errors
//               })
//             }
//           });

//         }
//       }
//     })
//   }
// })

router.post(
  "/login",
  loginLimiter,
  [
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email can't be empty")
      .isEmail()
      .withMessage("Email format invalid")
      .normalizeEmail(),

    check("password")
      .not()
      .isEmpty()
      .withMessage("Password can't be empty")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&#]/)
      .withMessage("Password must contain at least one special character"),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.array(),
      });
    }

    const { email, password } = req.body;
    const errorArr = [];

    try {
      const found = await User.findOne({ email });

      if (!found) {
        errorArr.push({ msg: "Invalid Credentials" });
        return res.status(400).json({
          status: false,
          message: errorArr,
        });
      }

      // ✅ FIX: Block unverified users
      if (!found.isVerified) {
        return res.status(403).json({
          status: false,
          message: [{ msg: "Please verify your email before logging in." }],
        });
      }

      const isMatch = await bcrypt.compare(password, found.password);

      if (!isMatch) {
        errorArr.push({ msg: "Invalid Credentials" });
        return res.status(400).json({
          status: false,
          message: errorArr,
        });
      }

      // Generate JWT token
      const token = await found.generateAuthToken();

      // ✅ Safer cookie
      res.cookie("AmazonClone", token, {
        expires: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes
        httpOnly: true,
        //       secure: true,
        // sameSite: "none"
      });

      //  res.cookie("AmazonClone", token, {
      //   expires: new Date(Date.now() + 3600000), // 60 Mins
      //   httpOnly: true,
      //   secure: true,      // only works on HTTPS por env production
      //   sameSite: "strict" // prevents cross-site attacks
      // });

      return res.status(201).json({
        status: true,
        message: "Logged in successfully!",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        message: "Login failed",
      });
    }
  }
);

// Adding items to cart
//bug
// router.post('/addtocart/:id', authenticate, async function(req, res) {
//   try {
//     const {id} = req.params; // Getting id from url parameters
//     const productInfo = await Product.findOne({ id: id });
//     // console.log(productInfo);

//     const userInfo = await User.findOne({ _id: req.userId }); // req.UserId from authenticate.js
//     // console.log(userInfo);

//     if (userInfo) {
//       let flag = true;

//       for (let i = 0; i < userInfo.cart.length; i++) {
//         // Incrementing qty by one if product already exists in cart
//         if (userInfo.cart[i].id == id) {
//           const test = await User.updateOne({ 'cart.id': id }, {
//             $inc: {
//               'cart.$.qty': 1
//             }
//           });
//           console.log(test);
//           flag = false;
//         }
//       }

//       if (flag) { // flag = true means the product is not in the cart
//         await userInfo.addToCart(id, productInfo); // Adding new product into cart
//       }

//       // const cartData = await userInfo.addToCart(id, productInfo);
//       // await userInfo.save();
//       // console.log(cartData);
//       res.status(201).json({
//         status: true,
//         message: userInfo
//       })
//     } else {
//       res.status(400).json({
//         status: false,
//         message: "Invalid User"
//       })
//     }

//   } catch (error) {
//     console.log(error);
//   }
// })

//fixed
router.post("/addtocart/:id", authenticate, async function (req, res) {
  try {
    const { id } = req.params;
    const productInfo = await Product.findOne({ id });

    const user = await User.findById(req.userId);
    const itemExists = user.cart.find((item) => item.id == id);

    if (itemExists) {
      await User.updateOne(
        { _id: req.userId, "cart.id": id }, // this line fixes the bug
        { $inc: { "cart.$.qty": 1 } }
      );
    } else {
      user.cart.push({
        id,
        qty: 1,
        cartItem: productInfo,
      });
      await user.save();
    }

    res.status(201).json({ status: true });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
});

// Delete items from cart
router.delete("/delete/:id", authenticate, async function (req, res) {
  try {
    const { id } = req.params;
    const userData = await User.findOne({ _id: req.userId });

    userData.cart = userData.cart.filter(function (cartItem) {
      return cartItem.id != id;
    });

    await userData.save();

    res.status(201).json({
      status: true,
      message: "Item deleted successfully",
    });

    console.log(userData);
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error,
    });
  }
});

// Logout
router.get("/logout", authenticate, async function (req, res) {
  try {
    // Deleting current token on logout from database
    req.rootUser.tokens = req.rootUser.tokens.filter(function (currentToken) {
      return currentToken.token !== req.token;
    });

    // Cookie expiration
    // await res.cookie("AmazonClone", {
    //   expires: Date.now()
    // });

    await res.clearCookie("AmazonClone");

    req.rootUser.save();

    return res.status(201).json({
      status: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error,
    });
  }
});

// Verify if user is logged in
router.get("/getAuthUser", authenticate, async function (req, res) {
  const userData = await User.findOne({ _id: req.userId });
  res.send(userData);
  // res.send({ status: true, message: "User is authenticated" });
});

// Razorpay
router.get("/get-razorpay-key", function (req, res) {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

//buggy code
// router.post("/create-order", authenticate, async function(req, res) {
//   try {
//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_SECRET
//     })
//     const options = {
//       amount: req.body.amount,
//       currency: 'INR'
//     }
//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       order: order
//     });

//   } catch (error) {
//     res.status(400).json(error);
//   }
// })

//fixed code
// Replace your /create-order route in router.js with this:

router.post("/create-order", authenticate, async function (req, res) {
  try {
    // Get user's cart from database
    const userInfo = await User.findOne({ _id: req.userId });

    if (!userInfo) {
      return res.status(400).json({ error: "User not found" });
    }

    // Calculate amount from DATABASE (not from client)
    let serverCalculatedAmount = 0;
    for (let item of userInfo.cart) {
      if (item.cartItem) {
        // Try accValue first, fallback to price
        let itemPrice =
          item.cartItem.accValue ||
          parseFloat(item.cartItem.price.replace(/,/g, ""));
        serverCalculatedAmount += item.qty * itemPrice;
      }
    }

    // Convert to paise
    const finalAmount = serverCalculatedAmount * 100;

    // Create Razorpay order with server-calculated amount
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: finalAmount,
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      order: order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({
      error: error.message,
    });
  }
});

// Replace your /create-order and /pay-order routes with this simple COD version:

router.post("/place-order-cod", authenticate, async function (req, res) {
  try {
    // Get user's cart from database
    const userInfo = await User.findOne({ _id: req.userId });

    if (!userInfo) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!userInfo.cart || userInfo.cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate amount from DATABASE
    let totalAmount = 0;
    const orderedProducts = [];

    for (let item of userInfo.cart) {
      if (item.cartItem) {
        let itemPrice =
          item.cartItem.accValue ||
          parseFloat(item.cartItem.price.replace(/,/g, ""));
        totalAmount += item.qty * itemPrice;

        orderedProducts.push({
          id: item.cartItem.id,
          name: item.cartItem.name,
          qty: item.qty,
          price: itemPrice,
          img: item.cartItem.url,
        });
      }
    }

    // Create order object
    const newOrder = {
      orderId: "ORD" + Date.now(), // Simple order ID
      orderInfo: {
        date: new Date().toLocaleDateString(),
        amount: totalAmount * 100, // Store in paise for consistency
        paymentMethod: "COD",
      },
      products: orderedProducts,
    };

    // Add order to user's orders array
    await userInfo.addOrder(newOrder);

    // Clear the cart
    userInfo.cart = [];
    await userInfo.save();

    res.status(200).json({
      status: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(400).json({
      status: false,
      error: error.message,
    });
  }
});

router.post("/pay-order", authenticate, async function (req, res) {
  try {
    const userInfo = await User.findOne({ _id: req.userId }); // req.UserId from authenticate.js

    const {
      amount,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      orderedProducts,
      dateOrdered,
    } = req.body;
    const newOrder = {
      products: orderedProducts,
      date: dateOrdered,
      isPaid: true,
      amount: amount,
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
    };

    // Saving order model into user model
    if (userInfo) {
      await userInfo.addOrder(newOrder);
    } else {
      res.status(400).json("Invalid user");
    }

    res.status(200).json({
      message: "Payment was successful",
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
