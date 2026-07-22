import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/generate-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        setOtpSent(true);
        alert(data.message || "OTP sent to your email!");
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setLoading(false);
      console.error("OTP generation error:", err);
      alert("Failed to connect to the server.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData, otp };
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        localStorage.setItem("jwtToken", data.token); // Store token
        alert("Account created successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      setLoading(false);
      console.error("Signup error:", err);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="admin-login-wrapper">

      {/* HEADER */}
      <header className="admin-header">
        <div className="logo">Sai Homoeopathic Clinic And Multispeciality Centre</div>
        <nav className="header-links">
          <a href="/">Home</a>
        </nav>
      </header>

      <div className="admin-login-card">

        {/* CENTERED SECTION */}
        <div className="login-right">
          <h2>Sign Up</h2>
          <p>Create your account to access the hospital management system</p>

          {!otpSent ? (
            <form className="login-form" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-container">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
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

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                type="button"
                className="global-back-btn"
                style={{ width: "100%", justifyContent: "center", marginTop: "15px" }}
                onClick={() => navigate("/")}
              >
                ← Back to Home
              </button>

              <p className="signup-link" style={{ textAlign: "center", marginTop: "15px" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>
                  Sign In
                </Link>
              </p>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSignup}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Verifying..." : "Create Account"}
              </button>
              <button
                type="button"
                className="global-back-btn"
                style={{ marginTop: '15px', width: '100%', justifyContent: 'center' }}
                onClick={() => setOtpSent(false)}
                disabled={loading}
              >
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;