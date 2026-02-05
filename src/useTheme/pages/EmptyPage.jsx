import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EmptyPage.css";
import studentImg from "../../assets/student.jpg";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";
import SearchableDropdown from "../../features/search/SearchableDropdown";


export default function EmptyPage() {
  const [schools, setSchools] = useState([]);
  const [school, setSchool] = useState("");
  const roles = [
    { value: "master", label: "School Owner" },
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Teacher" },
    { value: "parent", label: "Parent" },
    { value: "office_staff", label: "Office Staff" }
  ];
  

  const [role, setRole] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("selectedRole", role);
    navigate("/landing");
    
  };
  useEffect(() => {
    const fetchSchools = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = [];
  
      snap.forEach(doc => {
        const data = doc.data();
        if (data.schoolName) {
          list.push(data.schoolName);
        }
      });
  
      setSchools(list);
    };
  
    fetchSchools();
  }, []);
  

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

<SearchableDropdown
  items={schools}
  value={school}
  onChange={setSchool}
  placeholder="Search school"
/>

<SearchableDropdown
  items={["master","admin","teacher","parent","office_staff"]}
  value={role}
  onChange={setRole}
  placeholder="Search role"
/>
<button type="submit">Continue →</button>
<button
  type="button"
  onClick={() => navigate("/register")}
>
  New User →
</button>
</form>
      </div>
      <div className="hero-right">
        <div className="image-circle">
          <img src={studentImg} alt="Student" />
        </div>

      </div>

    </div>
    </div>
  );
}
