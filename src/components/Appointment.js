import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";

function Appointment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    contact: "",
    email: "",
    address: "",
    disease: "",
    appointmentDate: "",
    appointmentTime: ""
  });

  // 12-hour Time State
  const [time12h, setTime12h] = useState({
    hour: "10",
    minute: "00",
    period: "AM"
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (location.state?.disease) {
      setFormData(prev => ({
        ...prev,
        disease: location.state.disease
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const newTime = { ...time12h, [name]: value };
    setTime12h(newTime);
    
    // Convert to 24h for backend (HH:mm)
    let hours24 = parseInt(newTime.hour);
    if (newTime.period === "PM" && hours24 < 12) hours24 += 12;
    if (newTime.period === "AM" && hours24 === 12) hours24 = 0;
    
    const formattedHours = hours24.toString().padStart(2, '0');
    const formattedTime = `${formattedHours}:${newTime.minute}`;
    
    setFormData(prev => ({
      ...prev,
      appointmentTime: formattedTime
    }));
  };

  // Set default time on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      appointmentTime: "10:00"
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("jwtToken");
      const headers = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Save data for the success modal before clearing the form
        setSubmittedData({ 
          ...formData, 
          timeDisplay: `${time12h.hour}:${time12h.minute} ${time12h.period}` 
        });
        setShowSuccess(true);
        
        // Form is cleared below, but submittedData persists for the modal
        setFormData({
          fullName: "",
          age: "",
          gender: "",
          contact: "",
          email: "",
          address: "",
          disease: "",
          appointmentDate: "",
          appointmentTime: ""
        });
      } else {
        alert("Failed to save appointment.");
      }
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert("Could not connect to the server.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="appointment-page">

      <div className="appointment-hero">
        <h1>Book an Appointment</h1>
      </div>

      <div className="appointment-card">
        <div style={{ marginBottom: "30px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px" }}>
          <button
            className="global-back-btn"
            onClick={() => {
              if (location.state?.fromSymptoms) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            type="button"
          >
            {location.state?.fromSymptoms ? "← Back to Assessment" : "← Back to Home"}
          </button>
        </div>
        <form className="appointment-form" onSubmit={handleSubmit}>

          {/* ROW 1 */}
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-user"></i> Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><i className="fa-solid fa-cake-candles"></i> Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-venus-mars"></i> Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label><i className="fa-solid fa-phone"></i> Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ROW 3 */}
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><i className="fa-solid fa-location-dot"></i> Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* DISEASE */}
          <div className="form-group">
            <label><i className="fa-solid fa-hand-holding-medical"></i> Disease / Problem</label>
            <input
              type="text"
              name="disease"
              value={formData.disease}
              onChange={handleChange}
              required
            />
          </div>

          {/* DATE & TIME */}
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-calendar-days"></i> Appointment Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><i className="fa-solid fa-clock"></i> Appointment Time</label>
              <div className="time-select-group">
                <select name="hour" value={time12h.hour} onChange={handleTimeChange} className="time-unit">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h.toString().padStart(2, '0')}>{h}</option>
                  ))}
                </select>
                <span className="time-sep">:</span>
                <select name="minute" value={time12h.minute} onChange={handleTimeChange} className="time-unit">
                  {Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select name="period" value={time12h.period} onChange={handleTimeChange} className="time-period">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="submit-container">
            <button type="submit" className="primary-btn">
              <i className="fa-solid fa-paper-plane"></i> Submit Appointment
            </button>
          </div>

        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && submittedData && (
        <div className="modal-overlay">
          <div className="modal success-modal-premium">
            <div className="success-icon-wrapper">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            
            <div className="success-content-header">
              <h2>Appointment Submitted Successfully</h2>
              <p>Please wait. You will receive a confirmation email from the hospital on your Gmail once your appointment has been reviewed and confirmed.</p>
            </div>

            <div className="patient-summary-card">
              <div className="summary-item">
                <span className="label">Patient Name</span>
                <span className="value">{submittedData.fullName}</span>
              </div>
              <div className="summary-split">
                <div className="summary-item">
                  <span className="label">Date</span>
                  <span className="value">{formatDate(submittedData.appointmentDate)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Time</span>
                  <span className="value">{submittedData.timeDisplay}</span>
                </div>
              </div>
              <div className="summary-item">
                <span className="label">Contact Number</span>
                <span className="value">{submittedData.contact}</span>
              </div>
            </div>

            <div className="success-modal-actions">
              <button 
                className="confirm-btn-primary" 
                onClick={() => setShowSuccess(false)}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>
                Book Another Appointment
              </button>
              <button 
                className="confirm-btn-secondary" 
                onClick={() => navigate("/")}
              >
                <i className="fa-solid fa-house" style={{ marginRight: '8px' }}></i>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Appointment;