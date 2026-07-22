import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();
  return (
    <div className="about-page-wrapper">
      {/* HERO SECTION */}
      <div className="about-hero-premium" style={{ position: 'relative' }}>
        <button
          onClick={() => navigate(-1)}
          className="global-back-btn"
          style={{
            position: 'absolute',
            top: '20px',
            left: '30px'
          }}
        >
          ← Back
        </button>
        <div className="about-hero-content">
          <h1>About Sai Homoeopathic Clinic And Multispeciality Centre</h1>
          <p>Committed to providing world-class healthcare with compassion, excellence, and innovation.</p>
        </div>
      </div>

      <div className="about-modern-layout">

        {/* OUR STORY / MISSION */}
        <div className="about-mission-section">
          <h2>Our Mission</h2>
          <p>
            At Sai Homoeopathic Clinic And Multispeciality Centre, our mission is to improve the health and well-being of the communities we serve by providing high-quality, patient-centered care. We believe that everyone deserves access to state-of-the-art medical facilities and experienced, compassionate doctors. From routine check-ups to complex surgeries, we are here to support your journey to better health.
          </p>
        </div>

        {/* STATISTICS STRIP */}
        <div className="about-stats-container">
          <div className="stat-card">
            <h3>15+</h3>
            <p>Years Experience</p>
          </div>
          <div className="stat-card">
            <h3>50+</h3>
            <p>Expert Doctors</p>
          </div>
          <div className="stat-card">
            <h3>10k+</h3>
            <p>Happy Patients</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Emergency Care</p>
          </div>
        </div>

        {/* CORE VALUES / FEATURES */}
        <div className="about-values-section">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">👩‍⚕️</div>
              <h3>Expert Doctors</h3>
              <p>Our team consists of highly qualified and experienced medical professionals dedicated to your care.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🏥</div>
              <h3>Modern Facilities</h3>
              <p>Equipped with the latest medical technology to ensure accurate diagnoses and effective treatments.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Compassionate Care</h3>
              <p>We treat every patient like family, ensuring a comfortable and supportive healing environment.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;