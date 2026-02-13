// ==============================
// Settings.jsx (Internal CSS Version)
// ==============================
import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, onSnapshot, doc, setDoc, getDoc  } from "firebase/firestore";
import { db } from "../../../services/firebase"
import { FaTrash } from "react-icons/fa";
import SchoolScheduleCalendar from "../../../components/SchoolScheduleCalendar";

export default function Settings({ adminUid }) {
  const isNumberClass = (name) => /^\d+$/.test(name.trim());
  const [sectionCount, setSectionCount] = useState("");
  const [subjectInputs, setSubjectInputs] = useState({});
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolStartTime, setSchoolStartTime] = useState("");
const [schoolEndTime, setSchoolEndTime] = useState("");
const [timeError, setTimeError] = useState("");
const [timeSaving, setTimeSaving] = useState(false);
const [periodCount, setPeriodCount] = useState("");
const [periodDuration, setPeriodDuration] = useState("");

const [breakCount, setBreakCount] = useState("");
const [breakDuration, setBreakDuration] = useState("");

const [timingValidationError, setTimingValidationError] = useState("");

  const [saveStatus, setSaveStatus] = useState("");
  const [savedYear, setSavedYear] = useState(null);
  
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!adminUid) return;

    const ref = collection(db, "users", adminUid, "Classes");
    const unsub = onSnapshot(ref, (snap) => {
      const allClasses = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
        sections: d.data().sections || [],
        subjects: d.data().subjects || []
      }));
      
      const textClasses = allClasses.filter(c => !isNumberClass(c.name));
    
      const numberClasses = allClasses
        .filter(c => isNumberClass(c.name))
        .sort((a, b) => Number(a.name) - Number(b.name));
    
      setClasses([...textClasses, ...numberClasses]);
      setLoading(false);
    });
    

    return () => unsub();
  }, [adminUid]);

  const addClass = async () => {
    if (!className.trim()) return alert("Enter class name");
    if (!sectionCount || sectionCount < 1)
      return alert("Enter valid number of sections");
  
    if (classes.some(c => c.name.toLowerCase() === className.toLowerCase())) {
      return alert("Class already exists");
    }
  
    // Generate Sections (A, B, C...)
    const sections = Array.from({ length: sectionCount }, (_, i) =>
      String.fromCharCode(65 + i)
    );
  
    await addDoc(collection(db, "users", adminUid, "Classes"), {
      name: className.trim(),
      sections: sections,
    });
  
    setClassName("");
    setSectionCount("");
  };
  const addSubject = async (classId, existingSubjects = []) => {
    const subjectName = subjectInputs[classId];
  
    if (!subjectName || !subjectName.trim())
      return alert("Enter subject name");
  
    if (existingSubjects.includes(subjectName.trim())) {
      return alert("Subject already exists");
    }
  
    const updatedSubjects = [...existingSubjects, subjectName.trim()];
  
    await setDoc(
      doc(db, "users", adminUid, "Classes", classId),
      { subjects: updatedSubjects },
      { merge: true }
    );
  
    // Clear only that class input
    setSubjectInputs({
      ...subjectInputs,
      [classId]: ""
    });
  };
  
  

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    await deleteDoc(doc(db, "users", adminUid, "Classes", id));
  };
  useEffect(() => {
    if (!adminUid) return;
  
    const loadDates = async () => {
      const ref = doc(db, "users", adminUid, "SchoolSettings", "academicYear");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const sDate = snap.data().startDate || "";
        const eDate = snap.data().endDate || "";
      
        setStartDate(sDate);
        setEndDate(eDate);
      
        if (sDate && eDate) {
          const startYear = new Date(sDate).getFullYear();
          const endYear = new Date(eDate).getFullYear();
      
          setSavedYear({
            year: `${startYear} - ${endYear}`,
            startDate: sDate,
            endDate: eDate,
          });
        }
      }
      
    };
  
    loadDates();
  }, [adminUid]);
  const saveSchoolDates = async () => {
    if (!startDate || !endDate) {
      setSaveStatus("Please select both dates");
      return;
    }
  
    if (new Date(startDate) >= new Date(endDate)) {
      setSaveStatus("End date must be after start date");
      return;
    }
  
    setSaving(true);
    setSaveStatus("");
  
    await setDoc(
      doc(db, "users", adminUid, "SchoolSettings", "academicYear"),
      { startDate, endDate },
      { merge: true }
    );
  
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
  
    setSavedYear({
      year: `${startYear} - ${endYear}`,
      startDate,
      endDate,
    });
  
    setSaving(false);
    setSaveStatus("Saved successfully ✅");
  };
  useEffect(() => {
    if (!adminUid) return;
  
    const loadTiming = async () => {
      const ref = doc(db, "users", adminUid, "SchoolSettings", "timing");
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        setSchoolStartTime(snap.data().startTime || "");
        setSchoolEndTime(snap.data().endTime || "");
      }
    };
  
    loadTiming();
  }, [adminUid]);
  useEffect(() => {
    if (
      !periodCount ||
      !periodDuration ||
      !schoolStartTime ||
      !schoolEndTime
    ) {
      setTimingValidationError("");
      return;
    }
  
    const schoolMinutes = getSchoolTotalMinutes();
  
    const totalPeriodMinutes =
      Number(periodCount) * Number(periodDuration);
  
    const totalBreakMinutes =
      Number(breakCount || 0) * Number(breakDuration || 0);
  
    const totalUsed = totalPeriodMinutes + totalBreakMinutes;
  
    if (totalUsed > schoolMinutes) {
      setTimingValidationError(
        "Timing mismatch ❌ Period + Break exceeds school duration"
      );
    } else if (totalUsed < schoolMinutes) {
      setTimingValidationError(
        "Timing incomplete ⚠ Period + Break less than school duration"
      );
    } else {
      setTimingValidationError("");
    }
  }, [
    periodCount,
    periodDuration,
    breakCount,
    breakDuration,
    schoolStartTime,
    schoolEndTime
  ]);
  
  const calculateDuration = () => {
    if (!schoolStartTime || !schoolEndTime) return null;
  
    const [startH, startM] = schoolStartTime.split(":").map(Number);
    const [endH, endM] = schoolEndTime.split(":").map(Number);
  
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
  
    if (endMinutes <= startMinutes) return "invalid";
  
    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
  
    return `${hours}h ${minutes}m`;
  };
  const saveSchoolTiming = async () => {
    // Basic validations
    if (
      !schoolStartTime ||
      !schoolEndTime ||
      !periodCount ||
      !periodDuration
    ) {
      setTimeError("Fill all timing and period fields");
      return;
    }
  
    if (calculateDuration() === "invalid") {
      setTimeError("End time must be after start time");
      return;
    }
  
    if (timingValidationError) {
      setTimeError("Fix timing mismatch before saving");
      return;
    }
  
    setTimeSaving(true);
    setTimeError("");
  
    await setDoc(
      doc(db, "users", adminUid, "SchoolSettings", "timing"),
      {
        schoolStartTime,
        schoolEndTime,
        periodCount: Number(periodCount),
        periodDuration: Number(periodDuration),
        breakCount: Number(breakCount || 0),
        breakDuration: Number(breakDuration || 0)
      }
    );
  
    setTimeSaving(false);
  };
  
  const getSchoolTotalMinutes = () => {
    if (!schoolStartTime || !schoolEndTime) return 0;
  
    const [sh, sm] = schoolStartTime.split(":").map(Number);
    const [eh, em] = schoolEndTime.split(":").map(Number);
  
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
  
    if (end <= start) return 0;
  
    return end - start;
  };
  useEffect(() => {
    if (!adminUid) return;
  
    const loadTiming = async () => {
      const ref = doc(db, "users", adminUid, "SchoolSettings", "timing");
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        const data = snap.data();
  
        setSchoolStartTime(data.schoolStartTime || "");
        setSchoolEndTime(data.schoolEndTime || "");
        setPeriodCount(data.periodCount || "");
        setPeriodDuration(data.periodDuration || "");
        setBreakCount(data.breakCount || "");
        setBreakDuration(data.breakDuration || "");
      }
    };
  
    loadTiming();
  }, [adminUid]);
  
  return (
    <div className="settings-wrapper">
  
      <div className="settings-left">
        {/* Existing settings content full */}
  
      {/* HEADER */}
      <div className="settings-header">
        <h1>⚙️ School Settings</h1>
        <p>Manage academic year & classes</p>
      </div>
  
      {/* ACADEMIC YEAR */}
      <div className="settings-card">
      <h2 className="card-title">📅 School Schedule Calendar</h2>
 
  
        <div className="input-row">
          <div className="input-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            
          </div>
  
          <div className="input-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
  
        <button className="primary-btn" onClick={saveSchoolDates}>
          {saving ? "Saving..." : "Save Academic Year"}
        </button>
        {savedYear && (
  <div className="year-table">
    <table>
      <thead>
        <tr>
          <th>Academic Year</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{savedYear.year}</td>
          <td>{savedYear.startDate}</td>
          <td>{savedYear.endDate}</td>
          <td className="success">Saved</td>
        </tr>
      </tbody>
    </table>
  </div>
)}

      </div>
      <div className="settings-card timing-card">
  <h2 className="card-title">🕒 School Schedule & Period Setup</h2>

  {/* SCHOOL TIME SECTION */}
  <div className="timing-section">
    <h4 className="section-title">School Timing</h4>

    <div className="input-row">
      <div className="input-group">
        <label>Start Time</label>
        <input
          type="time"
          value={schoolStartTime}
          onChange={(e) => setSchoolStartTime(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>End Time</label>
        <input
          type="time"
          value={schoolEndTime}
          onChange={(e) => setSchoolEndTime(e.target.value)}
        />
      </div>
    </div>

    {calculateDuration() && calculateDuration() !== "invalid" && (
      <div className="duration-box">
        Total Duration: {calculateDuration()}
      </div>
    )}

    {calculateDuration() === "invalid" && (
      <div className="error-box">
        End time must be after start time
      </div>
    )}
  </div>

  <div className="divider" />

  {/* PERIOD SETTINGS */}
  <div className="timing-section">
    <h4 className="section-title">📚 Period Settings</h4>

    <div className="input-row">
      <div className="input-group">
        <label>No. of Periods</label>
        <input
          type="number"
          value={periodCount}
          onChange={(e) => setPeriodCount(e.target.value)}
          min="1"
        />
      </div>

      <div className="input-group">
        <label>Each Period (mins)</label>
        <input
          type="number"
          value={periodDuration}
          onChange={(e) => setPeriodDuration(e.target.value)}
          min="1"
        />
      </div>
    </div>
  </div>

  <div className="divider" />

  {/* BREAK SETTINGS */}
  <div className="timing-section">
    <h4 className="section-title">☕ Break Settings</h4>

    <div className="input-row">
      <div className="input-group">
        <label>No. of Breaks</label>
        <input
          type="number"
          value={breakCount}
          onChange={(e) => setBreakCount(e.target.value)}
          min="0"
        />
      </div>

      <div className="input-group">
        <label>Each Break (mins)</label>
        <input
          type="number"
          value={breakDuration}
          onChange={(e) => setBreakDuration(e.target.value)}
          min="0"
        />
      </div>
    </div>
  </div>

  {/* VALIDATION STATUS */}
  <div className="validation-area">
    {timingValidationError ? (
      <div className="error-box">{timingValidationError}</div>
    ) : (
      periodCount &&
      periodDuration &&
      schoolStartTime &&
      schoolEndTime && (
        <div className="success-box">
          Timing perfectly matched ✅
        </div>
      )
    )}
  </div>

  <button className="primary-btn save-btn" onClick={saveSchoolTiming}>
    {timeSaving ? "Saving..." : "Save Timing"}
  </button>
</div>

  
      {/* CLASS SETTINGS */}
      <div className="settings-card">
        <h2 className="card-title">🏫 Classes</h2>
  
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <input
    type="number"
    placeholder="No. of Sections"
    value={sectionCount}
    min="1"
    onChange={(e) => setSectionCount(e.target.value)}
  />
          <button className="primary-btn" onClick={addClass}>
            Add Class
          </button>
        </div>
  
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <div className="class-list">
            {classes.length === 0 && <p>No classes created</p>}
  
            {classes.map(c => (
  <div key={c.id} className="class-item">
    
    <div className="class-content">
      <strong>Class {c.name}</strong>

      {c.sections && (
        <p className="section-text">
          Sections: {c.sections.join(", ")}
        </p>
      )}

      {/* SUBJECT LIST */}
      {c.subjects && c.subjects.length > 0 && (
        <p className="subject-text">
          Subjects: {c.subjects.join(", ")}
        </p>
      )}

      {/* ADD SUBJECT INPUT */}
      <div className="subject-row">
      <input
  type="text"
  placeholder="Add Subject"
  value={subjectInputs[c.id] || ""}
  onChange={(e) =>
    setSubjectInputs({
      ...subjectInputs,
      [c.id]: e.target.value
    })
  }
/>

        <button
          className="small-btn"
          onClick={() => addSubject(c.id, c.subjects)}
        >
          Add
        </button>
      </div>
    </div>

    <button
      className="delete-btn"
      onClick={() => deleteClass(c.id)}
    >
      <FaTrash />
    </button>
  </div>
))}

          </div>
        )}
      </div>
      </div>

<div className="settings-right">
  <SchoolScheduleCalendar adminUid={adminUid} />
</div>


  
      {/* STYLES */}
      <style>{styles}</style>
    </div>
  );
}
  const styles = `
:root {
  --primary: #4f46e5;
  --bg: #f5f7fb;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
}

* {
  box-sizing: border-box;
}

.settings-page {
  min-height: 100vh;
  padding: env(safe-area-inset-top) 16px env(safe-area-inset-bottom);
  background: var(--bg);
  font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  font-size: 26px;
}

.settings-header p {
  color: var(--muted);
  font-size: 14px;
}

.settings-card {
  background: var(--card);
  padding: 18px;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}

.card-title {
  margin-bottom: 14px;
  font-size: 18px;
}
.input-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (min-width: 600px) {
  .input-row {
    flex-direction: row;
  }
}


.input-group {
  flex: 1;
  min-width: 140px;
}

.input-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--muted);
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 15px;
  -webkit-appearance: none;
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

.primary-btn {
  width: 100%;
  margin-top: 14px;
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
}

.class-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.class-item {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 16px;
}

@media (min-width: 768px) {
  .settings-page {
    padding: 40px;
  }
}
.year-table {
  margin-top: 16px;
  overflow-x: auto;
}

.year-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.year-table th,
.year-table td {
  padding: 10px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.year-table th {
  background: #f9fafb;
  font-weight: 600;
}

.year-table .success {
  color: #16a34a;
  font-weight: 600;
}
.section-text {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
}
.subject-text {
  font-size: 13px;
  color: #374151;
  margin-top: 4px;
}

.subject-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.small-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.settings-wrapper {
  display: flex;
  flex-direction: column; /* mobile default */
  gap: 20px;
  padding: 16px;
}

/* Mobile Order Change */
.settings-right {
  order: -1;   /* 👈 This makes calendar come FIRST */
}

.settings-left {
  order: 1;
}
@media (min-width: 768px) {
  .settings-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }

  .settings-right {
    order: 2;        /* Reset order */
    flex: 1;
    position: sticky;
    top: 20px;
  }

  .settings-left {
    order: 1;
    flex: 2;
  }
}
.timing-card {
  padding: 30px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #334155;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 25px 0;
}

.duration-box {
  margin-top: 12px;
  padding: 10px 14px;
  background: #f1f5f9;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
}

.validation-area {
  margin-top: 20px;
}

.error-box {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.success-box {
  background: #dcfce7;
  color: #166534;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.save-btn {
  margin-top: 25px;
  width: 100%;
}


`;
  