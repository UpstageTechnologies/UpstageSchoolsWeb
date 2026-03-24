import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LandingNavbar from "../useTheme/pages/LandingNavbar";
import AboutPanel from "../Product/AboutPanel"; // path correct pannunga
export default function IntroLanding() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  return (
    <>
      <style>
        {`
      .landing-container{
        min-height:100vh;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        text-align:center;
        padding:20px;
      
        /* 🔥 PREMIUM BACKGROUND */
        background:
          radial-gradient(circle at 20% 30%, rgba(139,92,246,0.25), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(99,102,241,0.25), transparent 40%),
          linear-gradient(135deg, #eef2ff, #e0e7ff, #c7d2fe, #a5b4fc);
      
        background-size:200% 200%;
        animation: gradientMove 10s ease infinite;
      
        font-family:"Inter","Segoe UI",sans-serif;
        position:relative;
        overflow:hidden;
      }
      
      @keyframes gradientMove {
        0%{background-position:0% 50%;}
        50%{background-position:100% 50%;}
        100%{background-position:0% 50%;}
      }
      
      /* ===== TITLE ===== */
      .landing-title{
        font-size:clamp(36px,5vw,60px);
        font-weight:800;
        color:#0f172a; /* 🔥 dark text */
        letter-spacing:-1px;
        line-height:1.2;
      }
      
      /* ===== HIGHLIGHT ===== */
      .landing-highlight{
        background: linear-gradient(90deg,#22c55e,#16a34a);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
      }
      
      /* ===== DESCRIPTION ===== */
      .landing-desc{
        margin-top:20px;
        max-width:650px;
        line-height:1.7;
        font-size:17px;
        color:#475569; /* 🔥 readable gray */
      }
      
      /* ===== BUTTON ===== */
      .landing-btn{
        margin-top:35px;
        padding:14px 34px;
        font-size:16px;
        font-weight:600;
        border:none;
        border-radius:999px;
        cursor:pointer;
      
        background: linear-gradient(90deg,#22c55e,#16a34a);
        color:white;
      
        transition:0.3s;
        box-shadow:0 10px 25px rgba(34,197,94,0.35);
      }
      
      .landing-btn:hover{
        transform:translateY(-3px) scale(1.03);
        box-shadow:0 18px 40px rgba(34,197,94,0.45);
      }
      
      /* ===== FEATURES ===== */
      .features{
        margin-top:70px;
        display:flex;
        gap:30px;
        flex-wrap:wrap;
        justify-content:center;
      }
      
      /* ===== FEATURE CARD ===== */
      .feature-card{
        backdrop-filter: blur(20px);
        background: rgba(255,255,255,0.6);
      
        padding:22px;
        border-radius:16px;
        width:240px;
      
        border:1px solid rgba(255,255,255,0.4);
      
        box-shadow:0 10px 30px rgba(0,0,0,0.08);
        transition:0.3s;
      }
      
      .feature-card:hover{
        transform:translateY(-6px);
        box-shadow:0 20px 45px rgba(0,0,0,0.12);
      }
      
      /* ===== FEATURE TITLE ===== */
      .feature-title{
        font-weight:600;
        margin-bottom:8px;
        font-size:16px;
        color:#0f172a;
      }
      
      /* ===== FEATURE TEXT ===== */
      .feature-card div:last-child{
        font-size:14px;
        color:#475569;
      }
      @media(max-width:768px){
        .landing-container{
            padding-top:10px;
        }
      }
        `}
      </style>

      <div className="landing-container">
      <LandingNavbar 
  showAbout={showAbout} 
  setShowAbout={setShowAbout}
  showBack={showAbout}
/>
<AboutPanel 
  show={showAbout} 
  onClose={() => setShowAbout(false)} 
/>
        <h1 className="landing-title">
          Welcome to <span className="landing-highlight">Upstage Technologies</span>
        </h1>

        <p className="landing-desc">
          We build powerful digital solutions for businesses. From eCommerce platforms
          to hospital and school management systems — everything you need in one place.
        </p>

        <button
          className="landing-btn"
          onClick={() => navigate("/products")}
        >
          Visit Products →
        </button>

        {/* Features Section */}
        <div className="features">
          <div className="feature-card">
            <div className="feature-title">🛒 eCommerce</div>
            <div>Manage products, orders and customers easily.</div>
          </div>

          <div className="feature-card">
            <div className="feature-title">🏥 Healthcare</div>
            <div>Complete hospital management solution.</div>
          </div>

          <div className="feature-card">
            <div className="feature-title">🏫 Education</div>
            <div>Smart school management platform.</div>
          </div>
        </div>

      </div>
    </>
  );
}