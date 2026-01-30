import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EmptyPage.css";
import studentImg from "../../assets/student.jpg";

export default function EmptyPage() {

  const [school, setSchool] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="hero-page">
        <div className="hero-wrapper">
      {/* LEFT */}
      <div className="hero-left">

        <h1>
          Single Platform For Your <br />
          <span>School Management</span> Needs.
        </h1>

        <p>
          Manage attendance, fees, communication and learning —
          all from one powerful platform.
        </p>

        <form onSubmit={handleSubmit} className="hero-form">

          <input
            type="text"
            placeholder="Enter your school name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
            <option value="staff">Office Staff</option>
          </select>

          <button type="submit">Continue →</button>

        </form>

      </div>

      {/* RIGHT */}
      <div className="hero-right">

        <div className="image-circle">
          <img src={studentImg} alt="Student" />
        </div>

      </div>

    </div>
    </div>
  );
}
