import React, { useState } from "react";
import TeacherAttendance from "./TeacherAttendance";  
 import Attendance from "./Attendance";
 import AdminAttendance from "./AdminAttendance";
 import OfficeStaffAttendance from "./OfficeStaffAttendance";
import "../dashboard_styles/CreateAccountModal.css";
export default function UniversalAttendance() {
    const [activeTab, setActiveTab] = useState("teacher");
  
    return (
      <div className="accountcreationtitle">
        <h2 className="page-title">Attendance</h2>
  
        <div className="account-card">
  
          {/* TABS */}
          <div className="accountcreationbuttons">
  
            <button
              className={activeTab === "teacher" ? "tab active" : "tab"}
              onClick={() => setActiveTab("teacher")}

            >
                 Student Attendance
            
            </button>
  
            <button
              className={activeTab === "student" ? "tab active" : "tab"}
              onClick={() => setActiveTab("student")}
            >
               Teacher Attendance
            </button>
  
            <button  
            className={activeTab === "student" ? "tab active" : "tab"}
            onClick={() => setActiveTab("admin")}
            >Admin
            </button>
<button  
className={activeTab === "student" ? "tab active" : "tab"}
onClick={() => setActiveTab("staff")}
>
    Office Staff
    </button>
  
          </div>
  
          {/* CONTENT */}
          <div className="account-card-body">
  
          {activeTab === "teacher" && <TeacherAttendance />}
{activeTab === "student" && <Attendance />}
{activeTab === "admin" && <AdminAttendance />}
{activeTab === "staff" && <OfficeStaffAttendance />}
  
          </div>
  
        </div>
      </div>
    );
  }