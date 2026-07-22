import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import hospitalLogo from "../assets/hospital_logo.png";

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand-link" onClick={closeMenu}>
        <div className="hospital-brand">
          <img src={hospitalLogo} alt="Sai Hospital Logo" className="hospital-brand-logo" />
          <span className="hospital-brand-title">
            Sai Homoeopathic Clinic And Multispeciality Centre
          </span>
        </div>
      </Link>

      <div className={`hamburger ${isOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        {!["/", "/dashboard", "/login", "/admin"].includes(location.pathname) && (
          <Link to="/" onClick={closeMenu}>Home</Link>
        )}

        {!["/dashboard", "/login", "/admin"].includes(location.pathname) && (
          <>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
            <Link to="/login" className="admin-btn" onClick={closeMenu}>Admin Portal</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;