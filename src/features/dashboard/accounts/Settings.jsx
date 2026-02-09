// ==============================
// Settings.jsx (Internal CSS Version)
// ==============================
import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, onSnapshot, doc, setDoc, getDoc  } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { FaTrash } from "react-icons/fa";


export default function Settings({ adminUid }) {
  const isNumberClass = (name) => /^\d+$/.test(name.trim());

  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
 
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
        name: d.data().name
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

    if (classes.some(c => c.name.toLowerCase() === className.toLowerCase())) {
      return alert("Class already exists");
    }

    await addDoc(collection(db, "users", adminUid, "Classes"), {
      name: className.trim(),
    });

    setClassName("","");
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
  
  return (
    <div className="settings-page">
  
      {/* HEADER */}
      <div className="settings-header">
        <h1>⚙️ School Settings</h1>
        <p>Manage academic year & classes</p>
      </div>
  
      {/* ACADEMIC YEAR */}
      <div className="settings-card">
        <h2 className="card-title">📅 Academic Year</h2>
  
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
                <span>Class {c.name}</span>
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
  gap: 10px;
  flex-wrap: wrap;
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

  .settings-card {
    max-width: 520px;
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

`;
  