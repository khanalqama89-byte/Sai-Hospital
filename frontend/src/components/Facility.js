import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Facility() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { disease } = location.state || { disease: "General Medical" };

  return (
    <div className="home-page-modern" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="home-hero-modern" style={{ padding: "100px 20px 60px 20px", background: 'linear-gradient(135deg, #4054b2, #2f3fa0)', position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          className="global-back-btn"
          style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '30px'
          }}
        >
          ← Back to Services
        </button>
        <div className="hero-content-modern">
          <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>{disease} Facilities</h1>
          <p style={{ color: '#e0e7ff', fontSize: '16px' }}>Professional medical care and dedicated support at Sai Hospital.</p>
        </div>
      </div>

      <div style={{ padding: '60px 6%', maxWidth: '900px', margin: '0 auto' }}>
        <div className="treatment-card" style={{ padding: '40px', background: 'white', borderTop: '4px solid #4054b2' }}>
          <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>What we offer for {disease}</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#475569', marginBottom: '30px' }}>
            At Sai Hospital, our {disease} department is focused on providing personalized and effective care for every patient. 
            We use reliable medical practices and simple, effective equipment to ensure you receive the best attention possible in a 
            comfortable and friendly environment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
              <strong style={{ display: 'block', color: '#4054b2', marginBottom: '5px' }}>Expert Consultation</strong>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Direct access to our experienced doctors.</span>
            </div>
            <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
              <strong style={{ display: 'block', color: '#4054b2', marginBottom: '5px' }}>Modern Equipment</strong>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Essential medical tools for accurate diagnosis.</span>
            </div>
            <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
              <strong style={{ display: 'block', color: '#4054b2', marginBottom: '5px' }}>Compassionate Care</strong>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Friendly staff dedicated to your well-being.</span>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button className="primary-btn-large" onClick={() => navigate("/appointment", { state: { disease } })} style={{ padding: '12px 25px' }}>
              Book Appointment
            </button>
            <button className="secondary-btn-large" onClick={() => navigate("/")} style={{ padding: '12px 25px', color: '#4054b2', borderColor: '#4054b2', background: 'white' }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Facility;
