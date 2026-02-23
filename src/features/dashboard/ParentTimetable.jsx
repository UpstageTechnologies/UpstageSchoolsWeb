import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import "../dashboard_styles/TeacherTimetable.css";

export default function ParentTimetable() {

  const adminUid = localStorage.getItem("adminUid");
  const parentId =
  localStorage.getItem("viewId") ||
  localStorage.getItem("parentId");

  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedDate = new Date().toISOString().split("T")[0];

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    const loadStudents = async () => {
      if (!adminUid || !parentId) return;

      const q = query(
        collection(db, "users", adminUid, "students"),
        where("parentId", "==", parentId)
      );

      const snap = await getDocs(q);

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setStudents(list);

      if (list.length > 0) {
        setActiveStudent(list[0]);
      }

      setLoading(false);
    };

    loadStudents();
  }, [adminUid, parentId]);
  useEffect(() => {
    const loadTimetable = async () => {
  
      if (!adminUid || !activeStudent) return;
  
      const docId =
        `${activeStudent.class}_${activeStudent.section}`;
  
      const timetableRef = doc(
        db,
        "users",
        adminUid,
        "timetables",
        docId
      );
  
      const snap = await getDoc(timetableRef);
  
      if (!snap.exists()) {
        setSlots([]);
        return;
      }
  
      const data = snap.data();
      const cycles = data.cycles || {};
  
      // Always show Day1 for now
      const dayKey = "Day1";
  
      setSlots(cycles[dayKey] || []);
    };
  
    loadTimetable();
  }, [activeStudent, adminUid]);

  if (loading) return <div className="Heading"><h2>Loading...</h2></div>;

  return (
    <div className="Heading">

      <h2>My Child Timetable</h2>

      {/* 🔥 CHILD SELECTOR */}
      {students.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          {students.map((s) => (
            <button
              key={s.studentId}
              onClick={() => setActiveStudent(s)}
              style={{
                marginRight: 10,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background:
                  activeStudent?.studentId === s.studentId
                    ? "#4f46e5"
                    : "#cbd5e1",
                color:
                  activeStudent?.studentId === s.studentId
                    ? "#fff"
                    : "#000"
              }}
            >
              {s.studentName}
            </button>
          ))}
        </div>
      )}

      {/* 🔹 TIMETABLE TABLE */}
      {activeStudent && (
        <div className="tablecard">
          <h3>
            {activeStudent.studentName} - Class {activeStudent.class}{activeStudent.section}
          </h3>

          {slots.length === 0 ? (
            <p className="subheading">No timetable found</p>
          ) : (
            <table className="tabel">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, i) => (
                  <tr key={i}>
                    <td>{slot.label}</td>
                    <td>{slot.start}</td>
                    <td>{slot.end}</td>
                    <td>
                      {slot.type === "break"
                        ? "Break"
                        : slot.subject || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}