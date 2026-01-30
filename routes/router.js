// Libraries
const router = require("express").Router();
const Product = require("../models/Product");
const User = require("../models/User");
const Razorpay = require("razorpay");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const { check, validationResult } = require("express-validator");
const loginLimiter = require("../middleware/rateLimitor");
const { sendOTP } = require("../services/emailService");
const PendingUser = require("../models/PendingUser");

const getClientIp = require("../utils/getClientIp");
const {
  checkBlocked,
  recordFailedAttempt,
  resetAttempts,
} = require("../utils/bruteForce");

// ===========================
// PRODUCTS
// ===========================
router.get("/products", async function (req, res) {
  try {
    const productsData = await Product.find();
    res.status(200).json(productsData);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch products" });
  }
});

router.get("/product/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const individualData = await Product.findOne({ id: id });
    res.status(200).json(individualData);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch product" });
  }
});

// ===========================
// REGISTER (BUGGY vs FIXED)
// ===========================

/*
BUGGY IDEA (for demonstration):
- Creates user directly in User collection before OTP is verified.
- If user never verifies OTP, unverified accounts still exist in DB.

Example buggy flow:
1) Create User right away (isVerified: false)
2) Send OTP
3) Later update isVerified=true after OTP match
*/

// router.post("/register", [...validators], async function(req,res){
//   // ...validate
//   const { name, number, email, password } = req.body;
//   const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
//
//   // ❌ BUG: user saved BEFORE OTP verification
//   await User.create({
//     name, number, email,
//     password: hashed,
//     isVerified: false
//   });
//
//   const otp = generateOtp();
//   await OTP.create({ email, otp }); // OTP model usage
//   await sendOTP(email, otp);
//
//   return res.status(201).json({ status:true, message:"OTP sent" });
// });

router.post(
  "/register",
  [
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
    }

    const { name, number, email, password, confirmPassword } = req.body;
    const errArr = [];

    try {
      const duplicateEmail = await User.findOne({ email });
      if (duplicateEmail) {
        errArr.push({ msg: "Please Check Your Credentials Below" });
        return res.status(400).json({ status: false, message: errArr });
      }

      const duplicateNumber = await User.findOne({ number });
      if (duplicateNumber) {
        errArr.push({ msg: "Invalid Data" });
        return res.status(400).json({ status: false, message: errArr });
      }

      if (password !== confirmPassword) {
        errArr.push({ msg: "Passwords don't match" });
        return res.status(400).json({ status: false, message: errArr });
      }

      // Prevent multiple pending entries for same email
      await PendingUser.deleteMany({ email });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // ✅ FIX: store in PendingUser, not in User, until OTP verified
      await PendingUser.create({
        name,
        number,
        email,
        password: hashedPassword,
        otp: otpCode,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
      });

      await sendOTP(email, otpCode);

      return res.status(201).json({
        status: true,
        message: "OTP sent. Verify to complete registration.",
        email,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: false, message: "Registration failed" });
    }
  },
);

// ===========================
// VERIFY OTP (BUGGY vs FIXED)
// ===========================

/*
BUGGY IDEA (for demonstration):
- Only updates isVerified=true for an already-created User.
- This assumes user was saved before OTP verification, which is not ideal.

Example buggy verify:
1) Check OTP
2) Update User.isVerified=true
3) Delete OTP
*/

// router.post("/verify-otp", async (req,res)=>{
//   const { email, otp } = req.body;
//   const otpRecord = await OTP.findOne({ email, otp });
//   if (!otpRecord) return res.status(400).json({ status:false, message:"Invalid OTP" });
//
//   // ❌ BUG: user data already existed even before verification
//   await User.updateOne({ email }, { $set: { isVerified:true } });
//   await OTP.deleteOne({ email });
//   return res.json({ status:true, message:"Verified" });
// });

