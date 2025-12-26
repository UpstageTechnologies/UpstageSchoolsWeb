import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  Timestamp,
  addDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/AdminTimetable.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

/* ⭐ SAME CLASSES YOU USED IN TIMETABLE */
const CLASSES = ["LKG","UKG","Play Group", ...Array.from({ length: 12 }, (_, i) => i + 1)];
const SECTIONS = ["A","B","C","D"];

/* 🔥 converts BOTH formats:
   26 / 12 / 2025   → Date()
   2025-12-26       → Date()
*/
function normalize(dateString) {
  if (!dateString) return null;

  if (dateString.includes("/")) {
    const [dd, mm, yyyy] = dateString.split("/").map(s => s.trim());
    return new Date(`${yyyy}-${mm}-${dd}`);
  }

  return new Date(dateString);
}

export default function Attendance({ adminUid }) {

  const uid = adminUid || localStorage.getItem("adminUid");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [percentages, setPercentages] = useState(null);

  /* ================= LOAD STUDENTS ================= */
  const loadStudents = async () => {
    if (!uid || !selectedClass || !selectedSection) return;

    const snap = await getDocs(collection(db, "users", uid, "students"));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const filtered = all
      .filter(
        s =>
          String(s.className) === String(selectedClass) &&
          String(s.section).toUpperCase() ===
            String(selectedSection).toUpperCase()
      )
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    setStudents(filtered);

    const docId = `${date}_${selectedClass}_${selectedSection}`;
    const attendSnap = await getDoc(
      doc(db, "users", uid, "attendance", docId)
    );

    if (attendSnap.exists()) setRecords(attendSnap.data().records || {});
    else {
      const init = {};
      filtered.forEach(s => (init[s.id] = "present"));
      setRecords(init);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection, date]);

  /* ================= SAVE ================= */
  const saveAttendance = async () => {
    if (!uid || !students.length) return;

    const docId = `${date}_${selectedClass}_${selectedSection}`;

    if (role === "sub_admin") {
      await addDoc(collection(db, "users", uid, "approval_requests"), {
        module: "attendance",
        action: "save",
        docId,
        payload: { date, class: selectedClass, section: selectedSection, records },
        status: "pending",
        createdBy: localStorage.getItem("adminId"),
        createdAt: Timestamp.now()
      });

      alert("⏳ Attendance request sent to Admin");
      return;
    }

    await setDoc(
      doc(db, "users", uid, "attendance", docId),
      { date, class: selectedClass, section: selectedSection, records, createdAt: Timestamp.now() },
      { merge: true }
    );

    alert("✅ Attendance saved");
  };

  /* ================= POPUP ANALYTICS ================= */
  const openStudentPopup = async student => {
    if (!fromDate || !toDate) return alert("Select From & To dates");
  
    setSelectedStudent(student);
  
    const snap = await getDocs(collection(db, "users", uid, "attendance"));
  
    let present = 0, absent = 0, late = 0, total = 0;
  
    const from = normalize(fromDate);
    const to   = normalize(toDate);
  
    snap.docs.forEach(d => {
      const a = d.data();
      const attDate = normalize(a.date);
  
      if (
        attDate &&
        attDate >= from &&
        attDate <= to &&
        a.class === selectedClass &&
        a.section === selectedSection
      ) {
        const st = a.records?.[student.id];
        if (!st) return;
  
        total++;
  
        if (st === "present") present++;
        else if (st === "absent") absent++;
        else if (st === "late") late++;
      }
    });
  
    const pct = {
      present: total ? Math.round((present / total) * 100) : 0,
      absent: total ? Math.round((absent / total) * 100) : 0,
      late: total ? Math.round((late / total) * 100) : 0
    };
  
    setPercentages(pct);
  
    setChartData({
      labels: ["Present", "Absent", "Late"],
      datasets: [{ data: [present, absent, late], backgroundColor: ["#4caf50", "#e74c3c", "#f1c40f"] }]
    });
  };
  

  const resetAll = () => {
    setSelectedClass(null);
    setSelectedSection(null);
    setStudents([]);
  };

  return (
    <div className="tt-container">

      {(selectedClass || selectedSection) && (
        <p className="back" onClick={() => {
          setSelectedClass("");
          setSelectedSection("");
        }}>
          ← Back
        </p>
      )}

      <h2 className="tt-title">Attendance</h2>

      {!selectedClass && (
        <div className="class-grid">
          {CLASSES.map(c => (
            <div key={c} className="class-card" onClick={() => setSelectedClass(c)}>
              {typeof c === "number" ? `${c} Std` : c}
            </div>
          ))}
        </div>
      )}

      {selectedClass && !selectedSection && (
        <>
          <h3 className="tt-sub">Class {selectedClass} — Select Section</h3>

          <div className="section-row">
            {SECTIONS.map(sec => (
              <div key={sec} className="section-btn" onClick={() => setSelectedSection(sec)}>
                {sec}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedClass && selectedSection && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass} — Section {selectedSection}
          </h3>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ marginBottom: 10 }}
          />

          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            <div>
              <label>From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>

            <div>
              <label>To</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>

          {students.length === 0 && <p>No students found.</p>}

          {students.length > 0 && (
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ cursor: "pointer" }} onClick={() => openStudentPopup(s)}>
                      {s.studentName}
                    </td>
                    <td>{s.studentId}</td>

                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["present", "absent", "late"].map(st => (
                          <button
                            key={st}
                            onClick={() => setRecords({ ...records, [s.id]: st })}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              background:
                                records[s.id] === st
                                  ? st === "present"
                                    ? "#4caf50"
                                    : st === "absent"
                                    ? "#e74c3c"
                                    : "#f1c40f"
                                  : "#fff",
                              color: records[s.id] === st ? "#fff" : "#333",
                              fontWeight: 600
                            }}
                          >
                            {st[0].toUpperCase() + st.slice(1)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {students.length > 0 && (
            <button className="save-btn" onClick={saveAttendance}>
              Save Attendance
            </button>
          )}
        </>
      )}

      {selectedStudent && chartData && (
        <div className="att-modal">
          <div className="att-modal-content">
            <h4>{selectedStudent.studentName}</h4>

            <Pie data={chartData} options={{ responsive: false }} />

            <p>Present: {percentages?.present}%</p>
            <p>Absent: {percentages?.absent}%</p>
            <p>Late: {percentages?.late}%</p>

            <button className="close-btn" onClick={() => setSelectedStudent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}