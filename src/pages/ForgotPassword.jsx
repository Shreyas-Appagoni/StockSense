import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const handleSendOTP = (e) => {
    e.preventDefault();

    // Prototype OTP flow
    setStep(2);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();

    if (otp === "123456") {
      alert("OTP verified successfully!");
      navigate("/login");
    } else {
      alert("Invalid OTP. For this prototype use 123456.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          🔐
        </div>

        {step === 1 ? (
          <>
            <h1>Forgot Password?</h1>

            <p className="login-subtitle">
              Enter your email and we'll send you an OTP.
            </p>

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Send OTP
              </button>
            </form>

            <p className="signup-text">
              Remember your password?{" "}
              <button
                type="button"
                className="signup-link"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </p>
          </>
        ) : (
          <>
            <h1>Verify OTP</h1>

            <p className="login-subtitle">
              Enter the 6-digit OTP sent to your email.
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>OTP</label>

                <input
                  type="text"
                  placeholder="Enter 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Verify OTP
              </button>
            </form>

            <p className="signup-text">
              Didn't receive the OTP?{" "}
              <button
                type="button"
                className="signup-link"
                onClick={() => setStep(1)}
              >
                Try again
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;