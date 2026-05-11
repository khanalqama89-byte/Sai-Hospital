import { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";

function ChangePassword({ onBack, setIsLoading }) {
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Reset
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);

    // In a real app, we'd fetch the logged-in user's email.
    // For now, we'll try to get it from localStorage or ask the user to confirm it.
    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage({ type: "error", text: "Email not found. Please log in again." });
            return;
        }

        setLoading(true);
        if (setIsLoading) setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setStep(2);
                setMessage({ type: "success", text: "OTP sent to your Gmail successfully." });
            } else {
                setMessage({ type: "error", text: data.message || "Failed to send OTP." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Server error. Please try again." });
        } finally {
            setLoading(false);
            if (setIsLoading) setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match!" });
            return;
        }

        setLoading(true);
        if (setIsLoading) setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setMessage({ type: "success", text: "Password changed successfully!" });
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => onBack(), 2000);
            } else {
                setMessage({ type: "error", text: data.message || "Failed to change password." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Server error. Please try again." });
        } finally {
            setLoading(false);
            if (setIsLoading) setIsLoading(false);
        }
    };

    return (
        <div className="add-staff-container">
            <div className="directory-header" style={{ marginBottom: '30px' }}>
                <div className="header-left">
                    <button className="global-back-btn" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <div className="title-group">
                        <h2>Account Security</h2>
                        <p>Manage your password and security settings</p>
                    </div>
                </div>
            </div>

            <div className="premium-form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="form-card-header">
                    <i className="fa-solid fa-shield-halved"></i>
                    <h3>Change Password</h3>
                </div>

                <div className="form-card-body">
                    {message.text && (
                        <div className={`status-toast ${message.type}`}>
                            <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                            <span>{message.text}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="premium-compact-form">
                            <div className="premium-form-group">
                                <label>Registered Gmail Address</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-envelope"></i>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your Gmail"
                                        required
                                    />
                                </div>
                                <p className="helper-text">We will send a 6-digit verification code to this email.</p>
                            </div>

                            <div className="form-actions-premium" style={{ border: 'none', paddingTop: 0 }}>
                                <button type="submit" className="primary-submit-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                                    {loading ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin"></i> Sending OTP...</>
                                    ) : (
                                        <><i className="fa-solid fa-paper-plane"></i> Send Verification Code</>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword} className="premium-compact-form">
                            <div className="premium-form-group">
                                <label>Verification Code (OTP)</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-key"></i>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        required
                                        maxLength="6"
                                    />
                                </div>
                            </div>

                            <div className="premium-form-group">
                                <label>New Password</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-lock"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        style={{ paddingRight: '70px' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="password-show-text"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div className="premium-form-group">
                                <label>Confirm New Password</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-lock"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions-premium" style={{ border: 'none', paddingTop: 0, gap: '10px' }}>
                                <button type="button" className="secondary-action-btn" onClick={() => setStep(1)} style={{ flex: 1 }}>
                                    Back
                                </button>
                                <button type="submit" className="primary-submit-btn" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                                    {loading ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin"></i> Resetting...</>
                                    ) : (
                                        <><i className="fa-solid fa-shield-check"></i> Update Password</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;
