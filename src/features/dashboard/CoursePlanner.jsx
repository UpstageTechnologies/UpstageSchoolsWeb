import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import "../dashboard_styles/coursePlanner.css";
export default function CoursePlanner({ classId }) {

  const navigate = useNavigate();
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);

  const [topicName, setTopicName] = useState("");
  const [days, setDays] = useState("");
  const [periods, setPeriods] = useState("");
  const [startDate, setStartDate] = useState("");
  const [academicStart, setAcademicStart] = useState("");
  const [academicEnd, setAcademicEnd] = useState("");
  
  useEffect(() => {
    const loadAcademicYear = async () => {
      const ref = doc(db, "users", adminUid, "SchoolSettings", "academicYear");
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        setAcademicStart(snap.data().startDate);
        setAcademicEnd(snap.data().endDate);
      }
    };
  
    if (adminUid) loadAcademicYear();
  }, [adminUid]);
  
  // 🔥 LOAD SUBJECTS + THEIR TOPICS (IMPORTANT FIX)
useEffect(() => {
    const loadSubjectsWithTopics = async () => {
      if (!adminUid || !classId) return;
  
      const classRef = doc(db, "users", adminUid, "Classes", classId);
      const classSnap = await getDoc(classRef);
  
      if (!classSnap.exists()) return;
  
      const subjectArray = classSnap.data().subjects || [];
  
      const subjectData = await Promise.all(
        subjectArray.map(async (subjectName) => {
  
          const topicRef = doc(
            db,
            "users",
            adminUid,
            "coursePlanner",
            classId,
            "subjects",
            subjectName
          );
  
          const topicSnap = await getDoc(topicRef);
  
          return {
            name: subjectName,
            topics: topicSnap.exists()
              ? topicSnap.data().topics || []
              : []
          };
        })
      );
  
      setSubjects(subjectData);
    };
  
    loadSubjectsWithTopics();
  }, [adminUid, classId]);
  

  // 🔥 LOAD SAVED TOPICS
  useEffect(() => {
    const loadTopics = async () => {
      if (!activeSubject) return;

      const ref = doc(
        db,
        "users",
        adminUid,
        "coursePlanner",
        classId,
        "subjects",
        activeSubject
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {
        const updated = subjects.map((s) =>
          s.name === activeSubject
            ? { ...s, topics: snap.data().topics || [] }
            : s
        );

        setSubjects(updated);
      }
    };

    loadTopics();
  }, [activeSubject]);

  // 🔥 ADD TOPIC
  const addTopic = async () => {
    if (!topicName || !days || !periods) return;
  
    const subjectObj = subjects.find((s) => s.name === activeSubject);
    const existingTopics = subjectObj?.topics || [];
  
    let calculatedStart;
  
    if (existingTopics.length === 0) {
      // 🔥 First topic = academic start date
      calculatedStart = academicStart;
    } else {
      // 🔥 Next topic start = last topic end + 1 day
      const lastTopic = existingTopics[existingTopics.length - 1];
      const next = new Date(lastTopic.endDate);
      next.setDate(next.getDate() + 1);
      calculatedStart = next.toISOString().split("T")[0];
    }
  
    const end = new Date(calculatedStart);
    end.setDate(end.getDate() + Number(days) - 1);
    const calculatedEnd = end.toISOString().split("T")[0];
  // Academic end as Date object
const academicEndDate = new Date(academicEnd);
const calculatedEndDate = new Date(calculatedEnd);

// ❌ If topic end goes beyond academic year
if (calculatedEndDate.getTime() > academicEndDate.getTime()) {
  alert(
    `Topic exceeds academic year limit.\nLast allowed date: ${academicEnd}`
  );
  return;
}

    const newTopic = {
      name: topicName,
      days: Number(days),
      periods: Number(periods),
      startDate: calculatedStart,
      endDate: calculatedEnd
    };
  
    const updatedTopics = [...existingTopics, newTopic];
  
    await setDoc(
      doc(
        db,
        "users",
        adminUid,
        "coursePlanner",
        classId,
        "subjects",
        activeSubject
      ),
      { topics: updatedTopics },
      { merge: true }
    );
  
    const updated = subjects.map((s) =>
      s.name === activeSubject
        ? { ...s, topics: updatedTopics }
        : s
    );
  
    setSubjects(updated);
  
    setTopicName("");
    setDays("");
    setPeriods("");
  };
  
  // 🔥 DELETE TOPIC
  const deleteTopic = async (index) => {
    const subjectObj = subjects.find((s) => s.name === activeSubject);

    const updatedTopics = subjectObj.topics.filter(
      (_, i) => i !== index
    );

    await setDoc(
      doc(
        db,
        "users",
        adminUid,
        "coursePlanner",
        classId,
        "subjects",
        activeSubject
      ),
      { topics: updatedTopics },
      { merge: true }
    );

    const updated = subjects.map((s) =>
      s.name === activeSubject
        ? { ...s, topics: updatedTopics }
        : s
    );

    setSubjects(updated);
  };

  return (
    <div className="planner-container">
     

      <h2 className="planner-title">Course Planner</h2>

      {/* SUBJECT CARDS */}
      <div className="subject-grid">
        {subjects.map((sub, index) => {
          const totalDays = sub.topics?.reduce(
            (sum, t) => sum + t.days,
            0
          );
          const totalPeriods = sub.topics?.reduce(
            (sum, t) => sum + t.periods,
            0
          );

          return (
            <div
              key={index}
              className="subject-card"
              onClick={() => setActiveSubject(sub.name)}
            >
              <h3>{sub.name}</h3>
              <div className="subject-stats">
                <div>
                  <span>Topics</span>
                  <strong>{sub.topics?.length || 0}</strong>
                </div>
                <div>
                  <span>Days</span>
                  <strong>{totalDays || 0}</strong>
                </div>
                <div>
                  <span>Periods</span>
                  <strong>{totalPeriods || 0}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TOPIC UI */}
      {activeSubject && (
        <div className="topic-section">
          <h3>Add Topic – {activeSubject}</h3>

          <div className="topic-form">
            <input
              placeholder="Topic Name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <input
              type="number"
              placeholder="Periods"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <button onClick={addTopic}>Add</button>
          </div>

          <div className="topic-list">
            {subjects
              .find((s) => s.name === activeSubject)
              ?.topics?.map((t, i) => (
                <div key={i} className="topic-row">
                  <span>{t.name}</span>
                  <span>{t.days} days</span>
                  <span>{t.periods} periods</span>
                  <span>
                    {t.startDate} → {t.endDate}
                  </span>
                  <button onClick={() => deleteTopic(i)}>
                    ❌
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
