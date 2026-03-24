import React from "react";
import ebi from ".././assets/ebi-removebg-preview.png";
import ramesh from ".././assets/ramesh-removebg-preview.png";
import siva from ".././assets/sivabro-removebg-preview.png"
import "../useTheme/styles/Landing.css"
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