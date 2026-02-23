import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../dashboard_styles/teachertimetable.css";
export default function TeacherTimetable() {

  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [topicProgress, setTopicProgress] = useState({});

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
        const progressMap = {};

for (const [date, periods] of Object.entries(snap.data().schedules || {})) {

  for (const p of periods) {

    if (!p.subject) continue;

    const subjectRef = doc(
      db,
      "users",
      adminUid,
      "coursePlanner",
      p.classId,
      "subjects",
      p.subject
    );

    const subjectSnap = await getDoc(subjectRef);

    if (subjectSnap.exists()) {

      const topics = subjectSnap.data().topics || [];

      const currentTopic = topics.find(
        t => t.name === p.topic
      );

      if (currentTopic) {
        progressMap[`${date}_${p.subject}_${p.topic}`] = {
          completed: currentTopic.completedPeriods || 0,
          total: currentTopic.periods
        };
      }
    }
  }
}

setTopicProgress(progressMap);
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
                  <td>
  {p.topic ? (
    (() => {
      const key = `${date}_${p.subject}_${p.topic}`;
      const progress = topicProgress[key];

      if (!progress) return p.topic;

      const percent =
        (progress.completed / progress.total) * 100;

      return (
        <div>
          <div>{p.topic}</div>

          <div style={{ fontSize: "12px", color: "#666" }}>
            {progress.completed}/{progress.total} periods
          </div>

          <div
            style={{
              background: "#e5e7eb",
              height: "6px",
              borderRadius: "4px",
              marginTop: "4px"
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                background:
                  percent === 100 ? "#22c55e" : "#3b82f6",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      );
    })()
  ) : "-"}
</td>
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