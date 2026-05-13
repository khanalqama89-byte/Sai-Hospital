import { useState } from "react";
import API_BASE_URL from "../apiConfig";

function AddStaff({ onBack, refreshStaff, setIsLoading }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "DOCTOR"
    });

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSuccessMsg("");
        setErrorMsg("");
        setLoading(true);
        if (setIsLoading) setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            setLoading(false);
            if (setIsLoading) setIsLoading(false);

            if (response.ok && data.success) {
                setSuccessMsg("Staff member successfully registered!");
                if (refreshStaff) refreshStaff();
                setTimeout(() => setSuccessMsg(""), 3000);
            } else {
                setErrorMsg(data.message || "Registration failed");
            }
        } catch (err) {
            setLoading(false);
            if (setIsLoading) setIsLoading(false);
            console.error("Signup error:", err);
            setErrorMsg("Failed to connect to the server.");
        }
    };

    return (
        <div className="add-staff-container">
            <div className="directory-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '30px', minHeight: '50px' }}>
                <button className="global-back-btn" onClick={onBack} style={{ position: 'absolute', left: 0 }}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <div className="title-group" style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0 }}>Add New Staff</h2>
                    <p style={{ margin: '5px 0 0 0' }}>Register hospital personnel into the clinical management system</p>
                </div>
            </div>

            <div className="premium-form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="form-card-header">
                    <i className="fa-solid fa-user-plus"></i>
                    <h3>Staff Registration Form</h3>
                </div>

                <div className="form-card-body">
                    {successMsg && (
                        <div className="status-toast success">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="status-toast error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="premium-compact-form">
                        <div className="form-grid-2">
                            <div className="premium-form-group">
                                <label>Full Name</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-user"></i>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="premium-form-group">
                                <label>Designation / Role</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-id-card"></i>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="NURSE">Nurse</option>
                                        <option value="LAB_STAFF">Lab Staff</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div className="premium-form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-envelope"></i>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="premium-form-group">
                                <label>Phone Number</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-phone"></i>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="Phone number"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="premium-form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Create Temporary Password</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-lock"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Initial login password"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                <p className="helper-text">Staff members should change their password upon their first login.</p>
                            </div>
                        </div>

                        <div className="form-actions-premium">
                            <button type="button" className="secondary-action-btn" onClick={onBack}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Registering...</>
                                ) : (
                                    <><i className="fa-solid fa-check-double"></i> Complete Registration</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddStaff;
