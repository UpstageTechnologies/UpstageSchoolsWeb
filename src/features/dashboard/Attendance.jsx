import React, { useEffect, useState } from "react";
import { collection, getDocs, setDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function Attendance({ adminUid }) {

  const uid = adminUid || localStorage.getItem("adminUid");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chartData, setChartData] = useState(null);

  // 🔥 NEW — store percentages
  const [percentages, setPercentages] = useState(null);

  const loadStudents = async () => {
    if (!uid || !selectedClass || !selectedSection) return;

    const snap = await getDocs(collection(db, "users", uid, "students"));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const filtered = all
      .filter(s =>
        String(s.className) === String(selectedClass) &&
        String(s.section).toUpperCase() === String(selectedSection).toUpperCase()
      )
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    setStudents(filtered);

    const docId = `${date}_${selectedClass}_${selectedSection}`;
    const attendRef = doc(db, "users", uid, "attendance", docId);
    const attendSnap = await getDoc(attendRef);

    if (attendSnap.exists()) {
      setRecords(attendSnap.data().records || {});
    } else {
      const initial = {};
      filtered.forEach(s => (initial[s.id] = "present"));
      setRecords(initial);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection, date]);

  const saveAttendance = async () => {
    if (!uid || !students.length) return;

    const docId = `${date}_${selectedClass}_${selectedSection}`;

    await setDoc(
      doc(db, "users", uid, "attendance", docId),
      {
        date,
        class: selectedClass,
        section: selectedSection,
        records,
        createdAt: Timestamp.now()
      },
      { merge: true }
    );

    alert("✅ Attendance saved");
  };

  /* ========= POPUP + CHART ========= */
  const openStudentPopup = async (student) => {
    if (!fromDate || !toDate) {
      alert("👉 Please select From & To date first.");
      return;
    }

    setSelectedStudent(student);

    const snap = await getDocs(collection(db, "users", uid, "attendance"));

    let present = 0, absent = 0, late = 0;
    let total = 0;

    snap.docs.forEach(d => {
      const data = d.data();
      if (!data?.records) return;

      if (
        data.date >= fromDate &&
        data.date <= toDate &&
        data.class === selectedClass &&
        data.section === selectedSection
      ) {
        total++;
        const status = data.records[student.id];

        if (status === "present") present++;
        else if (status === "absent") absent++;
        else if (status === "late") late++;
      }
    });

    // 🔥 calculate % (avoid divide by zero)
    const pct = {
      present: total ? Math.round((present / total) * 100) : 0,
      absent: total ? Math.round((absent / total) * 100) : 0,
      late: total ? Math.round((late / total) * 100) : 0
    };

    setPercentages(pct);

    setChartData({
      labels: ["Present", "Absent", "Late"],
      datasets: [
        {
          data: [present, absent, late],
          backgroundColor: ["#4caf50", "#e74c3c", "#f1c40f"]
        }
      ]
    });
  };

  return (
    <div className="teacher-page">
      <h2>Attendance</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">Class</option>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>

        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
          <option value="">Section</option>
          {SECTIONS.map(s => <option key={s}>{s}</option>)}
        </select>

        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
  
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: 13, marginBottom: 2 }}>From</label>
    <input
      type="date"
      value={fromDate}
      onChange={e => setFromDate(e.target.value)}
    />
  </div>

  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: 13, marginBottom: 2 }}>To</label>
    <input
      type="date"
      value={toDate}
      onChange={e => setToDate(e.target.value)}
    />
  </div>

</div>


      {students.length === 0 && <p>Select class + section to load students.</p>}

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
                <td
                  style={{ color: "#000", cursor: "pointer" }}
                  onClick={() => openStudentPopup(s)}
                >
                  {s.studentName}
                </td>

                <td>{s.studentId}</td>

                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["present", "absent", "late"].map(status => (
                      <button
                        key={status}
                        onClick={() => setRecords({ ...records, [s.id]: status })}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          background:
                            records[s.id] === status
                              ? status === "present"
                                ? "#4caf50"
                                : status === "absent"
                                ? "#e74c3c"
                                : "#f1c40f"
                              : "#fff",
                          color: records[s.id] === status ? "#fff" : "#333",
                          fontWeight: 600
                        }}
                      >
                        {status[0].toUpperCase() + status.slice(1)}
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
        <>
          <br />
          <button className="save" onClick={saveAttendance}>Save Attendance</button>
        </>
      )}

      {selectedStudent && chartData && (
        <div className="att-modal">
          <div className="att-modal-content">
            <h4>{selectedStudent.studentName} — Attendance</h4>

            <div className="chart-box">
              <Pie
                data={chartData}
                options={{
                  responsive: false,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } }
                }}
              />
            </div>

            {/*  PERCENTAGE TEXT */}
            {percentages && (
              <div style={{ marginTop: 10 }}>
                <p><b>Present:</b> {percentages.present}%</p>
                <p><b>Absent:</b> {percentages.absent}%</p>
                <p><b>Late:</b> {percentages.late}%</p>
              </div>
            )}

            <button className="close-btn" onClick={() => setSelectedStudent(null)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
