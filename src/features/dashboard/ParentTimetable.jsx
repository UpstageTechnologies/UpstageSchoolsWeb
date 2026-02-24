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
import "../dashboard_styles/timetable.css";

export default function ParentTimetable() {
  useEffect(() => {
    console.log("ADMIN:", adminUid);
    console.log("PARENT:", parentId);
  }, []);
  // ✅ IMPORTANT
  const adminUid =
    localStorage.getItem("adminUid") ||
    localStorage.getItem("adminId");
    const parentId =
    localStorage.getItem("viewId") ||
    localStorage.getItem("parentId") ||
    localStorage.getItem("parentDocId");

  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {

    const loadStudents = async () => {

      if (!adminUid || !parentId) {
        console.log("Missing adminUid or parentId");
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "users", adminUid, "students"),
        where("parentId", "==", parentId)
      );

      const snap = await getDocs(q);

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      console.log("Students:", list);

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
  
      const q = query(
        collection(db, "users", adminUid, "timetables"),
        where("className", "==", activeStudent.class),
        where("section", "==", activeStudent.section)
      );
  
      const snap = await getDocs(q);
  
      if (snap.empty) {
        console.log("No timetable found");
        setSlots([]);
        return;
      }
  
      const data = snap.docs[0].data();
      const cycles = data.cycles || {};
  
      setSlots(cycles["Day1"] || []);
    };
  
    loadTimetable();
  
  }, [activeStudent, adminUid]);

  if (loading)
    return (
      <div className="Heading">
        <h2>Loading...</h2>
      </div>
    );

  return (
    <div className="Heading">

      <h2>My Child Timetable</h2>

      {/* 🔥 CHILD SWITCH BUTTONS */}
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

      {/* 🔹 TIMETABLE */}
      {activeStudent && (
        <div className="tablecard">
          <h3>
            {activeStudent.studentName} - Class{" "}
            {activeStudent.class}
            {activeStudent.section}
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