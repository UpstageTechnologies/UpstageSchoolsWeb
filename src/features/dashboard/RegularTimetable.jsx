import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/timetable.css";

export default function RegularTimetable() {

  const { docId } = useParams(); // example: 1_A
  const adminUid = localStorage.getItem("adminUid");

  const [activeDay, setActiveDay] = useState("Day1");
  const [slots, setSlots] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjectTopics, setSubjectTopics] = useState({});

  const cycleDays = ["Day1","Day2","Day3","Day4","Day5","Day6"];

  if (!docId) return null;

  const parts = docId.split("_");
  const className = parts[0];
  const section = parts[1];

  /* ===============================
     AUTO SLOT GENERATOR (IF EMPTY)
  =============================== */
  const generateDefaultSlots = () => {
    return [
      { type: "period", label: "P1", start: "09:00", end: "09:40" },
      { type: "period", label: "P2", start: "09:40", end: "10:20" },
      { type: "break", label: "Break", start: "10:20", end: "10:35" },
      { type: "period", label: "P3", start: "10:35", end: "11:15" },
      { type: "period", label: "P4", start: "11:15", end: "11:55" }
    ];
  };

  /* ===============================
     LOAD CLASS SUBJECTS
  =============================== */
  useEffect(() => {
    const loadClass = async () => {
      if (!adminUid) return;

      const ref = doc(db, "users", adminUid, "Classes", className);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setClassSubjects(snap.data().subjects || []);
      }
    };

    loadClass();
  }, [adminUid, className]);

  /* ===============================
     LOAD TEACHERS
  =============================== */
  useEffect(() => {
    const loadTeachers = async () => {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "teachers")
      );

      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTeachers(list);
    };

    loadTeachers();
  }, [adminUid]);

  /* ===============================
     LOAD DAY DATA
  =============================== */
  useEffect(() => {
    const loadDay = async () => {
      if (!adminUid) return;

      const ref = doc(
        db,
        "users",
        adminUid,
        "regularTimetables",
        docId
      );

      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const defaultSlots = generateDefaultSlots();
        setSlots(defaultSlots);

        await setDoc(ref, {
          cycles: { [activeDay]: defaultSlots }
        });

        return;
      }

      const data = snap.data();
      const daySlots = data?.cycles?.[activeDay];

      if (!daySlots || daySlots.length === 0) {
        const defaultSlots = generateDefaultSlots();
        setSlots(defaultSlots);

        await setDoc(ref, {
          cycles: { [activeDay]: defaultSlots }
        }, { merge: true });

      } else {
        setSlots(daySlots);
      }
    };

    loadDay();
  }, [activeDay, adminUid, docId]);

  /* ===============================
     GET CURRENT TOPIC
  =============================== */
  const getCurrentTopic = (subject) => {
    const topics = subjectTopics[subject] || [];
    return topics.find(
      (t) => (t.completedPeriods || 0) < t.periods
    );
  };

  /* ===============================
     SAVE
  =============================== */
  const saveDay = async () => {
    const ref = doc(
      db,
      "users",
      adminUid,
      "regularTimetables",
      docId
    );

    await setDoc(ref, {
      cycles: { [activeDay]: slots }
    }, { merge: true });

    alert("Saved Successfully ✅");
  };

  return (
    <div className="timetable-container">

      <h2 className="planner-title">
        Regular Timetable Setup
      </h2>

      <h3 style={{ marginBottom: "15px" }}>
        Class {className} - Section {section}
      </h3>

      {/* DAY BUTTONS */}
      <div className="day-tabs">
        {cycleDays.map(day => (
          <button
            key={day}
            className={activeDay === day ? "day-btn active" : "day-btn"}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="timetable-table">
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
            {slots.map((slot, index) => (
              <tr key={index}>
                <td>{slot.label}</td>
                <td>{slot.start}</td>
                <td>{slot.end}</td>

                {slot.type === "break" ? (
                  <>
                    <td>Break</td>
                    <td>—</td>
                  </>
                ) : (
                  <>
                    {/* SUBJECT */}
                    <td>
                      <select
                        value={slot.subject || ""}
                        onChange={(e) => {
                          const updated = [...slots];
                          updated[index].subject = e.target.value;
                          setSlots(updated);
                        }}
                      >
                       <option value="">Select</option>
                    {classSubjects.map((sub, i) => (
                      <option key={i} value={sub}>
                        {sub}
                      </option>
                       
                        ))}
                      </select>
                    </td>

                    {/* TEACHER */}
                    <td>
                      <select
                        value={slot.teacherId || ""}
                        onChange={(e)=>{
                          const updated = [...slots];
                          updated[index].teacherId = e.target.value;
                          setSlots(updated);
                        }}
                      >
                        <option value="">Select</option>
                        {teachers.map(t=>(
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="save-btn" onClick={saveDay}>
        Save Changes
      </button>
    </div>
  );
}