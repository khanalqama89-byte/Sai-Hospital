import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const treatments = [
    { title: "Allergy", desc: "Skin & seasonal allergy treatment" },
    { title: "Diabetes", desc: "Blood sugar management & care" },
    { title: "Hair Fall", desc: "Hair loss diagnosis & therapy" },
    { title: "Kidney Problem", desc: "Kidney disease treatment" },
    { title: "Heart Care", desc: "Cardiology consultation" },
    { title: "Fever & Infection", desc: "General physician support" },
    { title: "Asthma Care", desc: "Respiratory treatment & breathing support" },
    { title: "Orthopedic Care", desc: "Bone, joint & fracture treatment" },
    { title: "Skin Treatment", desc: "Dermatology & advanced skin solutions" },
    { title: "ENT Specialist", desc: "Ear, Nose & Throat consultation" },
    { title: "Gastro Care", desc: "Digestive system treatment" },
    { title: "Neurology", desc: "Brain & nervous system specialist care" }
  ];

  const handleCardClick = (problem) => {
    navigate("/appointment", { state: { disease: problem } });
  };

  return (
    <div className="home-page-modern">

      <div className="home-hero-modern">
        <div className="hero-content-modern">
          <h1>Welcome to <span className="highlight-text">Sai Hospital</span></h1>
          <span className="hero-badge">Caring for Life</span>
          <p>Experience advanced medical care with our trusted specialists and state-of-the-art facilities. Your health is our priority.</p>
          <div className="hero-buttons">
            <button className="primary-btn-large" onClick={() => navigate("/symptoms")}>Assess Your Symptoms 🩺</button>
            <button className="secondary-btn-large" onClick={() => document.querySelector('.treatment-section')?.scrollIntoView({ behavior: 'smooth' })}>Explore Services ↓</button>
          </div>
        </div>
      </div>

      <div className="treatment-section">
        <div className="section-header">
          <h2>Our Specialized Treatments</h2>
          <p>Comprehensive medical care tailored to your unique health needs, delivered by compassionate expert specialists.</p>
        </div>

        <div className="card-grid">
          {treatments.map((item, index) => (
            <div
              key={index}
              className="treatment-card"
              onClick={() => handleCardClick(item.title)}
            >
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="card-actions">
                <div
                  className="facility-option"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/facility", { state: { disease: item.title, description: item.desc } });
                  }}
                >
                  View Facilities <span style={{ fontSize: "12px", marginLeft: "4px" }}>→</span>
                </div>
                <button
                  className="primary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/appointment", { state: { disease: item.title } });
                  }}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;