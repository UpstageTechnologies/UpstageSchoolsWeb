import React from "react";
import SchoolCalendar from "../../components/SchoolCalendar";
import { auth } from "../../services/firebase";
import "../styles/CalendarPage.css";

const CalendarPage = () => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

    const role = (localStorage.getItem("role") || "").toLowerCase();

  return (
    <div className="calendar-page">
      <h2 className="calendar-title">School Calendar</h2>

      <SchoolCalendar
        adminUid={adminUid}
        role={role}                    // ⭐ PASS ROLE HERE
        onDateSelect={(date) =>
          console.log("📅 Selected date:", date)
        }
      />
    </div>
  );
};

export default CalendarPage;
