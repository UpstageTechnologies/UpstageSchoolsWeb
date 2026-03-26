    import React from "react";
    import { FaCopyright } from "react-icons/fa";
    import logo from "../assets/searchlogo.png";

    export default function Footer() {
    return (
        <>
        <style>
{`
.footer {
  text-align: center;
  padding: 20px 10px;
  font-family: Arial, sans-serif;
  border-top: 1px solid white; /* 👈 THIS LINE ADDED */
}

/* Logo on top */
.footer-logo img {
  width: 80px;
  height: auto;
  margin-bottom: 10px;
}

/* Copyright line */
.footer-copy {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 0px;
  font-size: 13px;
  color: #555;
}
`}
</style>
        <footer className="footer">
        
        <div className="footer-logo">
            <img src={logo} alt="logo" />
        </div>

        <div className="footer-copy">
        <FaCopyright /><span>2026</span> <p>UPSTAGE All rights reserved</p>
            </div>

        </footer>
        </>
    );
    }