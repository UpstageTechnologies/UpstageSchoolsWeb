import React from "react";
import { FaRegCopyright, FaRegRegistered } from "react-icons/fa";
import logo from "../assets/upstage.png";

export default function Footer() {
  return (
    <>
      <style>
        {`
        .footer {
          text-align: center;
          padding: 30px 10px 20px;
          font-family: "Segoe UI", sans-serif;
        }

        .footer-logo img {
          width: 50px;
          height: 50px;
          object-fit: contain;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .footer-copy {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .footer-copy span {
          font-weight: 500;
        }
        `}
      </style>

      <footer className="footer">
        {/* Logo */}
        <div className="footer-logo">
          <img src={logo} alt="logo" />
        </div>

        {/* Copyright */}
        <div className="footer-copy">
          <FaRegCopyright />
          <span>2026</span>
          <span>UPSTAGE</span>
          <FaRegRegistered
  style={{
    fontSize: 9,
    opacity: 0.5,
    marginLeft: 2,
    marginRight: 2
  }}
/>
          <span>All rights reserved</span>
        </div>
      </footer>
    </>
  );
}