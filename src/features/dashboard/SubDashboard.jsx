import React from "react";
import "../dashboard_styles/SubDashboard.css";
import SchoolCalendar from "../../components/SchoolScheduleCalendar"
import { auth ,db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState,useEffect } from "react";

const SubDashboard = ({ setActivePage, setAccountPopupOpen }) => {
 
const [teacherClassId, setTeacherClassId] = useState(null);

  console.log("Popup function:", setAccountPopupOpen);

  const role = localStorage.getItem("role");
 
  const type =
  localStorage.getItem("viewType") ||
  localStorage.getItem("role");
  console.log("ROLE:", type);
  console.log("ADMIN UID:", localStorage.getItem("adminId"));
  console.log("CLASS ID:", teacherClassId);
console.log("CLASS ID USED:", teacherClassId);

// 🔥 ADD HERE
const adminUid =
  localStorage.getItem("adminUid") ||
  localStorage.getItem("adminId");

console.log("ADMIN UID USED:", adminUid);
console.log("CLASS ID USED:", teacherClassId);

const name =
  localStorage.getItem("viewName") ||
  localStorage.getItem("adminName") ||
  localStorage.getItem("teacherName") ||
  localStorage.getItem("parentName") ||
  localStorage.getItem("staffName");

const id =
  localStorage.getItem("viewId") ||
  localStorage.getItem("adminId") ||
  localStorage.getItem("teacherId") ||
  localStorage.getItem("parentId") ||
  localStorage.getItem("staffId");
 
const photo =
  localStorage.getItem("viewPhoto") ||
  localStorage.getItem("profilePhoto");

  const titleMap = {
    admin: "Admin Dashboard",
    teacher: "Teacher Dashboard",
    parent: "Parent Dashboard",
    office_staff: "Office Staff Dashboard"
  };
  const cardConfig = {
    admin: [
      "Account Creation",
      "Teacher Attendance",
      "Student Attendance",
      "Courses & Timetable"
    ],
    teacher: [
      "Timetable",
      "Attendance",
      "My Attendance",
      "Courses"
    ],
    parent: [
      "Child Attendance",
      "Timetable",
      "Courses",
      "Marks & Exams"
    ]
  };
 
  useEffect(() => {
    const loadTeacher = async () => {
      const teacherId =
      localStorage.getItem("viewId") ||
      localStorage.getItem("teacherId");
      console.log("Teacher ID:", teacherId);
      if (!teacherId || !adminUid) return;
  
      const ref = doc(db, "users", adminUid, "teachers", teacherId);
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        const data = snap.data();
        console.log("🔥 TEACHER DATA:", data);
        setTeacherClassId(data.assignedClassId); // 🔥 correct class
      }
    };
  
    loadTeacher();
  }, [adminUid]);
  return (
    
    <div className="sub-wrapper">
      <div className="sub-container">
        

        {/* HEADER */}
        <div className="sub-header">
          <h1>{titleMap[type] || "Dashboard"}</h1>
          <div 
  className="sub-profile"
  onClick={() => {
    if (typeof setAccountPopupOpen === "function") {
      setAccountPopupOpen(true);
    }
  }}
  style={{ cursor: "pointer" }}
>

{photo ? (
  <img
    src={photo}
    alt="profile"
    className="profile-image"
  />
) : (
  <div className="avatar">
    {name?.charAt(0)}
  </div>
)}


  <div>
    <div className="profile-name">{name}</div>
    <div className="profile-role">{type}</div>
    {/* MINI CALENDAR SECTION */}

  </div>
</div>

        </div>
        <div className="top-cards">
  {cardConfig[type]?.map((title, index) => (
    <div
      key={index}
      className="card"
      style={{ cursor: "pointer" }}
      onClick={() => {
        // 🔵 TEACHER
        if (type === "teacher") {
          if (title === "Timetable") {
            setActivePage("teacher-timetable");
          }
          if (title === "Attendance") {
            setActivePage("teacher-attendance");
          }
          if (title === "My Attendance") {
            setActivePage("teacher-attendance"); // change if separate page
          }
          if (title === "Courses") {
            setActivePage("courses");
          }
        }

        // 🔴 ADMIN
        if (type === "admin") {
          if (title === "Teacher Attendance") {
            setActivePage("attendance");
          }
          if (title === "Student Attendance") {
            setActivePage("attendance");
          }
          if (title === "Account Creation") {
            setActivePage("account-creation");
          }
          if (title === "Courses & Timetable") {
            setActivePage("courses");
          }
        }

        // 🟣 PARENT
        if (type === "parent") {
          if (title === "Child Attendance") {
            setActivePage("teacher-attendance");
          }
          if (title === "Timetable") {
            setActivePage("parent-timetable");
          }
          if (title === "Courses") {
            setActivePage("courses");
          }
        }

        // 🟡 OFFICE STAFF
        if (type === "office_staff") {
          setActivePage("accounts");
        }
      }}
    >
      <h3>{title}</h3>
    </div>
    
  ))}

</div>
{/* FULL WIDTH CALENDAR SECTION */}
<div className="">
  <h3>Academic Calendar</h3>
  {teacherClassId && (
  <SchoolCalendar
  adminUid={
    localStorage.getItem("adminUid") ||
    localStorage.getItem("adminId")
  }
    role={type}
    compact={true}
    classId={teacherClassId}
  />
)}
</div>

      </div>
    </div>
  );
};
export default SubDashboard;
