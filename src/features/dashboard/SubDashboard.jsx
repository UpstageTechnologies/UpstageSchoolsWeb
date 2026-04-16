import React from "react";
import "../dashboard_styles/SubDashboard.css";
import SchoolCalendar from "../../components/SchoolCalendar"
import { auth ,db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Timetable from "./Timetable";
const SubDashboard = ({ setActivePage, setAccountPopupOpen }) => {
 
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [realSlots, setRealSlots] = useState([]);
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
  const TimeGrid = ({ slots }) => {

    const gridRef = useRef(null);
    
    const [position, setPosition] = useState(0);
  
    const times = [];
  
    let hour = 8;
    let minute = 30;
  
    while (hour < 18) {
      times.push(`${hour}:${minute === 0 ? "00" : minute}`);
  
      minute += 30;
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }
   
    useEffect(() => {
  
      const updateLine = () => {
        const now = new Date();
  
        const startMinutes = 8 * 60 + 30;
        const endMinutes = 18 * 60;
  
        const currentMinutes =
          now.getHours() * 60 + now.getMinutes();
  
        const diff = currentMinutes - startMinutes;
        const totalRange = endMinutes - startMinutes;
  
        const gridHeight =
          gridRef.current?.offsetHeight || 600;
  
        const pos = Math.max(
          0,
          Math.min((diff / totalRange) * gridHeight, gridHeight)
        );
  
        setPosition(pos);
      };
  
      // 🔥 FIRST RUN AFTER DOM READY
      setTimeout(updateLine, 100);
  
      // 🔥 AUTO UPDATE
      const interval = setInterval(updateLine, 60000);
  
      return () => clearInterval(interval);
  
    }, []);
    const getCurrentSlot = () => {
      if (!slots) return null;
    
      const now = new Date();
    
      const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");
    
      return slots.find((slot) => {
        if (slot.type === "break") return false;
    return currentTime >= slot.start && currentTime < slot.end;;
    console.log("TIME:", currentTime);
      });
    };
    const currentSlot = getCurrentSlot();
    return (
      <div className="time-grid" ref={gridRef}>
    <div
  className="current-line"
  style={{ top: position }}
>
  {currentSlot && (
    <span className="line-label">
      {currentSlot.subject} - {currentSlot.topic}
    </span>
  )}
</div>
{slots.map((slot, i) => {
      if (slot.type === "break") return null;

      const getMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      const start = getMinutes(slot.start);
      const end = getMinutes(slot.end);

      const baseStart = 8 * 60 + 30;
      const totalHeight = gridRef.current?.offsetHeight || 600;

      const top = ((start - baseStart) / (9.5 * 60)) * totalHeight;
      const height = ((end - start) / (9.5 * 60)) * totalHeight;

      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top,
            left: "80px",
            right: "10px",
            height,
            background: "#4f46e5",
            color: "#fff",
            borderRadius: "6px",
            padding: "4px",
            fontSize: "12px"
          }}
        >
          {slot.subject} - {slot.topic}
        </div>
      );
    })}

  
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
  useEffect(() => {
    const loadSlots = async () => {
  
      const fullClass = localStorage.getItem("className");
      const adminUid = localStorage.getItem("adminUid");
  
      if (!fullClass || !adminUid) {
        console.log("❌ className / adminUid missing");
        return;
      }
  
      const className = fullClass.slice(0, -1);
      const section = fullClass.slice(-1);
  
      console.log("🔥 DOC:", `${className}_${section}`);
  
      try {
        const ref = doc(
          db,
          "users",
          adminUid,
          "timetables",
          `${className}_${section}`
        );
  
        const snap = await getDoc(ref);
  
        if (snap.exists()) {
          const data = snap.data();
  
          const getDayKey = (date) => {
            const d = new Date(date).getDay(); // 0-6
          
            const map = {
              1: "Day1", // Monday
              2: "Day2",
              3: "Day3",
              4: "Day4",
              5: "Day5",
              6: "Day6",
              0: "Day7"  // Sunday
            };
          
            return map[d];
          };
          
          const dayKey = getDayKey(selectedDate);
          
          console.log("🔥 SELECTED DAY:", dayKey);
          
          const slotsData = data.cycles?.[dayKey] || [];
  
          console.log("🔥 REAL SLOTS:", slotsData);
  
          setRealSlots(slotsData);
        } else {
          console.log("❌ No timetable found");
        }
  
      } catch (err) {
        console.error("Error:", err);
      }
    };
  
    loadSlots();
  }, [selectedDate]);
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
    

<TimeGrid slots={realSlots} />
   

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
