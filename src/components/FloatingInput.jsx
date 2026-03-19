import React from "react";
import "../features/dashboard_styles/design.css"
const FloatingInput = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  focused,
  setFocused,
  rightIcon,
  onRightIconClick
}) => {

  return (
    <div className={`floating-input ${focused === name || value ? "active" : ""}`}>

      <input
        type={type}
        placeholder={focused === name ? "" : label}
        value={value}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused(null)}
        onChange={onChange}
        style={{ paddingRight: rightIcon ? 40 : 14 }}
      />

      <label>{label}</label>

      {rightIcon && (
        <span
          onClick={onRightIconClick}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#555"
          }}
        >
          {rightIcon}
        </span>
      )}

    </div>
  );
};

export default FloatingInput;