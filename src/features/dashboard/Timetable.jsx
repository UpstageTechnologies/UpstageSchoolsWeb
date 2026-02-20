import { useEffect, useState } from "react";
import { doc, getDoc, getDocs, setDoc, collection } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import "../dashboard_styles/timetable.css";


export default function Timetable({ classId }) {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");
    const [editingSection, setEditingSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [slots, setSlots] = useState([]);
  const [academicStart, setAcademicStart] = useState(null);
const [academicEnd, setAcademicEnd] = useState(null);
const [isLeaveDay, setIsLeaveDay] = useState(false);
const [className, setClassName] = useState("");
const [subjectTopics, setSubjectTopics] = useState({});
const [teachers, setTeachers] = useState([]);
const [sectionTeachers, setSectionTeachers] = useState({});
const [selectedTeacher, setSelectedTeacher] = useState({});
const [saveStatus, setSaveStatus] = useState("idle"); 
// idle | saving | success
// idle | saving | success
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  useEffect(() => {
    const loadAcademicYear = async () => {
      if (!adminUid) return;
  
      const ref = doc(
        db,
        "users",
        adminUid,
        "SchoolSettings",
        "academicYear"
      );
  
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        setAcademicStart(snap.data().startDate);
        setAcademicEnd(snap.data().endDate);
  
        // 🔥 If selectedDate outside → reset to startDate
        if (selectedDate < snap.data().startDate) {
          setSelectedDate(snap.data().startDate);
        }
      }
    };
  
    loadAcademicYear();
  }, [adminUid]);
  
  // 🔹 Load Sections + Subjects
  useEffect(() => {
    const loadClassData = async () => {
      if (!adminUid || !classId) return;

      const ref = doc(db, "users", adminUid, "Classes", classId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
      
        setSections(data.sections || []);
        setClassSubjects(data.subjects || []);
        setClassName(data.name || "");
      
        // 🔥 VERY IMPORTANT
        setSectionTeachers(data.sectionTeachers || {});
      }
    };

    loadClassData();
  }, [adminUid, classId]);
  useEffect(() => {
    const loadAllTopics = async () => {
      if (!adminUid || !classId || classSubjects.length === 0) return;
  
      const topicMap = {};
  
      for (const subject of classSubjects) {
        const topicRef = doc(
          db,
          "users",
          adminUid,
          "coursePlanner",
          classId,
          "subjects",
          subject
        );
  
        const snap = await getDoc(topicRef);
  
        topicMap[subject] = snap.exists()
          ? snap.data().topics || []
          : [];
      }
  
      setSubjectTopics(topicMap);
    };
  
    loadAllTopics();
  }, [classSubjects, adminUid, classId]);
  
  const changeDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
  
    const newDate = current.toISOString().split("T")[0];
  
    // 🔥 Restrict inside academic range
    if (
      (academicStart && newDate < academicStart) ||
      (academicEnd && newDate > academicEnd)
    ) {
      return;
    }
  
    setSelectedDate(newDate);
  };

  // 🔹 Generate Slots
  const generateTimeSlots = (timingData) => {
    const {
      schoolStartTime,
      periodCount,
      periodDuration,
      breakCount,
      breakDuration
    } = timingData;

    let result = [];
    let current = new Date(`1970-01-01T${schoolStartTime}`);

    for (let i = 1; i <= periodCount; i++) {
      let start = new Date(current);
      current.setMinutes(current.getMinutes() + Number(periodDuration));
      let end = new Date(current);

      result.push({
        type: "period",
        label: `P${i}`,
        start: start.toTimeString().slice(0,5),
        end: end.toTimeString().slice(0,5),
        subject: ""
      });

      if (breakCount > 0 && i === Math.floor(periodCount / 2)) {
        let bStart = new Date(current);
        current.setMinutes(current.getMinutes() + Number(breakDuration));
        let bEnd = new Date(current);

        result.push({
          type: "break",
          label: "Break",
          start: bStart.toTimeString().slice(0,5),
          end: bEnd.toTimeString().slice(0,5)
        });
      }
    }

    return result;
  };
  const handleSectionClick = async (sectionName) => {
    if (!adminUid) return;
  
    setActiveSection(sectionName); // 👈 FIRST set section
  
    const cycleNumber = getCycleDay(selectedDate);
    const cycleKey = `Day${cycleNumber}`;
  
    const timetableRef = doc(
      db,
      "users",
      adminUid,
      "timetables",
      `${classId}_${sectionName}`
    );
  
    const snap = await getDoc(timetableRef);
  
    if (snap.exists()) {
      const data = snap.data();
      const cycleData = data.cycles?.[cycleKey];
  
      if (cycleData && cycleData.length > 0) {
        setSlots(cycleData);
      } else {
        await createNewCycle(timetableRef, cycleKey);
      }
    } else {
      await createNewCycle(timetableRef, cycleKey);
    }
  };
  const handleAssignTeacher = async (section) => {
    const teacher = selectedTeacher[section];
  
    if (!teacher) return alert("Select teacher first");
  
    const ref = doc(db, "users", adminUid, "Classes", classId);
  
    const teacherData = {
      teacherId: teacher.teacherId || "",
      name: teacher.name || "",
      photoURL: teacher.photoURL || ""
    };
  
    await setDoc(
      ref,
      {
        sectionTeachers: {
          [section]: teacherData
        }
      },
      { merge: true }
    );
  
    setSectionTeachers(prev => ({
      ...prev,
      [section]: teacherData
    }));
  
    // 🔥 Automatically open timetable
    setActiveSection(section);
  };
  
  
  
  const createNewCycle = async (timetableRef, cycleKey) => {
    const timingRef = doc(
      db,
      "users",
      adminUid,
      "SchoolSettings",
      "timing"
    );
  
    const timingSnap = await getDoc(timingRef);
  
    if (!timingSnap.exists()) {
      alert("Please set school timing first");
      return;
    }
  
    const generatedSlots = generateTimeSlots(timingSnap.data());
  
    await setDoc(
      timetableRef,
      {
        cycles: {
          [cycleKey]: generatedSlots
        }
      },
      { merge: true }
    );
  
    setSlots(generatedSlots);
  };
  const updateTopicProgress = async () => {

    const teacherGrouped = {};
  
    slots.forEach(slot => {
      if (!slot.teacherId || slot.type === "break") return;
  
      if (!teacherGrouped[slot.teacherId]) {
        teacherGrouped[slot.teacherId] = [];
      }
  
      teacherGrouped[slot.teacherId].push({
        classId: className,
        section: activeSection,
        subject: slot.subject,
        topic: slot.topic || "",
        start: slot.start,
        end: slot.end
      });
    });
  
    for (const teacherId in teacherGrouped) {
  
      const teacherRef = doc(
        db,
        "users",
        adminUid,
        "teacherTimetables",
        teacherId
      );
  
      // 🔥 FIRST GET OLD DATA
      const snap = await getDoc(teacherRef);
  
      let existingSchedules = {};
  
      if (snap.exists()) {
        existingSchedules = snap.data().schedules || {};
      }
  
      // 🔥 UPDATE ONLY CURRENT DATE
      existingSchedules[selectedDate] = teacherGrouped[teacherId];
  
      await setDoc(
        teacherRef,
        {
          schedules: existingSchedules
        },
        { merge: true }
      );
  
      console.log("Saved for teacher:", teacherId);
    }
  };
  
  const saveChanges = async () => {
    try {
      setSaveStatus("saving");
  
      await updateTopicProgress();
  
      // 🔥 RELOAD TOPICS AFTER UPDATE
      const topicMap = {};
      for (const subject of classSubjects) {
        const topicRef = doc(
          db,
          "users",
          adminUid,
          "coursePlanner",
          classId,
          "subjects",
          subject
        );
  
        const snap = await getDoc(topicRef);
        topicMap[subject] = snap.exists()
          ? snap.data().topics || []
          : [];
      }
  
      setSubjectTopics(topicMap);
  
      const cycleNumber = getCycleDay(selectedDate);
      const cycleKey = `Day${cycleNumber}`;
  
      const timetableRef = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${classId}_${activeSection}`
      );
  
      await setDoc(
        timetableRef,
        {
          cycles: {
            [cycleKey]: slots
          }
        },
        { merge: true }
      );
  
      // ✅ Success state
      setSaveStatus("success");
  
      // 2 seconds aprm normal ku thirumba
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
  
    } catch (error) {
      console.error(error);
      setSaveStatus("idle");
    }
  };
  useEffect(() => {
    const loadCycleData = async () => {
      if (!adminUid || !activeSection) return;
  
      const cycleNumber = getCycleDay(selectedDate);
      const cycleKey = `Day${cycleNumber}`;
  
      const timetableRef = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${classId}_${activeSection}`
      );
  
      const snap = await getDoc(timetableRef);
  
      if (!snap.exists()) {
        await createNewCycle(timetableRef, cycleKey);
        return;
      }
  
      const data = snap.data();
      const cycleData = data.cycles?.[cycleKey];
  
      if (!cycleData || cycleData.length === 0) {
        await createNewCycle(timetableRef, cycleKey);
      } else {
        setSlots(cycleData);
      }
    };
  
    loadCycleData();
  }, [selectedDate, activeSection]);
  
  const TOTAL_CYCLE_DAYS = 6;
  const getCycleDay = (date) => {
    if (!academicStart) return 1;
  
    const start = new Date(academicStart);
    const current = new Date(date);
  
    // If Sunday → leave
    if (current.getDay() === 0) {
      setIsLeaveDay(true);
      return 1;
    }
  
    setIsLeaveDay(false);
  
    let workingDays = 0;
    let temp = new Date(start);
  
    while (temp <= current) {
      const day = temp.getDay();
      if (day !== 0) {
        workingDays++;
      }
      temp.setDate(temp.getDate() + 1);
    }
  
    return ((workingDays - 1) % 6) + 1;
  };
  const getCurrentTopic = (subject) => {
    const topics = subjectTopics[subject] || [];
  
    return topics.find(
      (t) => (t.completedPeriods || 0) < t.periods
    );
  };
  useEffect(() => {
    const loadTeachers = async () => {
      if (!adminUid) return;
  
      const snap = await getDocs(
        collection(db, "users", adminUid, "teachers")
      );
  
      const teacherList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      console.log("Teachers Loaded:", teacherList);
  
      setTeachers(teacherList);
    };
  
    loadTeachers();
  }, [adminUid]);
  
  const getMatchingTeachers = () => {
    if (!className || !activeSection) return [];
  
    const classNumber = className.toString().match(/\d+/)?.[0];
  
    return teachers.filter(t => {
      if (t.category !== "Teaching Staff") return false;
  
      return (t.assignedClasses || []).some(c => {
        return (
          String(c.class).trim() === String(classNumber).trim() &&
          String(c.section).trim().toUpperCase() ===
            String(activeSection).trim().toUpperCase()
        );
      });
    });
  };
  useEffect(() => {
    console.log("Teachers Loaded:", teachers);
  }, [teachers]);
  
  
  return (
    <div className="timetable-container">

      <h2 className="planner-title">Timetable Planner</h2>

      {/* SECTION LIST */}
      {!activeSection && (
  <div className="section-grid">
    {sections.map((sec, index) => (
      <div key={index} className="section-card">

        <h3>Section {sec}</h3>

        {sectionTeachers[sec] && editingSection !== sec ? (
  <div className="assigned-teacher-wrapper">
    <div
      className="assigned-teacher-card"
      onClick={() => handleSectionClick(sec)}
    >
      <img
        src={
          sectionTeachers[sec].photoURL ||
          `https://ui-avatars.com/api/?name=${sectionTeachers[sec].name}`
        }
        alt="teacher"
        className="teacher-photo"
      />
      <div>
        <p>{sectionTeachers[sec].name}</p>
        <span className="assigned-label">
          Class Teacher
        </span>
      </div>
    </div>

    {/* ✏️ Pencil Icon */}
    <span
      className="edit-teacher-icon"
      onClick={() => setEditingSection(sec)}
    >
      ✏️
    </span>
  </div>
) : (
  <>
    <select
      value={selectedTeacher[sec]?.id || ""}
      onChange={(e) => {
        const teacher = teachers.find(
          t => t.id === e.target.value
        );

        setSelectedTeacher(prev => ({
          ...prev,
          [sec]: teacher
        }));
      }}
    >
      <option value="">Select Teacher</option>
      {teachers.map(t => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>

    <button
      onClick={() => {
        handleAssignTeacher(sec);
        setEditingSection(null); // close edit mode
      }}
    >
      Assign
    </button>
  </>
)}
      </div>
    ))}
  </div>
)}


      {/* TIMETABLE VIEW */}
      {activeSection && (
        
       <div className="timetable-view">
        {/* 🔥 7 Day Strip */}
<div className="week-strip">
  {[...Array(7)].map((_, i) => {
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() - dateObj.getDay() + i + 1); // Monday start

    const formatted = dateObj.toISOString().split("T")[0];
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = dateObj.getDate();

    const isActive = formatted === selectedDate;

    return (
      <div
        key={i}
        className={`day-box ${isActive ? "active-day" : ""}`}
        onClick={() => setSelectedDate(formatted)}
      >
        <span className="day-name">{dayName}</span>
        <span className="day-number">{dayNum}</span>
      </div>
    );
  })}
</div>

<h3>
  Class {className}{activeSection}
</h3>

       <div className="date-nav">
         {academicStart && selectedDate > academicStart && (
           <button onClick={() => changeDate(-1)}>◀</button>
         )}
     
         <span>{selectedDate}</span>
     
         {academicEnd && selectedDate < academicEnd && (
           <button onClick={() => changeDate(1)}>▶</button>
         )}
       </div>
     
     
       {/* ✅ Leave Banner */}
       {isLeaveDay && (
         <div
           style={{
             background: "#fee2e2",
             color: "#b91c1c",
             padding: "12px",
             borderRadius: "8px",
             marginBottom: "15px",
             textAlign: "center",
             fontWeight: "600",
           }}
         >
           🚫 Leave Day — Timetable Locked
         </div>
       )}
     
     <div className="table-wrapper">
  <table className="timetable-table">
    <thead>
      <tr>
        <th>Slot</th>
        <th>Start</th>
        <th>End</th>
        <th>Subject</th>
      
        <th>Topic</th>
        <th>Teacher</th>
      
      </tr>
    </thead>

    <tbody>
      {isLeaveDay ? (
        <tr>
          <td colSpan="5" className="center-cell leave-cell">
            Leave Day
          </td>
        </tr>
      ) : slots.length === 0 ? (
        <tr>
          <td colSpan="5" className="center-cell">
            No Data Found
          </td>
        </tr>
      ) : (
        slots.map((slot, index) => (
          <tr key={index}>
            <td>{slot.label}</td>
            <td>{slot.start}</td>
            <td>{slot.end}</td>

            {slot.type === "break" ? (
              <>
                <td className="break-text">Break</td>
                <td className="break-text">—</td>
              </>
            ) : (
              <>
                {/* SUBJECT */}
                <td>
                  <select
                    disabled={isLeaveDay}
                    value={slot.subject || ""}
                    onChange={(e) => {
                      const selectedSubject = e.target.value;
                      const updated = [...slots];

                      updated[index].subject = selectedSubject;

                      const currentTopic =
                        getCurrentTopic(selectedSubject);

                      updated[index].topic =
                        currentTopic?.name || "";

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
        

                {/* TOPIC */}
                <td className="topic-cell">
                  {slot.subject ? (() => {
                    const topic = getCurrentTopic(slot.subject);

                    if (!topic) {
                      return (
                        <span className="topic-complete">
                          All Topics Completed ✓
                        </span>
                      );
                    }

                    const completed = topic.completedPeriods || 0;
                    const total = topic.periods;

                    return (
                      <div className="topic-wrapper">
                        <div className="topic-name">
                          {topic.name}
                        </div>

                        <div className="topic-progress">
                          {completed}/{total} periods
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(completed / total) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })() : "-"}
                </td>
                <td>
  {slot.subject ? (
    <select
      className="teacher-select"
      value={slot.teacherId || ""}
      onChange={(e) => {
        const teacher = teachers.find(
          t => t.id === e.target.value
        );

        const updated = [...slots];

        updated[index].teacherId = teacher?.id || "";
        updated[index].teacherName = teacher?.name || "";
        console.log("Assigned teacher:", teacher?.id);
        updated[index].teacherName = teacher?.name || "";

        setSlots(updated);
      }}
    >
      <option value="">Select Teacher</option>
      {getMatchingTeachers(slot.subject).map(t => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  ) : "-"}
</td>
              </>
            )}
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

     
<button
  className="save-btn"
  onClick={saveChanges}
  disabled={isLeaveDay || saveStatus === "saving"}
>
  {saveStatus === "saving"
    ? "Saving..."
    : saveStatus === "success"
    ? "Saved Successfully ✅"
    : "Save Changes"}
</button>
     </div>
      )}
    </div>
  );
}