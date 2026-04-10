import React from "react";
import "../dashboard_styles/SubDashboard.css";
import SchoolCalendar from "../../components/SchoolScheduleCalendar"
import { auth ,db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState,useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

const SubDashboard = ({ setActivePage, setAccountPopupOpen }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const getWeekDates = (date) => {
    const current = new Date(date);
    const day = current.getDay(); // 0-6
  
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  
    const monday = new Date(current.setDate(diff));
  
    const week = [];
  
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
  
    return week;
  };
  const WeekStrip = ({ selectedDate }) => {
    const week = getWeekDates(selectedDate);
  
    return (
      <div className="week-strip">
        {week.map((d, i) => {
          const isSelected =
            new Date(d).toDateString() ===
            new Date(selectedDate).toDateString();
  
          return (
            <div
              key={i}
              className={`day ${isSelected ? "active" : ""}`}
            >
              <div>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
    );
  };
  const TimeGrid = () => {
    const times = [];
  
    let hour = 8;
    let minute = 30;
  
    while (hour < 18) {
      const formatted =
        `${hour}:${minute === 0 ? "00" : minute}`;
  
      times.push(formatted);
  
      minute += 30;
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }
  
    // 🔴 CURRENT TIME LINE
    const now = new Date();
    const totalMinutes =
      (now.getHours() * 60 + now.getMinutes()) - (8 * 60 + 30);
  
    const position = totalMinutes * 1; // 🔥 IMPORTANT FIX
  
    return (
      <div className="time-grid">
        {/* 🔴 LINE */}
        <div
          className="current-line"
          style={{ top: position }}
        />
  
        {times.map((t, i) => (
          <div key={i} className="time-slot">
            <div className="time-label">{t}</div>
            <div className="time-box"></div>
          </div>
        ))}
      </div>
    );
  };
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
      <div style={{ padding: "10px" }}>
      <div
  onClick={() => setActivePage("home")}
  style={{
    position: "fixed",
    top: "20px",
    left: "20px",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 9999
  }}
>
  <FaArrowLeft />
</div>
</div>
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

  <button
    onClick={() => {
      localStorage.setItem("selectedClassId", teacherClassId);
      setActivePage("courses");
    }}
  >
    Class Calendar
  </button>

  <h3>Academic Calendar</h3>

  {/* 🔥 MAIN LOGIC */}
  {selectedDate ? (
    <div className="calendar-view">

      {/* 🔙 BACK */}
      <div
        onClick={() => setSelectedDate(null)}
        style={{
          position: "fixed",
          top: "80px",
          left: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999
        }}
      >
        ←
      </div>

      {/* 📅 WEEK STRIP */}
      <div className="week-strip">
        {(() => {
          const current = new Date(selectedDate);
          const day = current.getDay();
          const diff = current.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(current.setDate(diff));

          const week = [];

          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            week.push(d);
          }

          return week.map((d, i) => {
            const isSelected =
              new Date(d).toDateString() ===
              new Date(selectedDate).toDateString();

            return (
              <div
                key={i}
                className={`day ${isSelected ? "active" : ""}`}
              >
                <div>
                  {d.toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </div>
                <div>{d.getDate()}</div>
              </div>
            );
          });
        })()}
      </div>

      {/* ⏱️ TIMELINE */}
      <TimeGrid />

    </div>
  ) : (
    <>
      {teacherClassId && (
        <SchoolCalendar
          adminUid={
            localStorage.getItem("adminUid") ||
            localStorage.getItem("adminId")
          }
          role={type}
          compact={true}
          classId={teacherClassId}
          onDateSelect={(date) => setSelectedDate(date)}
        />
      )}
    </>
  )}
</div>

      </div>
    </div>
  );
};
export default SubDashboard;
