


// Post register data
router.post('/register', [
  // Check Validation of Fields
  check('name').not().isEmpty().withMessage("Name can't be empty")
    .trim().escape(),

  check('number').not().isEmpty().withMessage("Number can't be empty")
    .isNumeric().withMessage("Number must only consist of digits")
    .isLength({ max: 10, min: 10 }).withMessage('Number must consist of 10 digits'),

  check('password').not().isEmpty().withMessage("Password can't be empty")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/\d/).withMessage("Password must contain a number")
    .isAlphanumeric().withMessage("Password can only contain alphabets and numbers"),

  check('confirmPassword').not().isEmpty().withMessage("Confirm Password can't be empty"),

  check('email').not().isEmpty().withMessage("Email can't be empty")
    .isEmail().withMessage("Email format is invalid")
    .normalizeEmail()

], async function (req, res) {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      "status": false,
      "message": errors.array()
    });
  }

  // ❌ VULNERABLE: Accept role from client without validation
  const { name, number, email, password, confirmPassword, role } = req.body;
  const validationErrors = [];

  try {
    // Check Duplicate Emails
    const duplicateEmail = await User.findOne({ email: email });

    if (duplicateEmail) {
      validationErrors.push({ msg: "Email already registered" });
      return res.status(400).json({
        "status": false,
        "message": validationErrors
      });
    }

    // Check Duplicate Numbers
    const duplicateNumber = await User.findOne({ number: number });

    if (duplicateNumber) {
      validationErrors.push({ msg: "Number already registered" });
      return res.status(400).json({
        "status": false,
        "message": validationErrors
      });
    }

    // Check if Passwords Match
    if (password != confirmPassword) {
      validationErrors.push({ msg: "Passwords don't match" });
      return res.status(400).json({
        "status": false,
        "message": validationErrors
      });
    }

    // Hashing the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ❌ BUG 1: STORE USER DATA BEFORE OTP VERIFICATION
    // ❌ BUG 2: ACCEPT ROLE FROM CLIENT WITHOUT VALIDATION
    const newUser = new User({
      name: name,
      number: number,
      email: email,
      password: hashedPassword,
      role: role || 'user',  // ❌ Accepts client-provided role!
      isVerified: false  // ❌ Data stored but not verified yet!
    });

    const savedUser = await newUser.save();
    console.log("✅ User data stored in database (BEFORE OTP verification!)");

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    const newOTP = new OTP({
      email: email,
      otp: otp
    });
    await newOTP.save();
    console.log(`✅ OTP generated: ${otp}`);

    // Send OTP via email
    try {
      await sendOTP(email, otp);
      console.log(`✅ OTP sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // ❌ Even if email fails, user data is already in DB!
    }

    return res.status(201).json({
      "status": true,
      "message": "Registration initiated. Please verify your email with the OTP sent.",
      "email": email,
      "userId": savedUser._id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      "status": false,
      "message": "Registration failed"
    });
  }
});

// Verify OTP
router.post('/verify-otp', async function (req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      "status": false,
      "message": "Email and OTP are required"
    });
  }

  try {
    // Find OTP record
    const otpRecord = await OTP.findOne({ email: email, otp: otp });

    if (!otpRecord) {
      return res.status(400).json({
        "status": false,
        "message": "Invalid or expired OTP"
      });
    }

    // ❌ Update user as verified (but data was already in DB!)
    const updatedUser = await User.updateOne(
      { email: email },
      { $set: { isVerified: true } }
    );

    if (updatedUser.modifiedCount === 0) {
      return res.status(400).json({
        "status": false,
        "message": "User not found"
      });
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ email: email });

    console.log(`✅ Email verified for: ${email}`);

    return res.status(200).json({
      "status": true,
      "message": "Email verified successfully! You can now login."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      "status": false,
      "message": "Verification failed"
    });
  }
});



// Post registered data / login 
router.post('/login', [
  // Check fields validation
  check('email').not().isEmpty().withMessage("Email can't be empty")
    .isEmail().withMessage("Email format invalid")
    .normalizeEmail(),

  check('password').not().isEmpty().withMessage("Password can't be empty")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/\d/).withMessage("Password must contain a number")
    .isAlphanumeric().withMessage("Password can only contain alphabets and numbers")

], async function (req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      "status": false,
      "message": errors.array()
    })
  } else {
    const { email, password } = req.body;
    const errors = [];

    // Check if email exists
    User.findOne({ email: email }, async function (err, found) {
      if (err) {
        console.log(err);
      } else {
        if (!found) {
          errors.push({ msg: "Incorrect Email or Password" });
          return res.status(400).json({
            "status": false,
            "message": errors
          })
        } else {


          // Comparing the password
          bcrypt.compare(password, found.password, async function (err, result) {
            if (result) {

              // Token generation
              const token = await found.generateAuthToken();
              console.log("Token generated")

              // Cookie generation
              res.cookie("AmazonClone", token, {
                expires: new Date(Date.now() + 3600000), // 60 Mins
                httpOnly: true,
                strict: true,
                sameSite: strict
              });

              return res.status(201).json({
                "status": true,
                "message": "Logged in successfully!",
                "token": token
              })
            } else {
              errors.push({ msg: "Incorrect Email or Password" });
              return res.status(400).json({
                "status": false,
                "message": errors
              })
            }
          });

        }
      }
    })
  }
})



// Logout 
router.get("/logout", authenticate, async function (req, res) {
  try {

    // Deleting current token on logout from database
    req.rootUser.tokens = req.rootUser.tokens.filter(function (currentToken) {
      return currentToken.token !== req.token
    })

    // Cookie expiration
    await res.cookie("AmazonClone", {
      expires: Date.now()
    });

    req.rootUser.save();

    return res.status(201).json({
      "status": true,
      "message": "Logged out successfully!"
    })
  } catch (error) {
    res.status(400).json({
      "status": false,
      "message": error
    })
  }
})

// // Verify if user is logged in
router.get('/getAuthUser', authenticate, async function (req, res) {
  const userData = await User.findOne({ _id: req.userId });
  res.send(userData);
});

router.get("/get-razorpay-key", function (req, res) {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

// router.post("/create-order", authenticate, async function (req, res) {
//   try {
//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_SECRET,
//     });
//     // It trusts the price of the goods blindly from client sid
//     const options = {
//       amount: req.body.amount,
//       currency: "INR",
//     };
//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       order: order,
//     });
//   } catch (error) {
//     res.status(400).json(error);
//   }
// });


router.post("/create-order", authenticate, async function (req, res) {
  try {
    // FIX STEP 1: Get user's cart from DATABASE (not from client)
    const userInfo = await User.findOne({ _id: req.userId });

    if (!userInfo) {
      return res.status(400).json({ error: "User not found" });
    }

    // FIX STEP 2: Calculate amount on SERVER side
    let serverCalculatedAmount = 0;
    for (let item of userInfo.cart) {
      // ✅ Use actual prices from database
      // ✅ Multiply by quantity from database
      serverCalculatedAmount += item.qty * item.cartItem.accValue;
    }

    // Convert to paise (Razorpay uses smallest currency unit)
    const finalAmount = serverCalculatedAmount + "00";

    // FIX STEP 3: Compare client amount with server calculation (optional validation)
    const clientAmount = req.body.amount;
    if (clientAmount !== finalAmount) {
      console.log("🚨 PRICE MANIPULATION DETECTED!");
      console.log("Client sent:", clientAmount);
      console.log("Real amount:", finalAmount);
      console.log("User:", req.userId);

      return res.status(400).json({
        error: "Price mismatch detected",
        message: "The amount provided does not match your cart total",
      });
    }

    // FIX STEP 4: Create order with SERVER-CALCULATED amount
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: finalAmount,
      // ✅ SECURE: Using server-calculated amount, not client's
      // ✅ Based on database prices, not JavaScript variables
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
