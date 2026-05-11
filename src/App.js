import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Appointment from "./components/Appointment";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Facility from "./components/Facility";
import Symptoms from "./components/Symptoms";
import Signup from "./components/Signup";

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-wrapper">
      {!isDashboard && <Navbar />}
      
      <main className={!isDashboard ? "site-main-content" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/facility" element={<Facility />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Login />} />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;