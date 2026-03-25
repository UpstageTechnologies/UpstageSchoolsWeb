  import React from "react";
  import ebi from ".././assets/ebineser.png";
  import ramesh from ".././assets/image1.png";
  import siva from ".././assets/image2.png"
  import "../useTheme/styles/Landing.css"
  import "./AboutPanel.css"
  export default function AboutPanel({ show, onClose }) {
    return (
      <div className={`about-panel ${show ? "active" : ""}`}>
        <div className="about-content">
          
          <h1>About Upstage Technologies</h1>

          <p>
            Upstage Technologies is a modern IT solutions company focused on building 
            scalable, efficient, and user-friendly digital platforms for businesses 
            and institutions.
          </p>

          <p>
            Our mission is to simplify operations through smart technology — helping 
            organizations improve productivity, enhance user experience, and grow 
            faster in a digital-first world.
          </p>
          {/* 🔥 MISSION & VISION SECTION */}
  <div className="about-mission">

  <div className="mission-header">
    <span className="mission-tag">Why Choose Us</span>
    <h2>Your Goals, Our Commitment</h2>
    <p>
      We focus on delivering scalable solutions with strong technical expertise 
      and a commitment to excellence.
    </p>
  </div>

  <div className="mission-cards">

    <div className="mission-card">
      <h3>Our Mission</h3>
      <p>
        To empower businesses with innovative digital solutions that improve 
        efficiency, productivity, and growth.
      </p>
    </div>

    <div className="mission-card highlight">
      <h3>Our Vision</h3>
      <p>
        To become a trusted technology partner delivering impactful and 
        future-ready solutions across industries.
      </p>
    </div>

    <div className="mission-card">
      <h3>Our Values</h3>
      <p>
        Innovation, integrity, and customer success drive everything we build.
      </p>
    </div>

  </div>

  </div>
          {/* 🔥 CARDS SECTION */}
        

          {/* 🔥 EXTRA SECTION */}
          <div className="about-team">

  <div className="team-header">
    <span className="team-tag">Our Team</span>
    <h2>Dedicated Team</h2>
    <p>Meet the people behind Upstage Technologies</p>
  </div>

  <div className="team-grid">

    <div className="team-card">
      <img src={ebi} alt="Ebi" />
      <p>Ebi</p>
    </div>

    <div className="team-card">
      <img src={ramesh} alt="Ramesh" />
      <p>Ramesh</p>
    </div>

    <div className="team-card">
      <img src={siva} alt="Siva" />
      <p>Siva</p>
    </div>

  </div>

  </div>

        </div>
      </div>
    );
  }