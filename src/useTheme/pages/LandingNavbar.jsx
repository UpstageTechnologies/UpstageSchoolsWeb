import React from "react";
import { FaPhoneAlt, FaEnvelope ,FaArrowLeft} from "react-icons/fa";
import logo from "../../../src/assets/logo.jpg";
import { useNavigate } from "react-router-dom";
export default function LandingNavbar({ showAbout = false, setShowAbout }) {
    const navigate = useNavigate();

    const handleBack = () => {
      if (showAbout && setShowAbout) {
        setShowAbout(false);   // 👈 About close
      } else {
        navigate("/");         // 👈 ProductHome route
      }
    };
  
    return (
    <>
      <style>
        {`
        /* ===== NAV CONTAINER ===== */
.nav-search{
  position:fixed;
  top:20px;
  left:0;
  right:0;

  display:flex;
  align-items:center;
  gap:16px;              /* 🔥 space between arrow & navbar */

  padding:0 30px;
  z-index:1000;

  animation:slideDown 0.5s ease;
}

/* ===== NAVBAR BOX ===== */
.search-box{
  flex:1;                /* 🔥 take full width */

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:16px 40px;

  border-radius:999px;
  background:rgba(241,245,249,0.85);
  backdrop-filter:blur(10px);

  box-shadow:
    0 10px 25px rgba(0,0,0,0.08),
    inset 0 1px 2px rgba(255,255,255,0.6);

  transition:all 0.3s ease;
}

/* ===== HOVER EFFECT ===== */
.search-box:hover{
  transform:translateY(-2px);
  box-shadow:
    0 16px 35px rgba(0,0,0,0.12),
    inset 0 1px 2px rgba(255,255,255,0.8);
}
.back-btn{
    display:flex;
    align-items:center;
    justify-content:center;
  
    width:56px;               /* 🔥 थोड़ा bigger */
    height:56px;
  
    font-size:18px;
    color:#374151;
  
    border-radius:50%;
    cursor:pointer;
  
    background:#f1f5f9;       /* 🔥 ALWAYS visible */
    border:1px solid #e5e7eb;
  
    box-shadow:0 4px 10px rgba(0,0,0,0.08);
  
    transition:0.25s;
  }

.logo{
    display:flex;
    align-items:center;
    justify-content:center;
    margin-top:-2px;   /* 🔥 center inside */
    padding:0 10px;
    
  }
  
  .logo img{
    height:28px;
    display:block;
    transition:transform 0.3s ease;
  }

.logo img:hover{
  transform:scale(1.05);
}

/* ===== RIGHT SIDE ===== */
.nav-content{
  display:flex;
  align-items:center;
  gap:30px;
  margin-left:auto;
}

/* ===== ABOUT ===== */
.about{
  font-size:15px;
  font-weight:500;
  cursor:pointer;
  transition:0.3s;
}

.about:hover{
  color: rgba(124,58,237,0.9);
  transform:translateY(-1px);
}

/* ===== ICONS ===== */
.nav-item{
  position:relative;
  cursor:pointer;
}

.nav-item svg{
  font-size:18px;
  color:#374151;
  transition:0.3s;
}

.nav-item:hover svg{
  color: rgba(124,58,237,0.9);
  transform:translateY(-2px) scale(1.1);
}

/* ===== TOOLTIP ===== */
.hover-text{
  position:absolute;
  bottom:-34px;
  left:50%;
  transform:translateX(-50%);

  background:#111;
  color:#fff;
  padding:5px 10px;
  border-radius:6px;

  font-size:12px;
  opacity:0;
  transition:0.3s;
  white-space:nowrap;
}

.nav-item:hover .hover-text{
  opacity:1;
  bottom:-40px;
}

/* ===== ENTRY ANIMATION ===== */
@keyframes slideDown{
  from{
    opacity:0;
    transform:translateY(-20px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

/* ===== MOBILE ===== */
@media(max-width:768px){

.logo{
    display:flex;
    align-items:center;
    justify-content:center;
    margin-top:-10px;   /* 🔥 center inside */
    padding:0 10px;
    
  }
  .nav-search{
    gap:10px;
    padding:0 15px;
  }

  .search-box{
    padding:12px 20px;
  }

  .nav-content{
    gap:20px;
  }
}
        `}
      </style>

      <div className="nav-search">
      {(setShowAbout || true) && (
  <div className="back-btn" onClick={handleBack}>
    <FaArrowLeft />
  </div>
)}
      <div className="search-box">


{/* 🔥 LOGO */}
<div className="logo">
  <img src={logo} alt="logo" />
</div>

{/* 🔥 RIGHT SIDE */}
<div className="nav-content">

  {!showAbout && (
    <span 
      className="about"
      onClick={() => setShowAbout(true)}
    >
      About
    </span>
  )}

  <div className="nav-item">
    <FaPhoneAlt />
    <span className="hover-text">95260960260</span>
  </div>

  <div className="nav-item">
    <FaEnvelope />
    <span className="hover-text">
      upstagetechnologies@gmail.com
    </span>
  </div>

</div>



        </div>
      </div>
    </>
  );
}