import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EmptyPage.css";
import studentImg from "../../assets/student.jpg";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";
import SearchableDropdown from "../../features/search/SearchableDropdown";
import LandingNavbar from "./LandingNavbar";
import AboutPanel from "../../Product/AboutPanel";

export default function EmptyPage() {
  const [schools, setSchools] = useState([]);
  const [school, setSchool] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
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
  
    // ❌ clear demo state
    localStorage.removeItem("fromChooseLogin");
    localStorage.removeItem("prefillUser");
    localStorage.removeItem("prefillPass");
    localStorage.setItem("adminUid", selectedSchoolData.id);
    localStorage.setItem("selectedSchool", school);
    localStorage.setItem("selectedRole", role);
    navigate("/landing");
  };
  
  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
  
      const snap = await getDocs(collection(db, "users"));
      const list = [];
  
      snap.forEach(doc => {
        const data = doc.data();
      
        if (data.schoolName) {
          list.push({
            name: data.schoolName,
            logo: data.schoolLogo,
            id: doc.id   // 🔥 ADD THIS LINE
          });
        }
      });
  
      setSchools(list);
      setLoading(false);   // ✅ done loading
    };
  
    fetchSchools();
  }, []);
  const selectedSchoolData = schools.find(s => s.name === school);

  return (
    <div className="intro-page">
       <LandingNavbar 
  showAbout={showAbout}
  setShowAbout={setShowAbout}
  showBack={true}
/>
<AboutPanel 
  show={showAbout} 
  onClose={() => setShowAbout(false)} 
/>
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
  items={schools.map(s => s.name)}
  value={school}
  onChange={setSchool}
  placeholder={loading ? "Loading schools..." : "Search school"}
  disabled={loading}
  isOpen={activeDropdown === "school"}
  setIsOpen={(val) => setActiveDropdown(val ? "school" : null)}
/>

<SearchableDropdown
  items={["master","admin","teacher","parent","office_staff"]}
  value={role}
  onChange={setRole}
  placeholder="Search role"
  isOpen={activeDropdown === "role"}
  setIsOpen={(val) => setActiveDropdown(val ? "role" : null)}
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
         <img
  src={selectedSchoolData?.logo || studentImg}
  alt="School"
 />
        </div>

      </div>

    </div>
    </div>
  );
}
