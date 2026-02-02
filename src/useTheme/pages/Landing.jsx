import React from "react";
import { Link } from "react-router-dom";
import "../styles/Landing.css";
import logo from "../../assets/logo.jpeg";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <nav className="nav-bar">
          <img src={logo} alt="Company Logo" className="logo" />
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="/application">Apply Now</a>
            <Link to="/UniversalLogin" className="start-btn">Login</Link>
          </div>
        </nav>

      <div className="wrapper">
        {/* HERO SECTION */}
        <section className="hero">
          <h1>
            Welcome to <span>SchoolTrain</span>
          </h1>
          <p>Your smart school management assistant.</p>
          <div className="hero-buttons">
          <button 
  className="btn-primary"
  onClick={() => navigate("/landing")}
>
  Get Started
</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <p>© 2025 SchoolTrain. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
