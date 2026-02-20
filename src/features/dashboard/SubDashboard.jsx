import React from "react";
import "../dashboard_styles/SubDashboard.css";
import SchoolCalendar from "../../components/SchoolScheduleCalendar"
const SubDashboard = ({ setActivePage, setAccountPopupOpen }) => {
  
  console.log("Popup function:", setAccountPopupOpen);

  const role = localStorage.getItem("role");

  const type =
  localStorage.getItem("viewType") ||
  localStorage.getItem("role");

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
            setActivePage("teacher");
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
            setActivePage("teacher-timetable");
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
<div className="calendar-full">
  <h3>Academic Calendar</h3>

  <SchoolCalendar
    adminUid={localStorage.getItem("adminId")}
    role={type}
    compact={true}
  />
</div>

      </div>
    </div>
  );
};
export default SubDashboard;
