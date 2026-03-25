import React from "react";
import { FaHospital, FaSchool, FaShoppingBag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LandingNavbar from "../useTheme/pages/LandingNavbar";
import AboutPanel from "./AboutPanel";
export default function ProductHome() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  return (
    <>
      <style>
        {`
       .product-page{
        min-height:100vh;
        padding:120px 20px 60px; 
      
        /* 🔥 SAME PREMIUM GRADIENT */
        background:
          radial-gradient(circle at 20% 30%, rgba(139,92,246,0.25), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(99,102,241,0.25), transparent 40%),
          linear-gradient(135deg, #eef2ff, #e0e7ff, #c7d2fe, #a5b4fc);
      
        background-size:200% 200%;
        animation: gradientMove 10s ease infinite;
      
        font-family:"Segoe UI", sans-serif;
        position:relative;
        overflow:hidden;
      }
      @keyframes gradientMove {
        0%{ background-position: 0% 50%; }
        50%{ background-position: 100% 50%; }
        100%{ background-position: 0% 50%; }
      }

        .product-header{
          text-align:center;
          margin-top:50px;
          margin-bottom:50px;
        }

        .product-header h1{
          font-size:34px;
          font-weight:700;
        }

        .product-header p{
          color:#666;
          margin-top:10px;
        }

        .product-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
          gap:25px;
          max-width:1200px;
          margin:0 auto;
        }

        /* 🔥 CARD */
        .product-card{
          background:#fff;
          border-radius:16px;
          padding:26px;

          display:flex;
          flex-direction:column;
          justify-content:space-between;

          cursor:pointer;
          transition:all 0.35s ease;

          box-shadow:0 6px 18px rgba(0,0,0,0.06);
          border:1px solid #eef2f7;

          opacity:0;
          transform:translateY(20px);
          animation:fadeUp 0.6s ease forwards;
        }

        /* stagger animation */
        .product-card:nth-child(1){ animation-delay:0.1s }
        .product-card:nth-child(2){ animation-delay:0.2s }
        .product-card:nth-child(3){ animation-delay:0.3s }

        @keyframes fadeUp{
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        .product-card:hover{
          transform:translateY(-8px);
          box-shadow:1 18px 40px rgba(0,0,0,0.12);
          border-color:green;
        }

        .product-icon{
          font-size:32px;
          margin-bottom:14px;
        }

        .product-title{
          font-size:20px;
          font-weight:600;
        }

        .product-desc{
          font-size:14px;
          color:#666;
          margin-top:8px;
          line-height:1.5;
        }

        /* 🔥 TRY NOW BUTTON */
        .try-now{
          margin-top:20px;
          font-size:14px;
          font-weight:600;
          color:green;

          display:flex;
          align-items:center;
          gap:6px;

          cursor:pointer;
          transition:0.2s;
        }

        .try-now span{
          transition:transform 0.2s;
        }

        .product-card:hover .try-now span{
          transform:translateX(6px);
        }
        `}
      </style>
      <LandingNavbar 
  showBack={true}
  showAbout={showAbout}
  setShowAbout={setShowAbout}
/>
      <div className="product-page">
     
      <AboutPanel 
  show={showAbout} 
  onClose={() => setShowAbout(false)} 
/>
        <div className="product-header">
          <h1>Select a Product</h1>
          <p>Choose a platform to continue</p>
        </div>

        <div className="product-grid">

          {/* 🛒 KADAI */}
          <div
            className="product-card"
            onClick={() =>
              window.open("https://www.kadai.website/", "_blank")
            }
          >
            <div>
              <div className="product-icon"><FaShoppingBag/></div>
              <div className="product-title">Kadai Website</div>
              <div className="product-desc">
                Manage products, orders and customers with ease.
              </div>
            </div>

            <div className="try-now">
              TRY NOW <span>→</span>
            </div>
          </div>

          {/* 🏥 HOSPITAL */}
          <div
            className="product-card"
            onClick={() =>
              window.open(
                "https://vercalhospital-git-master-nirubans-projects-243ecde5.vercel.app/",
                "_blank"
              )
            }
          >
            <div>
              <div className="product-icon"><FaHospital/></div>
              <div className="product-title">Hospital System</div>
              <div className="product-desc">
                Manage patients, appointments and billing.
              </div>
            </div>

            <div className="try-now">
              TRY NOW <span>→</span>
            </div>
          </div>

          {/* 🏫 SCHOOL */}
          <div
            className="product-card"
            onClick={() => navigate("/intro")}
          >
            <div>
              <div className="product-icon"><FaSchool/></div>
              <div className="product-title">School System</div>
              <div className="product-desc">
                Complete school management platform.
              </div>
            </div>

            <div className="try-now">
              TRY NOW <span>→</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}