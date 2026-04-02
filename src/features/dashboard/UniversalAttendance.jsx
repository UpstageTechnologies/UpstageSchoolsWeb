import React, { useState, useEffect } from "react";
import TeacherAttendance from "./TeacherAttendance";  
import Attendance from "./Attendance";
import { db } from "../../services/firebase";
import { 
  collection, 
  getDocs 
} from "firebase/firestore";
import AdminAttendance from "./AdminAttendance";
import OfficeStaffAttendance from "./OfficeStaffAttendance";
import "../dashboard_styles/CreateAccountModal.css";

export default function UniversalAttendance() {
  const adminUid = localStorage.getItem("adminUid"); // ✅ ADD THIS
  const [activeTab, setActiveTab] = useState("teacher");
  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilterList, setShowFilterList] = useState(false);
const [filterType, setFilterType] = useState("name"); // default
const [selectedClass, setSelectedClass] = useState("");
const [selectedSection, setSelectedSection] = useState("");
const [classes, setClasses] = useState([]);
const [appliedClass, setAppliedClass] = useState("");
const [appliedSection, setAppliedSection] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const isSkipped = localStorage.getItem("skipIntro") === "true";
const [showAttendanceGuide, setShowAttendanceGuide] = useState(!isSkipped);
useEffect(() => {
  const isSkipped = localStorage.getItem("skipIntro") === "true";

  if (isSkipped) {
    setShowAttendanceGuide(false);
  }
}, []);
const selectedClassData = classes.find(
  c => c.name === selectedClass
);
useEffect(() => {
  const handleClickOutside = () => {
    setShowFilterList(false);
  };

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [globalSearch]);
  useEffect(() => {
    if (!adminUid) return;
  
    const loadClasses = async () => {
   
      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );
  
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      console.log("Classes from Firebase:", list); 
      setClasses(list);
    };
  
    loadClasses();
  }, [adminUid]);
  const SearchWithFilter = ({
    globalSearch,
    setGlobalSearch,
    showFilterList,
    setShowFilterList,
    filterType,
    setFilterType
  }) => (
    <div className="history-controls">
      <div className="search-wrapper" onClick={(e) => e.stopPropagation()}>
        
        <input
          type="text"
          placeholder="Search here..."
          value={globalSearch}
          onChange={(e) => {
            const value = e.target.value;
            setGlobalSearch(value);
  
            if (value) {
              setShowFilterList(false);
            } else {
              setShowFilterList(true);
            }
          }}
          onFocus={(e) => {
            e.stopPropagation();
            if (!globalSearch) {
              setShowFilterList(true);
            }
          }}
        />
        {showFilterList && (
  <div className="filter-list" onClick={(e) => e.stopPropagation()}>
  <label>Filter type</label>
  <div style={{ display: "flex", gap: 10, marginTop: 10 ,    flexWrap: "wrap" }}>

{["All","present", "absent", "late"].map(st => (
  <div
    key={st}
    onClick={() => setStatusFilter(st)}
    style={{
      padding: "1px 10px",
      borderRadius: 20,
      cursor: "pointer",
      border: "1px solid #ccc",
      whiteSpace: "nowrap",  // ✅ prevents text breaking
      background:
        statusFilter === st
          ? st === "present"
            ? "#4caf50"
            : st === "absent"
            ? "#e74c3c"
            : "#f1c40f"
          : "#f5f5f5",
      color: statusFilter === st ? "#fff" : "#333",
      fontWeight: 100
    }}
  >
    {st.toUpperCase()}
  </div>
))}

</div>

  <h4 onClick={() => {
    setFilterType("class");
  }}>
    Class
  </h4>
<select
  value={selectedClass}
  onChange={(e) => {
   
    setSelectedClass(e.target.value);
    setSelectedSection(""); // reset section
  }}
>
  <option value="">Select Class</option>

  {classes.map(c => (
    <option key={c.id} value={c.name}>
      Class {c.name}
    </option>
  ))}
</select>

  {/* 🔥 SECTION DROPDOWN */}
  {selectedClassData && (
  <select
    value={selectedSection}
    onChange={(e) => setSelectedSection(e.target.value)}
  >
    <option value="">Select Section</option>

    {selectedClassData.sections?.map(sec => (
      <option key={sec} value={sec}>
        Section {sec}
      </option>
    ))}
  </select>
)}
<button
  onClick={() => {
    if (appliedClass) {
      // ✅ RESET
      setSelectedClass("");
      setSelectedSection("");
      setAppliedClass("");
      setAppliedSection("");
    } else {
      // ✅ GENERATE
      if (!selectedClass) return alert("Select class");

      setAppliedClass(selectedClass);
      setAppliedSection(selectedSection);
      setShowFilterList(false);
    }
  }}
>
  {appliedClass ? "Reset" : "Generate"}
</button>

</div>
)}
  
      </div>
    </div>
  );
  return (
    <div className="accountcreationtitle">
      <h2 className="page-title">Attendance</h2>
      {showAttendanceGuide && (
  <div className="guide-banner">
    <p>
      Manage attendance for all users from here.

      • Mark Present, Absent, or Late for students, teachers, admin, and staff  
      • Save attendance to keep records updated  
      • Use search to quickly find users  
      • Apply filters (status, class, section) to view specific data  

      Try marking a records and click <strong>Finish</strong>.
    </p>
    <button
  className="finish-btn"
  onClick={() => {
    setShowAttendanceGuide(false);

    // 🔥 OPEN NEW POPUP
    if (window.openIntroPopup) {
      window.openIntroPopup("attendance_final");
    }
  }}
>
  Finish →
</button>
  </div>
)}
      <div className="account-card">

        {/* TABS */}
        <div className="accountcreationbuttons">

          <button
            className={activeTab === "teacher" ? "tab active" : "tab"}
            onClick={() => {
              setActiveTab("teacher");
              setGlobalSearch("");   // 🔥 reset search
            }}
          >
            Student Attendance
          </button>

          <button
            className={activeTab === "student" ? "tab active" : "tab"}
            onClick={() => {
              setActiveTab("student");
              setGlobalSearch("");
            }}
          >
            Teacher Attendance
          </button>

          <button
            className={activeTab === "admin" ? "tab active" : "tab"}
            
onClick={() => {
  setActiveTab("admin");
  setGlobalSearch("");
}}

          >
            Admin
          </button>

          <button
            className={activeTab === "staff" ? "tab active" : "tab"}
            onClick={() => {
              setActiveTab("staff");
              setGlobalSearch("");
            }}
          >
            Office Staff
          </button>

        </div>

        {/* CONTENT */}
        <div className="account-card-body">
          {/* 🔽 PAGES */}
          {activeTab === "teacher" && (
  <>
    <SearchWithFilter
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      showFilterList={showFilterList}
      setShowFilterList={setShowFilterList}
      filterType={filterType}
      setFilterType={setFilterType}
    />
<TeacherAttendance
  globalSearch={debouncedSearch}
  selectedClass={appliedClass}
  selectedSection={appliedSection}
/>
  </>
)}
{activeTab === "student" && (
  <>
    <SearchWithFilter
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      showFilterList={showFilterList}
      setShowFilterList={setShowFilterList}
      filterType={filterType}
      setFilterType={setFilterType}
    />

<Attendance 
  globalSearch={debouncedSearch} 
  filterType={filterType}
  selectedClass={appliedClass}
  selectedSection={appliedSection}
/>
  </>
)}

{activeTab === "admin" && (
  <>
    <SearchWithFilter
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      showFilterList={showFilterList}
      setShowFilterList={setShowFilterList}
      filterType={filterType}
      setFilterType={setFilterType}
    />

    <AdminAttendance 
      globalSearch={debouncedSearch} 
      filterType={filterType}
    />
  </>
)}

{activeTab === "staff" && (
  <>
    <SearchWithFilter
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      showFilterList={showFilterList}
      setShowFilterList={setShowFilterList}
      filterType={filterType}
      setFilterType={setFilterType}
    />

    <OfficeStaffAttendance 
      globalSearch={debouncedSearch} 
      filterType={filterType}
    />
  </>
)}
        </div>

      </div>
    </div>
  );
}