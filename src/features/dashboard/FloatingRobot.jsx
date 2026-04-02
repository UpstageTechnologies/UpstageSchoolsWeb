
import React, { useState, useEffect } from "react";
const FloatingRobot = () => {
  const [position, setPosition] = useState({ x: 50, y: 400 });
  const [dragging, setDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  useEffect(() => {
    const handleSkip = () => {
      setShowHelp(true); 
    };
  
    window.addEventListener("introSkipped", handleSkip);
  
    return () => window.removeEventListener("introSkipped", handleSkip);
  }, []);
  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging) return;

    setPosition({
      x: e.clientX - 30,
      y: e.clientY - 30,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* 🔥 Help Box */}
      {showHelp && (
        <div
          style={{
            background: "#fff",
            padding: "8px 12px",
            borderRadius: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Need help?{" "}
          <button
  onClick={() => {
    localStorage.removeItem("skipIntro");

    if (window.openIntroPopup) {
      window.openIntroPopup("default");
    }

    setShowHelp(false);
  }}
  style={{
    marginLeft: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: 12,
  }}
>
  Yes
</button>
        </div>
      )}
      <img
        src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
        alt="robot"
        width={60}
        onMouseDown={handleMouseDown}
        draggable={false}
        style={{ cursor: "grab" }}
      />
    </div>
  );
};

export default FloatingRobot;