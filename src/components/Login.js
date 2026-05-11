import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

function Login({ setIsLoading }) {
  const navigate = useNavigate();

  const [showForgot, setShowForgot] = useState(false);
  const [remember, setRemember] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const remIdentifier = localStorage.getItem("rememberedIdentifier");
    if (remIdentifier) {
      setIdentifier(remIdentifier);
      setRemember(true);
    }
  }, []);

  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (setIsLoading) setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (remember) {
          localStorage.setItem("rememberedIdentifier", identifier);
        } else {
          localStorage.removeItem("rememberedIdentifier");
        }
        localStorage.setItem("userName", data.user); // Store name
        localStorage.setItem("userEmail", data.email); // Store email for password change
        localStorage.setItem("userRole", data.role); // Store role
        localStorage.setItem("jwtToken", data.token); // Store token
        localStorage.setItem("adminActiveTab", "appointments"); // Reset to dashboard on login
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Failed to connect to the server.");
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  // ================= RESET FLOW =================
  const handleSendOtp = async () => {
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      setError(true);
      setTimeout(() => setError(false), 400);
      alert("Please enter a valid email address.");
      return;
    }

    if (setIsLoading) setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      if (setIsLoading) setIsLoading(false);

      if (response.ok && data.success) {
        setResetMessage(data.message);
        setResetStep(2); // Move to OTP step
      } else {
        alert(data.message || "Failed to send reset link");
      }
    } catch (err) {
      if (setIsLoading) setIsLoading(false);
      console.error("Forgot password error:", err);
      alert("Failed to connect to the server.");
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!resetOtp.trim() || !resetNewPassword.trim()) {
      setError(true);
      setTimeout(() => setError(false), 400);
      return;
    }

    if (setIsLoading) setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword: resetNewPassword
        })
      });

      const data = await response.json();
      if (setIsLoading) setIsLoading(false);

      if (response.ok && data.success) {
        setShowForgot(false);
        setResetStep(1);
        setResetEmail("");
        setResetOtp("");
        setResetNewPassword("");
        setResetMessage("");
        setToast(true);
        setTimeout(() => setToast(false), 3000);
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (err) {
      setLoading(false);
      console.error("Reset error:", err);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="admin-login-wrapper">

      <div className="admin-login-card">
        <div className="login-right">
          <div className="login-header-section">
            <button
              type="button"
              className="global-back-btn"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
            <h2>Admin Login</h2>
            <p>Access the hospital management dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email or Phone Number</label>
              <div className="input-container">
                <i className="fa-solid fa-envelope"></i>
                <input
                  name="identifier"
                  type="text"
                  placeholder="Enter email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-container">
                <i className="fa-solid fa-lock"></i>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle-text"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember Me
              </label>

              <span
                className="forgot-link"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" className="primary-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {toast && (
        <div className="toast">
          ✅ Password reset successfully!
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="modal-overlay">
          <div className={`modal ${error ? "shake" : ""}`}>

            <button
              className="modal-close"
              onClick={() => {
                setShowForgot(false);
                setResetStep(1);
              }}
            >
              ✕
            </button>

            {resetStep === 1 ? (
              <>
                <h3>Reset Password</h3>
                <p>Enter your registered Gmail address to receive a 6-digit verification code.</p>

                <input
                  type="email"
                  placeholder="Enter your Gmail address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner"></span> : "Send OTP"}
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => setShowForgot(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Verify OTP and Reset</h3>
                <p>{resetMessage || `Enter the 6-digit code sent to your Gmail.`}</p>

                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  style={{ marginTop: "10px" }}
                />

                <div className="modal-actions" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleVerifyOtpAndReset}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner"></span> : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => setResetStep(1)}
                  >
                    Back
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default Login;