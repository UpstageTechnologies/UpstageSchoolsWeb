import React, { useState, useEffect } from "react";

const FloatingRobot = () => {
  const [position, setPosition] = useState({ x: 50, y: 400 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    const handleSkip = () => setShowHelp(true);
    window.addEventListener("introSkipped", handleSkip);
    return () => window.removeEventListener("introSkipped", handleSkip);
  }, []);

  // 🔥 POINTER DOWN (mouse + touch)
  const handlePointerDown = (e) => {
    setDragging(true);

    // where user touched inside robot
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // 🔥 POINTER MOVE
  const handlePointerMove = (e) => {
    if (!dragging) return;

    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  // 🔥 POINTER UP
  const handlePointerUp = () => {
    setDragging(false);
  };

  // 🔥 global listeners (smooth)
  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  });

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        touchAction: "none", // 🔥 VERY IMPORTANT for mobile
      }}
    >
      {/* Help Box */}
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
        onPointerDown={handlePointerDown}
        draggable={false}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      />
    </div>
  );
};

export default FloatingRobot;