import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import "../dashboard_styles/timetable.css";

export default function Timetable({ classId }) {

  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [sections, setSections] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [slots, setSlots] = useState([]);
  const [academicStart, setAcademicStart] = useState(null);
const [academicEnd, setAcademicEnd] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  useEffect(() => {
    const loadAcademicYear = async () => {
      if (!adminUid) return;
  
      const ref = doc(
        db,
        "users",
        adminUid,
        "SchoolSettings",
        "academicYear"
      );
  
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        setAcademicStart(snap.data().startDate);
        setAcademicEnd(snap.data().endDate);
  
        // 🔥 If selectedDate outside → reset to startDate
        if (selectedDate < snap.data().startDate) {
          setSelectedDate(snap.data().startDate);
        }
      }
    };
  
    loadAcademicYear();
  }, [adminUid]);
  
  // 🔹 Load Sections + Subjects
  useEffect(() => {
    const loadClassData = async () => {
      if (!adminUid || !classId) return;

      const ref = doc(db, "users", adminUid, "Classes", classId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSections(snap.data().sections || []);
        setClassSubjects(snap.data().subjects || []);
      }
    };

    loadClassData();
  }, [adminUid, classId]);
  const changeDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
  
    const newDate = current.toISOString().split("T")[0];
  
    // 🔥 Restrict inside academic range
    if (
      (academicStart && newDate < academicStart) ||
      (academicEnd && newDate > academicEnd)
    ) {
      return;
    }
  
    setSelectedDate(newDate);
  };

  // 🔹 Generate Slots
  const generateTimeSlots = (timingData) => {
    const {
      schoolStartTime,
      periodCount,
      periodDuration,
      breakCount,
      breakDuration
    } = timingData;

    let result = [];
    let current = new Date(`1970-01-01T${schoolStartTime}`);

    for (let i = 1; i <= periodCount; i++) {
      let start = new Date(current);
      current.setMinutes(current.getMinutes() + Number(periodDuration));
      let end = new Date(current);

      result.push({
        type: "period",
        label: `P${i}`,
        start: start.toTimeString().slice(0,5),
        end: end.toTimeString().slice(0,5),
        subject: ""
      });

      if (breakCount > 0 && i === Math.floor(periodCount / 2)) {
        let bStart = new Date(current);
        current.setMinutes(current.getMinutes() + Number(breakDuration));
        let bEnd = new Date(current);

        result.push({
          type: "break",
          label: "Break",
          start: bStart.toTimeString().slice(0,5),
          end: bEnd.toTimeString().slice(0,5)
        });
      }
    }

    return result;
  };

  // 🔹 Section Click
  const handleSectionClick = async (sectionName) => {
    if (!adminUid) return;

    const timetableRef = doc(
      db,
      "users",
      adminUid,
      "timetables",
      `${classId}_${sectionName}`
    );

    const existing = await getDoc(timetableRef);

    // ✅ If exists load date specific
    if (existing.exists()) {
      const data = existing.data();
      const dateData = data.dates?.[selectedDate];

      if (dateData) {
        setSlots(dateData);
      } else {
        setSlots([]);
      }

      setActiveSection(sectionName);
      return;
    }

    // ✅ Generate new from timing
    const timingRef = doc(
      db,
      "users",
      adminUid,
      "SchoolSettings",
      "timing"
    );

    const timingSnap = await getDoc(timingRef);

    if (!timingSnap.exists()) {
      alert("Please set school timing first");
      return;
    }

    const timingData = timingSnap.data();
    const generatedSlots = generateTimeSlots(timingData);

    // 🔥 Auto assign subjects first day
    const firstDayData = generatedSlots.map((slot, index) => {
      if (slot.type === "break") return slot;

      return {
        ...slot,
        subject:
          classSubjects[index % classSubjects.length] || ""
      };
    });

    await setDoc(timetableRef, {
      classId,
      section: sectionName,
      dates: {
        [selectedDate]: firstDayData
      }
    });

    setSlots(firstDayData);
    setActiveSection(sectionName);
  };

  // 🔹 Save Subject Changes
  const saveChanges = async () => {
    const timetableRef = doc(
      db,
      "users",
      adminUid,
      "timetables",
      `${classId}_${activeSection}`
    );

    const existing = await getDoc(timetableRef);
    const oldData = existing.exists() ? existing.data() : {};

    await setDoc(timetableRef, {
      ...oldData,
      dates: {
        ...oldData.dates,
        [selectedDate]: slots
      }
    });

    alert("Saved Successfully ✅");
  };

  return (
    <div className="timetable-container">

      <h2 className="planner-title">Timetable Planner</h2>

      {/* SECTION LIST */}
      {!activeSection && (
        <div className="section-grid">
          {sections.length === 0 ? (
            <p>No Sections Added</p>
          ) : (
            sections.map((sec, index) => (
              <div
                key={index}
                className="section-card"
                onClick={() => handleSectionClick(sec)}
              >
                <h3>Section {sec}</h3>
              </div>
            ))
          )}
        </div>
      )}

      {/* TIMETABLE VIEW */}
      {activeSection && (
        <div className="timetable-view">

<div className="date-nav">
  {academicStart && selectedDate > academicStart && (
    <button onClick={() => changeDate(-1)}>◀</button>
  )}

  <span>{selectedDate}</span>

  {academicEnd && selectedDate < academicEnd && (
    <button onClick={() => changeDate(1)}>▶</button>
  )}
</div>


          <h3>
            Class {classId} - Section {activeSection}
          </h3>

          <button
            className="back-btn"
            onClick={() => {
              setActiveSection(null);
              setSlots([]);
            }}
          >
            ⬅ Back
          </button>

          <table className="timetable-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Start</th>
                <th>End</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign:"center"}}>
                    No Data Found
                  </td>
                </tr>
              ) : (
                slots.map((slot, index) => (
                  <tr key={index}>
                    <td>{slot.label}</td>
                    <td>{slot.start}</td>
                    <td>{slot.end}</td>
                    <td>
                      {slot.type === "break" ? (
                        <span style={{color:"#999"}}>Break</span>
                      ) : (
                        <select
                          value={slot.subject || ""}
                          onChange={(e) => {
                            const updated = [...slots];
                            updated[index].subject = e.target.value;
                            setSlots(updated);
                          }}
                        >
                          <option value="">
                            Select Subject
                          </option>
                          {classSubjects.map((sub, i) => (
                            <option key={i} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <button className="save-btn" onClick={saveChanges}>
            Save Changes
          </button>

        </div>
      )}
    </div>
  );
}
