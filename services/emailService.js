const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send OTP email
async function sendOTP(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Amazon Clone - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #232F3E;">Email Verification</h2>
          <p>Thank you for registering with Amazon Clone!</p>
          <p>Your OTP for email verification is:</p>
          <h1 style="background-color: #FF9900; color: white; padding: 20px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </h1>
          <p style="color: #666;">This OTP will expire in 5 minutes.</p>
          <p style="color: #666;">If you didn't request this verification, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Amazon Clone - E-commerce Platform</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw error;
  }
}

module.exports = { sendOTP };