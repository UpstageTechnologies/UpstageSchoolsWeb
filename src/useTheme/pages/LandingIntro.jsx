import React from "react";
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

  return (
    <div className="intro-page">
            <LandingNavbar />   
      <div className="intro-wrapper">

        {/* LEFT */}
        <div className="intro-left">
          <h1>
            Smart School Solutions by <span>Upstage Technologies</span>
          </h1>

          <p>
            Upstage Technologies delivers a next-generation platform designed for 
            modern schools and training environments. From managing daily operations 
            to enabling continuous learning — everything is streamlined into a 
            powerful, easy-to-use system.
          </p>

          <div className="intro-features">

            <div className="feature-item">
              <FaLayerGroup className="icon" />
              <span>All-in-One School & Training Ecosystem</span>
            </div>

            <div className="feature-item">
              <FaChartLine className="icon" />
              <span>Real-Time Insights & Smart Dashboards</span>
            </div>

            <div className="feature-item">
              <FaUsers className="icon" />
              <span>Stronger Parent, Teacher & Admin Collaboration</span>
            </div>

            <div className="feature-item">
              <FaGraduationCap className="icon" />
              <span>Scalable Learning & Skill Development Tools</span>
            </div>

          </div>

          <p className="trust-line">
            Built with precision by Upstage Technologies — transforming how 
            institutions manage, teach, and grow.
          </p>

          <div className="intro-buttons">
            <button onClick={() => navigate("/empty")}>
              Get Started →
            </button>

            <button
              className="secondary"
              onClick={() => {
                // clean start for demo
                localStorage.removeItem("fromChooseLogin");
                localStorage.removeItem("prefillUser");
                localStorage.removeItem("prefillPass");
            
                navigate("/choose-login");
              }}
            >
              Demo →
            </button>
          </div>
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