import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import "../dashboard_styles/teachertimetable.css";
export default function AdminTimetable() {

  const adminUid = localStorage.getItem("adminUid");
  const [teachersMap, setTeachersMap] = useState({});
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [slots, setSlots] = useState([]);

  /* ================= LOAD ALL CLASSES ================= */
  useEffect(() => {
    const loadClasses = async () => {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );

      setClasses(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    };

    loadClasses();
  }, [adminUid]);

  /* ================= LOAD SECTIONS WHEN CLASS SELECTED ================= */
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedClass) return;

      const ref = doc(db, "users", adminUid, "Classes", selectedClass);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSections(snap.data().sections || []);
      }

      setSelectedSection("");
      setSlots([]);
    };

    loadSections();
  }, [selectedClass]);

  /* ================= LOAD TIMETABLE ================= */
  useEffect(() => {
    const loadTimetable = async () => {
      if (!selectedClass || !selectedSection) return;

      const timetableRef = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${selectedClass}_${selectedSection}`
      );

      const snap = await getDoc(timetableRef);

      if (snap.exists()) {
        const data = snap.data();
        const cycles = data.cycles || {};

        // show Day1 by default
        const firstCycle = Object.keys(cycles)[0];
        setSlots(cycles[firstCycle] || []);
      } else {
        setSlots([]);
      }
    };

    loadTimetable();
  }, [selectedSection]);
  useEffect(() => {
    const loadTeachers = async () => {
      if (!adminUid) return;
  
      const snap = await getDocs(
        collection(db, "users", adminUid, "teachers")
      );
  
      const map = {};
      snap.docs.forEach(doc => {
        map[doc.id] = doc.data().name; // 👈 adjust if field different
      });
  
      setTeachersMap(map);
    };
  
    loadTeachers();
  }, [adminUid]);
  return (
    <div className="Heading">
      <h2>Admin Timetable Viewer</h2>

      {/* CLASS SELECT */}
      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">Select Class</option>
        {classes.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* SECTION SELECT */}
      {selectedClass && (
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">Select Section</option>
          {sections.map((sec, i) => (
            <option key={i} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      )}

      {/* TIMETABLE TABLE */}
      {selectedSection && (
  <div className="tablecard">
          {slots.length === 0 ? (
            <p>No timetable found</p>
          ) : (
            <table className="tabel">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, i) => (
                  <tr key={i}>
                    <td>{slot.label}</td>
                    <td>{slot.start}</td>
                    <td>{slot.end}</td>
                    <td>
                      {slot.type === "break" ? "Break" : slot.subject}
                    </td>
                    <td>
                      {slot.type === "break"
  ? "-"
  : teachersMap[slot.teacherId] || "-"}
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