router.post("/verify-otp", async function (req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ status: false, message: "Email and OTP are required" });
  }

  try {
    const pending = await PendingUser.findOne({ email, otp });

    if (
      !pending ||
      (pending.otpExpiry && pending.otpExpiry.getTime() < Date.now())
    ) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    // ✅ FIX: create real user only after OTP is verified
    const newUser = new User({
      name: pending.name,
      number: pending.number,
      email: pending.email,
      password: pending.password,
      role: "user",
      isVerified: true,
    });

    await newUser.save();
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

// ===========================
// LOGIN (BUGGY vs FIXED)
// ===========================

/*
BUGGY IDEA (for demonstration):
- No brute-force protection (only basic limiter)
- Cookie not hardened with secure + sameSite
- May allow repeated password guessing

Example buggy login:
1) find user
2) compare password
3) set cookie (httpOnly only)
*/

// router.post("/login", loginLimiter, [...validators], async (req,res)=>{
//   const found = await User.findOne({ email });
//   if (!found) return res.status(400).json({ status:false, message:"Invalid" });
//   const ok = await bcrypt.compare(password, found.password);
//   if (!ok) return res.status(400).json({ status:false, message:"Invalid" });
//   const token = await found.generateAuthToken();
//   res.cookie("AmazonClone", token, { httpOnly:true });
//   return res.status(201).json({ status:true, message:"Logged in" });
// });

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
    const ip = getClientIp(req);

    try {
      // ✅ FIX: brute-force blocking
      const blocked = await checkBlocked(ip, email);
      if (blocked) {
        return res.status(429).json({
          status: false,
          message: [{ msg: "Too many login attempts. Try again later." }],
        });
      }

      const found = await User.findOne({ email });

      if (!found) {
        await recordFailedAttempt(ip, email);
        return res.status(400).json({
          status: false,
          message: [{ msg: "Invalid Credentials" }],
        });
      }

      if (!found.isVerified) {
        return res.status(403).json({
          status: false,
          message: [{ msg: "Please verify your email before logging in." }],
        });
      }

      const isMatch = await bcrypt.compare(password, found.password);

      if (!isMatch) {
        await recordFailedAttempt(ip, email);
        return res.status(400).json({
          status: false,
          message: [{ msg: "Invalid Credentials" }],
        });
      }

      await resetAttempts(ip, email);

      const token = await found.generateAuthToken();

      // ✅ FIX: hardened cookie (same domain safe)
      res.cookie("AmazonClone", token, {
        expires: new Date(Date.now() + 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

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
  },
);

// ===========================
// ADD TO CART (BUGGY vs FIXED)
// ===========================

/*
BUGGY IDEA (for demonstration):
- Update query missing user constraint could update wrong user's cart in some cases.

Example buggy update:
await User.updateOne({ "cart.id": id }, { $inc: { "cart.$.qty": 1 } });
*/

// router.post("/addtocart/:id", authenticate, async (req,res)=>{
//   const id = req.params.id;
//   const product = await Product.findOne({ id });
//   const userInfo = await User.findOne({ _id: req.userId });
//   for (let i=0;i<userInfo.cart.length;i++){
//     if (userInfo.cart[i].id == id) {
//       // ❌ BUG: missing _id: req.userId constraint
//       await User.updateOne({ "cart.id": id }, { $inc: { "cart.$.qty": 1 } });
//     }
//   }
// });

router.post("/addtocart/:id", authenticate, async function (req, res) {
  try {
    const { id } = req.params;
    const productInfo = await Product.findOne({ id });

    if (!productInfo) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    const user = await User.findById(req.userId);
    const itemExists = user.cart.find((item) => item.id == id);

    if (itemExists) {
      // ✅ FIX: constrain update to the authenticated user's document
      await User.updateOne(
        { _id: req.userId, "cart.id": id },
        { $inc: { "cart.$.qty": 1 } },
      );
    } else {
      user.cart.push({ id, qty: 1, cartItem: productInfo });
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
    req.rootUser.tokens = req.rootUser.tokens.filter(function (currentToken) {
      return currentToken.token !== req.token;
    });

    await res.clearCookie("AmazonClone");
    await req.rootUser.save();

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
});

// Razorpay
router.get("/get-razorpay-key", function (req, res) {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

// ===========================
// CREATE ORDER (BUGGY vs FIXED)
// ===========================

/*
BUGGY IDEA (for demonstration):
- Trusts amount sent from client (price manipulation possible)

Example buggy:
const options = { amount: req.body.amount, currency:"INR" };
*/

// router.post("/create-order", authenticate, async (req,res)=>{
//   const razorpay = new Razorpay({ key_id:..., key_secret:... });
//   const options = { amount: req.body.amount, currency: "INR" }; // ❌ BUG
//   const order = await razorpay.orders.create(options);
//   res.json({ order });
// });

router.post("/create-order", authenticate, async function (req, res) {
  try {
    const userInfo = await User.findOne({ _id: req.userId });

    if (!userInfo) {
      return res.status(400).json({ error: "User not found" });
    }

    let serverCalculatedAmount = 0;
    for (let item of userInfo.cart) {
      if (item.cartItem) {
        const itemPrice =
          item.cartItem.accValue ||
          parseFloat(String(item.cartItem.price || "0").replace(/,/g, ""));
        serverCalculatedAmount += item.qty * itemPrice;
      }
    }

    const finalAmount = Math.round(serverCalculatedAmount * 100);

    // Optional mismatch detection
    if (req.body.amount != null) {
      const clientAmount = Number(req.body.amount);
      if (!Number.isNaN(clientAmount) && clientAmount !== finalAmount) {
        return res.status(400).json({
          error: "Price mismatch detected",
          message: "The amount provided does not match your cart total",
        });
      }
    }

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

    res.status(200).json({ order });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ error: error.message });
  }
});

// COD order
router.post("/place-order-cod", authenticate, async function (req, res) {
  try {
    const userInfo = await User.findOne({ _id: req.userId });

    if (!userInfo) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!userInfo.cart || userInfo.cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderedProducts = [];

    for (let item of userInfo.cart) {
      if (item.cartItem) {
        const itemPrice =
          item.cartItem.accValue ||
          parseFloat(String(item.cartItem.price || "0").replace(/,/g, ""));
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

    const newOrder = {
      orderId: "ORD" + Date.now(),
      orderInfo: {
        date: new Date().toLocaleDateString(),
        amount: Math.round(totalAmount * 100),
        paymentMethod: "COD",
      },
      products: orderedProducts,
    };

    await userInfo.addOrder(newOrder);

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
    const userInfo = await User.findOne({ _id: req.userId });

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

    if (userInfo) {
      await userInfo.addOrder(newOrder);
    } else {
      return res.status(400).json("Invalid user");
    }

    res.status(200).json({
      message: "Payment was successful",
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
