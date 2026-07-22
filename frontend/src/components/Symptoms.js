import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Symptoms() {
  const navigate = useNavigate();
  
  const [activeRegion, setActiveRegion] = useState('General');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [result, setResult] = useState(null);
  const [followup, setFollowup] = useState(null); // { question: '', options: [], symptom: '' }
  const [answers, setAnswers] = useState({});

  const regions = [
    { id: 'General', label: 'General', icon: 'fa-solid fa-house-medical' },
    { id: 'Head', label: 'Head & Neck', icon: 'fa-solid fa-head-side-virus' },
    { id: 'Chest', label: 'Chest & Resp.', icon: 'fa-solid fa-lungs' },
    { id: 'Digestive', label: 'Stomach', icon: 'fa-solid fa-notes-medical' },
    { id: 'Limbs', label: 'Joints & Skin', icon: 'fa-solid fa-person-dots-from-line' }
  ];

  const categoryMap = {
    'General': ["Fever", "Fatigue", "Dizziness", "Weight Loss", "Night Sweats"],
    'Head': ["Headache", "Cough", "Sore Throat", "Blurred Vision", "Ear Ache", "Runny Nose"],
    'Chest': ["Chest Pain", "Palpitations", "Wheezing", "Shortness of Breath", "Deep Cough"],
    'Digestive': ["Nausea", "Stomach Ache", "Bloating", "Loss of Appetite", "Diarrhea"],
    'Limbs': ["Skin Rash", "Joint Pain", "Muscle Ache", "Swelling", "Back Pain"]
  };

  const followupQuestions = {
    "Fever": {
      question: "How long has the fever persisted?",
      options: ["Less than 24h", "1-3 Days", "More than 3 days", "Intermittent"]
    },
    "Cough": {
      question: "What type of cough are you experiencing?",
      options: ["Dry & Irritating", "Productive (Mucus)", "Bout-like (Wheezing)", "Barking Sound"]
    },
    "Chest Pain": {
      question: "Can you describe the pain sensation?",
      options: ["Sharp & Stabbing", "Dull & Heavy", "Burning feeling", "Pressure-like"]
    },
    "Stomach Ache": {
      question: "Where is the pain most localized?",
      options: ["Upper Abdomen", "Lower Abdomen", "Full area", "Side/Flank"]
    }
  };

  const getSeverityLabel = (val) => {
    if (val <= 3) return { label: "Mild", color: "#10b981" };
    if (val <= 7) return { label: "Moderate", color: "#f59e0b" };
    return { label: "Severe", color: "#ef4444" };
  };

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
      const newAnswers = { ...answers };
      delete newAnswers[symptom];
      setAnswers(newAnswers);
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
      if (followupQuestions[symptom]) {
        setFollowup({ ...followupQuestions[symptom], symptom });
      }
    }
  };

  const handleFollowupAnswer = (ans) => {
    setAnswers({ ...answers, [followup.symptom]: ans });
    setFollowup(null);
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setResult({ type: 'error', message: "Please select at least one symptom to begin assessment." });
      return;
    }

    const hasEmergency = selectedSymptoms.includes("Chest Pain") || selectedSymptoms.includes("Shortness of Breath") || severity > 8;
    
    let diagnosis = {
      type: hasEmergency ? 'emergency' : 'normal',
      badges: hasEmergency ? ['Emergency', 'High Priority'] : ['Stable', 'Assessment'],
      message: "",
      department: "General Physician",
      specialist: "Senior Resident",
      homeCare: [],
      icon: hasEmergency ? "fa-solid fa-truck-medical" : "fa-solid fa-user-doctor"
    };

    if (hasEmergency) {
      diagnosis.message = "🚨 High Alert: Emergency evaluation required. Please visit our ER or call 108 immediately.";
      diagnosis.department = "Emergency Care";
      diagnosis.specialist = "ER Specialist";
      diagnosis.homeCare = ["Do not exert yourself", "Keep an ID ready", "Call for help"];
    } else {
      // Basic smart logic
      if (selectedSymptoms.includes("Cough") && answers["Cough"] === "Productive (Mucus)") {
        diagnosis.message = "Your productive cough suggests a potential respiratory infection. A detailed lung assessment is recommended.";
        diagnosis.department = "Pulmonology";
        diagnosis.specialist = "Pulmonologist";
      } else if (selectedSymptoms.includes("Stomach Ache")) {
        diagnosis.message = "Localized abdominal discomfort detected. Further screening by a gastro specialist is advised.";
        diagnosis.department = "Gastroenterology";
        diagnosis.specialist = "Gastroenterologist";
      } else if (selectedSymptoms.some(s => ["Joint Pain", "Muscle Ache"].includes(s))) {
        diagnosis.message = "Symptoms point toward musculoskeletal or inflammatory concerns.";
        diagnosis.department = "Orthopedics";
        diagnosis.specialist = "Orthopedic Surgeon";
      } else {
        diagnosis.message = "General clinical assessment by a physician is recommended for definitive diagnosis.";
        diagnosis.department = "General Medicine";
        diagnosis.specialist = "Family Physician";
      }
      diagnosis.homeCare = ["Stay hydrated", "Monitor temperature", "Ensure adequate rest"];
    }

    setResult(diagnosis);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="symptoms-page-wrapper">
      <div className="symptoms-hero-premium" style={{ position: 'relative' }}>
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
        <div className="symptoms-hero-content">
          <h1>Assess Your Symptoms</h1>
          <p>Pinpoint your symptoms and get an immediate assessment of your health concerns.</p>
        </div>
      </div>

      <div className="symptoms-modern-layout" style={{ maxWidth: '1000px', margin: '40px auto' }}>
        <div className="symptoms-card" style={{ padding: '50px' }}>
          <h2 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '10px' }}>Interactive Body Region</h2>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Select the primary area of discomfort to narrow down symptoms.</p>

          <div className="region-selector-container">
            {regions.map(r => (
              <div 
                key={r.id} 
                className={`region-btn ${activeRegion === r.id ? 'active' : ''}`}
                onClick={() => setActiveRegion(r.id)}
              >
                <i className={r.icon}></i>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          <div className="symptom-category-section">
            <div className="symptom-category-title">
              <i className="fa-solid fa-hand-pointer"></i> Select symptoms for {regions.find(r => r.id === activeRegion).label}
            </div>
            <div className="symptoms-grid-categorized">
              {categoryMap[activeRegion].map((s, i) => (
                <div
                  key={i}
                  className={`symptom-tag-premium ${selectedSymptoms.includes(s) ? 'active' : ''}`}
                  onClick={() => toggleSymptom(s)}
                >
                  {s} {answers[s] && <i className="fa-solid fa-circle-check" style={{ marginLeft: '5px', fontSize: '12px' }}></i>}
                </div>
              ))}
            </div>
          </div>

          <div className="severity-container">
            <div className="severity-label">
              <h3><i className="fa-solid fa-gauge-high" style={{ color: 'var(--primary)', marginRight: '10px' }}></i> Pain Intensity</h3>
              <div className="severity-value" style={{ color: getSeverityLabel(severity).color }}>
                {severity} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 10</span>
                <span className="diag-badge" style={{ marginLeft: '15px', background: getSeverityLabel(severity).color, color: 'white' }}>
                  {getSeverityLabel(severity).label}
                </span>
              </div>
            </div>
            <div className="slider-wrapper">
              <input 
                type="range" 
                min="1" max="10" 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value)}
                className="premium-slider"
              />
            </div>
          </div>

          <button className="primary-btn-large analyze-btn" style={{ width: '100%', padding: '20px', borderRadius: '18px', fontSize: '18px' }} onClick={analyzeSymptoms}>
            <i className="fa-solid fa-stethoscope" style={{ marginRight: '12px' }}></i> Generate Comprehensive Assessment
          </button>

          {result && result.type !== 'error' && (
            <div className={`diagnostic-result-card ${result.type}`}>


                              <div className="diag-header-modern">
                   <div className="diag-icon-box">
                      <i className={result.icon}></i>
                   </div>
                   <div className="diag-badges-flex">
                      {result.badges.map((b, i) => (
                        <span key={i} className={`diag-badge ${result.type === 'emergency' ? 'alert' : 'normal'}`}>{b}</span>
                      ))}
                   </div>
                </div>

               <p className="diag-main-desc">{result.message}</p>

               <div className="diag-action-grid">
                  <div className="diag-action-card">
                    <h4><i className="fa-solid fa-hospital"></i> Department</h4>
                    <p>{result.department}</p>
                  </div>
                  <div className="diag-action-card">
                    <h4><i className="fa-solid fa-user-md"></i> Suggested Expert</h4>
                    <p>{result.specialist}</p>
                  </div>
               </div>

               {result.homeCare.length > 0 && (
                 <div className="home-care-section">
                   <div className="home-care-title"><i className="fa-solid fa-hand-holding-heart"></i> Home-Care First Steps</div>
                   <ul className="home-care-tips">
                     {result.homeCare.map((tip, i) => <li key={i}>{tip}</li>)}
                   </ul>
                 </div>
               )}

               <div style={{ marginTop: '35px' }}>
                  <button
                    className="primary-btn"
                    style={{ width: '100%', padding: "18px", borderRadius: '14px', fontSize: '16px' }}
                    onClick={() => navigate("/appointment", { state: { disease: selectedSymptoms.join(", "), department: result.department } })}
                  >
                    <i className="fa-solid fa-calendar-check"></i> Book Priority Appointment
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Wizard Overlay */}
      {followup && (
        <div className="followup-overlay">
          <div className="followup-card">
            <h3 className="followup-question">{followup.question}</h3>
            <div className="followup-options">
              {followup.options.map((opt, i) => (
                <div 
                  key={i} 
                  className="followup-opt-btn"
                  onClick={() => handleFollowupAnswer(opt)}
                >
                  {opt}
                  <i className="fa-solid fa-chevron-right" style={{ opacity: 0.3 }}></i>
                </div>
              ))}
            </div>
            <button 
              className="global-back-btn" 
              style={{ marginTop: '25px', width: '100%', padding: '12px' }}
              onClick={() => setFollowup(null)}
            >
              Skip Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Symptoms;
