import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../useTheme/styles/Landing.css";
import studentImg from "../../assets/student.jpg";
import LandingNavbar from "./LandingNavbar";

// ✅ React Icons
import {
  FaLayerGroup,
  FaChartLine,
  FaUsers,
  FaGraduationCap
} from "react-icons/fa";

export default function LandingIntro() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  return (
    <div className="intro-page">
       <LandingNavbar 
  showAbout={showAbout} 
  setShowAbout={setShowAbout}
  showBack={true}
/>
      <div className="intro-wrapper">

        {/* LEFT */}
        <div className={`intro-left ${showAbout ? "about-mode" : ""}`}>

  {!showAbout ? (
    <>
      <h1>
        Smart School Solutions by <span>Upstage Technologies</span>
      </h1>

      <p>
        Upstage Technologies delivers a next-generation platform designed for 
        modern schools and training environments.
      </p>

      <div className="intro-features">
        <div className="feature-item">
          <FaLayerGroup className="icon" />
          <span>All-in-One School Ecosystem</span>
        </div>

        <div className="feature-item">
          <FaChartLine className="icon" />
          <span>Real-Time Insights</span>
        </div>

        <div className="feature-item">
          <FaUsers className="icon" />
          <span>Better Collaboration</span>
        </div>

        <div className="feature-item">
          <FaGraduationCap className="icon" />
          <span>Scalable Learning</span>
        </div>
      </div>
    </>
  ) : (
    <>
      <h1>
        About <span>Upstage Technologies</span>
      </h1>

      <p>
        Upstage Technologies delivers innovative digital solutions that simplify 
        school management, enhance learning experiences, and empower institutions 
        with scalable, future-ready technology.
      </p>
    </>
  )}
{!showAbout && (
  <div className="intro-buttons">
    <button onClick={() => navigate("/empty")}>
      Get Started →
    </button>

    <button
      className="secondary"
      onClick={() => {
        localStorage.removeItem("fromChooseLogin");
        localStorage.removeItem("prefillUser");
        localStorage.removeItem("prefillPass");
        navigate("/choose-login");
      }}
    >
      Demo →
    </button>
  </div>
)}
</div>

          
        

        {/* RIGHT */}
        <div className="intro-right">
          <div className="image-circle">
            <img src={studentImg} alt="Student" />
          </div>
        </div>

      </div>
    </div>
  );
}