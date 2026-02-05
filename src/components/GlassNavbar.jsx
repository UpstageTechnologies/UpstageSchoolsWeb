import React from "react";
import "./GlassNavbar.css";

export default function GlassNavbar() {
  return (
    <header className="glass-navbar-wrapper">
      <nav className="glass-navbar">
        <button className="nav-btn" aria-label="Back">
          ←
        </button>

        <div className="nav-title">
          Upstage Schools
        </div>

        <button className="nav-btn" aria-label="Menu">
          ☰
        </button>
      </nav>
    </header>
  );
}