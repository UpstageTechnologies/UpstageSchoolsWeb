    import React from "react";
    import { FaCopyright , FaDotCircle, FaRegCopyright, FaRegRegistered } from "react-icons/fa";
    import logo from "../assets/upstage.png";

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
  width: 60px;
  height: 60px;
  
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
        <FaRegCopyright /><span>2026</span> <p>UPSTAGE <FaRegRegistered/><FaDotCircle/>All rights reserved</p>
            </div>

        </footer>
        </>
    );
    }