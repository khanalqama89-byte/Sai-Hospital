import React from "react";
import { useNavigate } from 'react-router-dom';

function Contact() {
  const navigate = useNavigate();
  return (
    <div className="contact-page-wrapper">
      {/* HERO SECTION */}
      <div className="contact-hero-premium" style={{ position: 'relative' }}>
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
        <div className="contact-hero-content">
          <h1>Get In Touch With Us</h1>
          <p>We are dedicated to providing you with the best healthcare services. Reach out to us for any queries or emergency help.</p>
        </div>
      </div>

      <div className="contact-modern-layout">
        {/* LEFT SIDE - DETAILS */}
        <div className="contact-info-cards">
          <div className="info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h3>Phone Number</h3>
              <p>For emergencies and inquiries</p>
              <a href="tel:+919876543210" className="contact-link">+91 9876543210</a>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <h3>Email Address</h3>
              <p>For reports and support</p>
              <a href="mailto:khatrikhan657@gmail.com" className="contact-link">khatrikhan657@gmail.com</a>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🕒</div>
            <div className="info-content">
              <h3>Visiting Hours</h3>
              <p>Open for patient visits</p>
              <span>9:00 AM – 8:00 PM (Mon-Sun)</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <h3>Hospital Location</h3>
              <p>Opposite To Taj Hotel, Bhiwandi, Maharashtra</p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Opposite+To+Taj+Hotel+Bhiwandi+Maharashtra"
                target="_blank"
                rel="noopener noreferrer"
                className="direction-btn-modern"
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - GOOGLE MAP */}
        <div className="map-card-modern">
          <iframe
            title="Sai Sai Homoeopathic Clinic And Multispeciality Centre Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15064.085023414!2d73.05!3d19.23!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEzJzQ4LjAiTiA3M8KwMDMnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin&q=Sai+Hospital+Bhiwandi+Maharashtra"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Contact;