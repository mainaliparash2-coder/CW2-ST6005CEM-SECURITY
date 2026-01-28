import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import axios from "axios";
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./login-register.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state (passed from SignUp)
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // If no email, redirect back to register
  React.useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  async function verifyOTP(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/verify-otp",
        {
          email: email,
          otp: otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        // Hide error, show success
        document.querySelector(".error-alert").style.display = "none";
        document.querySelector(".success-alert").style.display = "flex";

        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        document.querySelector(".success-alert").style.display = "none";
        document.querySelector(".error-alert").style.display = "flex";

        const errors = error.response.data.message;
        if (typeof errors === "string") {
          setErrorMessage([errors]);
        } else if (Array.isArray(errors)) {
          const temp = errors.map((err) => err.msg || err);
          setErrorMessage(temp);
        } else {
          setErrorMessage(["Verification failed. Please try again."]);
        }
      }
    }
  }

  function handleOTPChange(e) {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  }

  return (
    <div className="signin verify-otp">
      <NavLink to="/" className="logo">
        <img src="images/logo-dark.png" alt="logo" />
      </NavLink>

      <Alert
        variant="outlined"
        severity="warning"
        className="alert error-alert"
      >
        <AlertTitle className="alert-title">Verification Error</AlertTitle>
        <ul>
          {errorMessage.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </Alert>

      <Alert
        variant="outlined"
        severity="success"
        className="alert success-alert"
      >
        ✅ Email verified successfully! Redirecting to login...
      </Alert>

      <div className="form-details">
        <h3>Verify Your Email</h3>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          We've sent a 6-digit OTP to
          <br />
          <strong>{email}</strong>
        </p>

        <form method="POST" onSubmit={verifyOTP}>
          <label htmlFor="otp">Enter OTP</label>
          <input
            type="text"
            name="otp"
            id="otp"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={handleOTPChange}
            maxLength={6}
            required
            autoFocus
            style={{
              fontSize: "24px",
              letterSpacing: "8px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />

          <button
            type="submit"
            id="submit"
            disabled={isLoading || otp.length !== 6}
            style={{
              opacity: isLoading || otp.length !== 6 ? 0.6 : 1,
              cursor: isLoading || otp.length !== 6 ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="already-have-account" style={{ marginTop: "20px" }}>
          <p>
            Didn't receive the code?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Resend OTP feature coming soon!");
              }}
              style={{
                color: "#007185",
                textDecoration: "none",
                marginLeft: "5px",
              }}
            >
              Resend OTP
            </a>
          </p>
          <p>
            <NavLink to="/register">Back to Registration</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
