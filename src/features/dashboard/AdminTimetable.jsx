import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import "../dashboard_styles/AdminTimetable.css";
import SchoolCalendar from "../../components/SchoolCalendar";

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];
const PERIODS = [1, 2, 3, 4, 5, 6];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const AdminTimetable = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [table, setTable] = useState({});

  // ADMIN UID
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  /* ================= LOAD ================= */
  const loadTimetable = async () => {
    if (!selectedClass || !selectedSection || !adminUid) return;

    const ref = doc(
      db,
      "users",
      adminUid,
      "timetables",
      `${selectedClass}_${selectedSection}`
    );

    const snap = await getDoc(ref);

    if (snap.exists() && snap.data()?.[selectedDay]) {
      setTable(snap.data()[selectedDay]);
    } else {
      setTable({});
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedDay, selectedSection]);

  const handleCalendarDateSelect = (dateStr) => {
    // dateStr = "2025-12-04"
    const date = new Date(dateStr + "T00:00:00"); // timezone safe
  
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long"
    });
  
    // Only allow school days
    const allowedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
    if (allowedDays.includes(dayName)) {
      setSelectedDay(dayName);
    }
  };
  

  /* ================= SAVE ================= */
  const saveTimetable = async () => {
    try {
      if (!adminUid) {
        alert("Admin not logged in");
        return;
      }

      const ref = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${selectedClass}_${selectedSection}`
      );

      await setDoc(
        ref,
        { [selectedDay]: table },
        { merge: true }
      );

      alert("✅ Timetable saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const resetAll = () => {
    setSelectedClass(null);
    setSelectedSection(null);
    setTable({});
  };

  return (
    <div className="tt-container">
      <h2 className="tt-title">Admin Timetable</h2>

      {/* ================= CLASS SELECT ================= */}
      {!selectedClass && (
        <div className="class-grid">
          {CLASSES.map(c => (
            <div
              key={c}
              className="class-card"
              onClick={() => setSelectedClass(c)}
            >
              {c} Std
            </div>
          ))}
        </div>
      )}

      {/* ================= SECTION SELECT ================= */}
      {selectedClass && !selectedSection && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass} – Select Section
          </h3>

          <div className="section-row">
            {SECTIONS.map(sec => (
              <div
                key={sec}
                className="section-btn"
                onClick={() => setSelectedSection(sec)}
              >
                {sec}
              </div>
            ))}
          </div>

          <p className="back" onClick={resetAll}>← Back</p>
        </>
      )}

      {/* ================= PERIODS + CALENDAR ================= */}
      {selectedClass && selectedSection && (
        <div className="tt-layout">

          {/* LEFT – TIMETABLE */}
          <div className="tt-left">
            <h3 className="tt-sub">
              Class {selectedClass} – Section {selectedSection}
            </h3>

            <div className="day-row">
              {DAYS.map(d => (
                <button
                  key={d}
                  className={`day-btn ${selectedDay === d ? "active" : ""}`}
                  onClick={() => setSelectedDay(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            {PERIODS.map(p => (
              <div key={p} className="period-row">
                <label>Period {p}</label>
                <input
                  placeholder="Enter Subject"
                  value={table[`p${p}`] || ""}
                  onChange={e =>
                    setTable({
                      ...table,
                      [`p${p}`]: e.target.value
                    })
                  }
                />
              </div>
            ))}

            <button className="save-btn" onClick={saveTimetable}>
              Save Timetable
            </button>

            <p className="back" onClick={resetAll}>
              ← Change Class / Section
            </p>
          </div>

          {/* RIGHT – CALENDAR (ONLY HERE) */}
          <div className="tt-right">
          <SchoolCalendar
  adminUid={adminUid}
  onDateSelect={handleCalendarDateSelect}
/>

          </div>

        </div>
      )}
    </div>
  );
};

export default AdminTimetable;
