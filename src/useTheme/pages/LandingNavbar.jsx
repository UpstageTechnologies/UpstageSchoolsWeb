import React from "react";

export default function LandingNavbar() {
  return (
    <>
      <style>
        {`
        .nav-search{
          position:fixed;
          top:20px;

          left:0;
          right:0;

          padding:0 20px;   /* 🔥 side spacing */

          z-index:1000;
        }

        .search-box{
          width:100%;                 /* 🔥 FULL WIDTH */
          max-width:1200px;          /* optional limit */
          margin:0 auto;             /* center */

          display:flex;
          align-items:center;
          justify-content:center;

          padding:14px 30px;
          gap:40px;

          border-radius:999px;
          background:#f8fafc;

          box-shadow:
            0 12px 30px rgba(0,0,0,0.08),
            inset 0 1px 2px rgba(255,255,255,0.6);
        }

        .nav-content{
          display:flex;
          align-items:center;
          justify-content:space-between;  /* 🔥 spread items */

          width:100%;                    /* 🔥 full spread */
          max-width:900px;

          font-size:16px;
          color:#374151;
          font-weight:500;
        }

        .nav-item{
          cursor:pointer;
          transition:0.2s;
        }

        .nav-item:hover{
          color:#3b82f6;
        }

        /* MOBILE */
        @media(max-width:768px){
          .search-box{
            padding:12px 16px;
            gap:20px;
          }

          .nav-content{
            flex-direction:column;
            gap:6px;
            font-size:13px;
            text-align:center;
          }
        }
        `}
      </style>

      <div className="nav-search">
        <div className="search-box">
          <div className="nav-content">
            <span className="nav-item">About</span>
            <span className="nav-item">Mobile: 95260960260</span>
            <span className="nav-item">Email: upstagetechnologies@gmail.com</span>
          </div>
        </div>
      </div>
    </>
  );
}