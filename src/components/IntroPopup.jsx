import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./IntroPopup.css";
const IntroPopup = ({ onClose, type }) => {
    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);
  
    const contentMap = {
      default: `Welcome to your School Management System.
  
  To get started, please configure your school settings.
  
  Set up:
  • Academic Year  
  • School Timing  
  • Classes & Sections  
  
  This will help you manage your school efficiently.`,
  
      accounts: `Setup completed successfully.
  
  You can now manage your school finances.
  
  • Track fee collection  
  • Handle teacher salaries  
  • Monitor income, expenses, and profit  
  
  All financial activities in one place.`,
  account_creation: `Now let's manage your school accounts.

  • Create Admin, Teacher, Student, Parent, and Staff accounts  
  • Easily view and edit all users  
  • Organize your school users in one place  
  
  Go to Account Creation to continue.`,
  planner: `Now let's plan your school activities.

You can manage:

• Course Planner – plan subjects and syllabus  
• Timetable Planner – organize daily class schedule  
• Calendar Planner – manage events and academic calendar  

All planners work based on your school settings.

Go to Planner to continue.`,
attendance: `Now manage your school attendance easily.

• Mark attendance for Admin, Teachers, Students, and Office Staff  
• Track daily attendance records efficiently  
• View attendance history for the last 7 days  

Keep everything organized and up-to-date in one place.`,
attendance_final: `Great! Your attendance setup is complete.

You can now explore more powerful features in your system:

• Use Universal Search to quickly find students, teachers, classes, or records  

• Classroom – View complete details of a student including activities and teacher interactions  

• Library – Check books, notes, and materials for each class to help students prepare for exams  

• Daily overview – See what is happening across all classes in your school  

All your data is securely stored and will never be lost.  
You can view, track, and even restore previous records anytime.

Click Go to History to view all saved data.`,
applications: `Now manage your school applications and approvals.

• All applications from students, teachers, or staff will appear here  

• Admin and teachers can review and approve requests easily  

• Notifications will alert you when new requests arrive  

Everything is organized in one place.

Go to Applications & Approvals to continue.`,
    };
  
    const text = contentMap[type] || contentMap.default;
  
    useEffect(() => {
      setDisplayText("");
      setIndex(0);
    }, [type]);
  
    useEffect(() => {
      if (index < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[index]);
          setIndex(index + 1);
        }, 20);
        return () => clearTimeout(timeout);
      }
    }, [index, text]);

  return (
    <div className="intro-overlay">
      <div className="intro-box">

        <div className="intro-text">
          <h2>Welcome</h2>

          <p>{displayText}</p>

          <button
  onClick={() => {
    onClose();

    if (type === "attendance_final") {
      window.setActivePageDirect &&
        window.setActivePageDirect("history"); // 🔥 GO HISTORY
    }
    else if (type === "planner") {
      window.openPlannerPage && window.openPlannerPage();
    }
    else if (type === "attendance") {
      window.setActivePageDirect &&
        window.setActivePageDirect("universal-attendance");
    }
    else if (type === "account_creation") {
      window.openAccountCreationPage && window.openAccountCreationPage();
    } 
    else if (type === "accounts") {
      window.openAccountsPage && window.openAccountsPage();
    }
    else if (type === "applications") {
      window.setActivePageDirect &&
        window.setActivePageDirect("combined"); // ✅ correct
    }
    else {
      window.openSettingsPage && window.openSettingsPage();
    }
  }}
>
  {type === "attendance_final"
    ? "Go to History →"
    : type === "planner"
    ? "Go to Planner →"
    : type === "attendance"
    ? "Go to Attendance →"
    : type === "account_creation"
    ? "Go to Account Creation →"
    : type === "accounts"
    ? "Go to Accounts →"
    : type === "applications"
? "Go to Applications →"
    : "Go to Settings →"}
</button>
<button
 onClick={() => {
  localStorage.setItem("skipIntro", "true");

  // 🔥 IMPORTANT
  window.dispatchEvent(new Event("introSkipped"));

  onClose();
}}
  style={{
    marginTop: 10,
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
  }}
>
  Skip Guidance
</button>
        </div>

        <div className="intro-image">
          <img
            src="https://png.pngtree.com/png-vector/20250805/ourmid/pngtree-male-teacher-explaining-with-pointer-stick-and-book-3d-illustration-png-image_16846965.webp"
            alt="Teacher"
          />
        </div>

      </div>
    </div>
  );
};

export default IntroPopup;