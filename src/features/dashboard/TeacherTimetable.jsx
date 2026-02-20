import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../dashboard_styles/teachertimetable.css";
export default function TeacherTimetable() {

  const [schedules, setSchedules] = useState({});
  
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {

    const loadTimetable = async () => {

      try {
        const teacherDocId = localStorage.getItem("teacherDocId");
        const adminUid = localStorage.getItem("adminUid");

        if (!teacherDocId || !adminUid) {
          setLoading(false);
          return;
        }

        const timetableRef = doc(
          db,
          "users",
          adminUid,
          "teacherTimetables",
          teacherDocId
        );

        const snap = await getDoc(timetableRef);

        if (snap.exists()) {
          setSchedules(snap.data().schedules || {});
        } else {
          setSchedules({});
        }

      } catch (error) {
        console.error("Error loading timetable:", error);
      }

      setLoading(false);
    };

    loadTimetable();

  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="Heading">
      <h2>My Timetable</h2>

      {Object.keys(schedules).length === 0 && (
        <p className="subheading">No timetable assigned</p>
      )}
{Object.entries(schedules).map(([date, periods]) => (
  <div className="tablecard" key={date}>
          <h3>{date}</h3>

          <table className="tabel">
            <thead>
              <tr>
                <th>Class</th>
                <th>Section</th>
                <th>Subject</th>
                <th>Topic</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>

            <tbody>
              {periods.map((p, i) => (
                <tr key={`${date}-${i}`}>
                  <td>{p.classId}</td>
                  <td>{p.section}</td>
                  <td>{p.subject}</td>
                  <td>{p.topic || "-"}</td>
                  <td>{p.start}</td>
                  <td>{p.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}