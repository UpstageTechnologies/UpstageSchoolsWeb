  import React, { useEffect, useState } from "react";
  import {
    collection,
    getDocs,
    setDoc,
    doc,
    getDoc,
    Timestamp
  } from "firebase/firestore";
  import { db } from "../../services/firebase";
  import "../dashboard_styles/Attendance.css";

  export default function TeacherAttendance({ teacherId, 
    globalSearch,
    selectedClass,
  selectedSection }) {
    console.log("✅ PAGE:", "TeacherAttendance");
    const adminUid   = localStorage.getItem("adminUid");
    const teacherIdLocal =
    teacherId || localStorage.getItem("teacherId");

    const [assigned, setAssigned] = useState(null);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const filteredStudents = students.filter((s) => {

      const matchSearch =
        `${s.studentName || ""} ${s.studentId || ""}`
          .toLowerCase()
          .includes(globalSearch?.toLowerCase() || "");
    
      const matchClass = selectedClass
        ? s.class === selectedClass
        : true;
    
      const matchSection = selectedSection
        ? s.section === selectedSection
        : true;
    
      return matchSearch && matchClass && matchSection;
    });
    const [records, setRecords]   = useState({});
    const [lateTimes, setLateTimes] = useState({});
    
const role = localStorage.getItem("role");
const isAdmin = role === "admin" || role === "master";
useEffect(() => {
  console.log("adminUid:", adminUid);
  if (!adminUid) return;

  const role = localStorage.getItem("role");
  const isAdminNow = role === "admin" || role === "master";

  if (!isAdminNow) return;

  async function loadClasses() {
    const snap = await getDocs(
      collection(db, "users", adminUid, "Classes")
    );

    const list = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name,
      sections: d.data().sections || []
    }));

    setClasses(list);
  }

  loadClasses();
}, [adminUid]);

    const [date, setDate] = useState(
      new Date().toISOString().substring(0, 10)
    );

    const [history, setHistory] = useState({});
    const [dayLabels, setDayLabels] = useState([]);
    /* 1️⃣ Load teacher assigned class */
    useEffect(() => {
      async function loadTeacher() {
        console.log("TeacherId:", teacherIdLocal);
    
        if (!adminUid || !teacherIdLocal) return;
    
        const q = collection(db, "users", adminUid, "teachers");
        const snap = await getDocs(q);
    
        snap.forEach(docSnap => {
          const t = docSnap.data();
    
          if (t.teacherId === teacherIdLocal) {
            setAssigned((t.assignedClasses || [])[0] || null);
          }
        });
      }
    
      loadTeacher();
    }, [adminUid, teacherIdLocal]);

    /* 2️⃣ Load students + attendance + history */
    useEffect(() => {
      async function load() {
     

        const sSnap = await getDocs(
          collection(db, "users", adminUid, "students")
        );

        const list = sSnap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .sort((a, b) => a.studentName.localeCompare(b.studentName));

        setStudents(list);
        const classKey =
        selectedClass && selectedSection
          ? `${selectedClass}_${selectedSection}`
          : "all_students";
     

        const today = await getDoc(
          doc(db, "users", adminUid, "attendance", classKey, "dates", date)
        );
        if (today.exists()) {
          const data = today.data();
        
          const saved = data.records || {};
          const merged = {};
        
          list.forEach(s => {
            merged[s.id] = saved[s.id] || "";
          });
        
          setRecords(merged);
        
          const savedLate = data.lateTimes || {};
          const mergedLate = {};
        
          list.forEach(s => {
            if (savedLate[s.id]) {
              mergedLate[s.id] = savedLate[s.id];
            }
          });
        
          setLateTimes(mergedLate);
        } else {
          const init = {};
          list.forEach(s => (init[s.id] = ""));
          setRecords(init);
          setLateTimes({});
        }

        /* previous 7 days */
        const hist = {};
        const labels = [];

        for (let i = 1; i <= 7; i++) {
          const d = new Date(date);
          d.setDate(d.getDate() - i);

          const y = d.toISOString().substring(0, 10);
          const day = String(d.getDate()).padStart(2, "0");
          labels.push(day);
          const past = await getDoc(
            doc(db, "users", adminUid, "attendance", classKey, "dates", y)
          );

          if (past.exists()) {
            const rec = past.data().records || {};
            list.forEach(s => {
              if (!hist[s.id]) hist[s.id] = [];
              hist[s.id].push(rec[s.id] || null);
            });
          } else {
            list.forEach(s => {
              if (!hist[s.id]) hist[s.id] = [];
              hist[s.id].push(null);
            });
          }
        }

        Object.keys(hist).forEach(k => hist[k].reverse());
        setHistory(hist);
        setDayLabels(labels.reverse());
      }

      load();
    }, [assigned, date, adminUid, selectedClass, selectedSection]);
    async function saveAttendance() {
      try {
        // 🔥 group students by class + section
        const grouped = {};
    
        students.forEach((s) => {
          const key = `${s.class}_${s.section}`;
    
          if (!grouped[key]) {
            grouped[key] = {
              records: {},
              lateTimes: {}
            };
          }
    
          grouped[key].records[s.id] = records[s.id] || "";
          
          if (lateTimes[s.id]) {
            grouped[key].lateTimes[s.id] = lateTimes[s.id];
          }
        });
    
        // 🔥 save each class separately
        for (const classKey in grouped) {
          await setDoc(
            doc(db, "users", adminUid, "attendance", classKey, "dates", date),
            {
              date,
              class: classKey.split("_")[0],
              section: classKey.split("_")[1],
              records: grouped[classKey].records,
              lateTimes: grouped[classKey].lateTimes,
              updatedAt: Timestamp.now()
            },
            { merge: true }
          );
        }
    
        alert("✅ Attendance Saved (Class Wise)");
      } catch (err) {
        console.error(err);
        alert("❌ Save failed");
      }
    }


    return (
      
      <div className="tt-container">
 {false && (
  <div>
    {classes.length === 0 ? (
      <p>Loading classes...</p>
    ) : (
      <div className="class-grid">
        {classes.map(c => (
          <button key={c.id} onClick={() => handleClassClick(c)}>
            Class {c.name}
          </button>
        ))}
      </div>
    )}
  </div>
)}
{false && (
  <div>
    <h3>Select Section</h3>
    {sections.map(sec => (
      <button key={sec} onClick={() => handleSectionClick(sec)}>
        Section {sec}
      </button>
    ))}
  </div>
)}
        {true && (
          <>
            <h3>
            All Students Attendance
</h3>

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />

            {students.length > 0 && (
              <table className="attendance-table">
              <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Status</th>

                    <th colSpan={dayLabels.length} style={{ textAlign: "center" }}>
                      Previous 7 Days
                    </th>
                  </tr>

                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>

                    {dayLabels.map((d, i) => (
                      <th key={i} style={{ textAlign: "center", width: 32 }}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                {filteredStudents.map(s => (
                    < React.Fragment key={s.id}>
                    <tr>
                      <td data-label="Name ">{s.studentName}</td>
                      <td data-label="Student Id">{s.studentId}</td>

                      <td>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" ,width: "100%"}}>
                          {["present", "absent", "late"].map(st => (
                            <button
                              key={st}
                              onClick={async () => {
                                const updated = { ...records, [s.id]: st };
                                setRecords(updated);
                              
                                const classKey =
                                  selectedClass && selectedSection
                                    ? `${selectedClass}_${selectedSection}`
                                    : "all_students";
                              
                                await setDoc(
                                  doc(db, "users", adminUid, "attendance", classKey, "dates", date),
                                  {
                                    records: updated,
                                    lateTimes,
                                    updatedAt: Timestamp.now()
                                  },
                                  { merge: true }
                                );
                              }}
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

                          {records[s.id] === "late" && lateTimes[s.id] && (
                            <span style={{ fontSize: 12, color: "#555" }}>
                              ⏰ {lateTimes[s.id]}
                            </span>
                          )}
                        </div>
                      </td>

                      {dayLabels.map((_, i) => {
                        const st = (history[s.id] || [])[i];

                        return (
                          <td key={i}  className="prev-cell" style={{ textAlign: "center", width: 40 , }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color:
                                  st === "present" ? "green" :
                                  st === "absent" ? "red" :
                                  "#c9a000"
                              }}
                            >
                              {st === "present" ? "✔"
                                : st === "absent" ? "✖"
                                : st ? "L" : "—"}
                            </span>
                          </td>
                        );
                      })}
                      
                    </tr>
                  
                    <tr className="mobile-prev-row">
    <td colSpan={dayLabels.length + 3}>
      <div className="prev-box"  style={{justifyContent: "center" ,width: "100%" , alignItems: "center"}}>

        {/* dates — SAME ORDER AS DESKTOP */}
        <div className="prev-dates">
          {dayLabels.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* icons — SAME ORDER AS DESKTOP */}
        <div className="prev-row">
    {(history[s.id] || []).map((st, i) => (
      <span
        key={i}
        className="prev-icon"
        style={{
          fontWeight: 700,
          color:
            st === "present"
              ? "green"
              : st === "absent"
              ? "red"
              : "#c9a000"
        }}
      >
        {st === "present"
          ? "✔"
          : st === "absent"
          ? "✖"
          : st
          ? "L"
          : "—"}
      </span>
    ))}
  </div>


      </div>
    </td>
  </tr>

  </React.Fragment>

                    
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
      </div>
    );
  }
