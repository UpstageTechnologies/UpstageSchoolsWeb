import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductHome() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
        .product-page{
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(120deg,#f8fafc,#eef4ff);
          font-family: "Segoe UI", sans-serif;
        }

        .product-wrapper{
          display:flex;
          gap:40px;
          flex-wrap:wrap;
          justify-content:center;
        }

        .product-card{
          width:280px;
          height:180px;

          border-radius:20px;
          background:#fff;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;

          cursor:pointer;
          transition:0.3s;

          box-shadow:0 10px 30px rgba(0,0,0,0.1);
        }

        .product-card:hover{
          transform:translateY(-8px);
          box-shadow:0 20px 40px rgba(0,0,0,0.15);
        }

        .product-title{
          font-size:20px;
          font-weight:600;
          margin-top:10px;
        }
        `}
      </style>

      <div className="product-page">
        <div className="product-wrapper">

          {/* 🛒 KADAI */}
          <div
            className="product-card"
            onClick={() =>
              window.open("https://www.kadai.website/", "_blank")
            }
          >
            <div style={{ fontSize: "32px" }}>🛒</div>
            <div className="product-title">Kadai Website</div>
          </div>

          {/* 🏥 HOSPITAL */}
          <div
            className="product-card"
            onClick={() =>
              window.open(
                "https://vercalhospital-oy3dhedpd-nirubans-projects-243ecde5.vercel.app/",
                "_blank"
              )
            }
          >
            <div style={{ fontSize: "32px" }}>🏥</div>
            <div className="product-title">Hospital System</div>
          </div>

          {/* 🏫 SCHOOL (YOUR PAGE) */}
          <div
            className="product-card"
            onClick={() => navigate("/landing")}
          >
            <div style={{ fontSize: "32px" }}>🏫</div>
            <div className="product-title">School System</div>
          </div>

        </div>
      </div>
    </>
  );
}