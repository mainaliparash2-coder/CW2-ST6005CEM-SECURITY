


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





