import React from "react";
import { FaPhoneAlt, FaEnvelope ,FaArrowLeft} from "react-icons/fa";
import logo from "../../../src/assets/searchlogo.png";
import { useNavigate } from "react-router-dom";
export default function LandingNavbar({ showAbout = false, setShowAbout ,  showBack = true  , showApply = false ,hideAbout = false }) {
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
    position:absolute; 
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
.search-box{
    flex:1;
    height:40px;
    display:flex;
    align-items:center;
    justify-content:space-between;
  
    padding:35px 35px;
  
    border-radius:999px;
  
    /* 🔥 GLASS BACKGROUND */
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(20px);
  
    /* 🔥 GRADIENT BORDER EFFECT */
    border: 1px solid transparent;
    background-clip: padding-box;
    position: relative;
  
    box-shadow:
      0 10px 30px rgba(0,0,0,0.15),
      inset 0 1px 1px rgba(255,255,255,0.4);
  
    transition: all 0.3s ease;
  }

/* ===== HOVER EFFECT ===== */
.search-box:hover{
  transform:translateY(-2px);
  box-shadow:
    0 16px 35px rgba(0,0,0,0.12),
    inset 0 1px 2px rgba(255,255,255,0.8);
}.back-btn{
    display:flex;
    align-items:center;
    justify-content:center;
  
    width:70px;
    height:70px;
  
    font-size:20px;
    color:#1f2937;
  
    border-radius:50%;
    cursor:pointer;
  
    /* 🔥 GLASS EFFECT */
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(20px);
  
    border:1px solid rgba(255,255,255,0.4);
  
    box-shadow:
      0 10px 25px rgba(0,0,0,0.15),
      inset 0 1px 1px rgba(255,255,255,0.6);
  
    transition: all 0.3s ease;
    position:relative;
    overflow:hidden;
  }

.logo{
    display:flex;
    align-items:center;
    justify-content:center;
    margin-top:-22px;   /* 🔥 center inside */
    padding:-7px 10px;
    
  }
  
  .logo img{
    height:80px;
    width:100px;
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
  color:black;
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

  @media(max-width:768px){

    .logo{
      display:flex;
      align-items:center;
      justify-content:center;
      margin-top:-25px;
      padding:0 10px;
    }
  
    .nav-search{
      gap:10px;
      padding:4px 10px;   /* ✅ fixed */
    }
  
    .search-box{
      height:70px; 
      width:200px;   /* 🔥 increase width here */
      padding:10px 15px;
    }
  
    .nav-content{
      gap:20px;
    }
  }
        `}
      </style>

      <div className="nav-search">
      {showBack && (
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
{showApply && (
  <span 
    className="about"
    onClick={() => window.location.href = "/application"}
  >
    Apply Now
  </span>
)}{!hideAbout && !showAbout && (
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