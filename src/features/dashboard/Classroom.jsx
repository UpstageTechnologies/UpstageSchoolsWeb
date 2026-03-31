import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import { collection, getDocs ,getDoc , doc} from "firebase/firestore";
import { FaSchool, FaArrowRight } from "react-icons/fa";
import "../dashboard_styles/courses.css";

const Classroom = ({ handleMenuClick, activePage }) => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance,setAttendanceData]=useState("");
  const [selectedSection, setSelectedSection] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({}); 
  // 🔥 Fetch classes
  useEffect(() => {
    if (!adminUid) return;

    const loadClasses = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );

      const classList = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        sections: doc.data().sections || [],
        sectionTeachers: doc.data().sectionTeachers || {}   // ✅ ADD THIS
      }));

      setClasses(classList);
      setLoading(false);
    };

    loadClasses();
  }, [adminUid]);

  // 🔥 Check if section view
  const isSectionView = activePage?.startsWith("classroom-section-");

  let selectedClass = null;

  if (isSectionView) {
    const classId = activePage.split("-")[2];
    selectedClass = classes.find((c) => c.id === classId);
  }
  useEffect(() => {
    if (!adminUid) return;
  
    const loadStudents = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "students")
      );
  
      const list = snap.docs.map((doc) => doc.data());
  
      setStudents(list);
    };
  
    loadStudents();
  }, [adminUid]);
  useEffect(() => {
    if (!adminUid) return;
  
    const loadTeachers = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "teachers")
      );
  
      const list = snap.docs.map((doc) => doc.data());
  
      setTeachers(list);
    };
  
    loadTeachers();
  }, [adminUid]);
  useEffect(() => {
    if (!adminUid || classes.length === 0) return;
  
    const loadAttendance = async () => {
      const today = new Date().toISOString().substring(0, 10);
  
      let data = {};
  
      for (const c of classes) {
        for (const sec of c.sections) {
          const key = `${c.name}_${sec}`;
          const snap = await getDoc(
            doc(db, "users", adminUid, "attendance", key, "dates", today)
          );
  
          if (snap.exists()) {
            data[key] = snap.data().records || {};
          } else {
            data[key] = {};
          }
        }
      }
  
      setAttendanceData(data);
    };
  
    loadAttendance();
  }, [adminUid, classes]);

  const getAttendanceCount = async (className, section) => {
    try {
      const key = `${className.replace("Class ", "")}_${section}`;
      const today = new Date().toISOString().substring(0, 10);
  
      const snap = await getDoc(
        doc(db, "users", adminUid, "attendance", key, "dates", today)
      );
  
      if (!snap.exists()) {
        return { present: 0, absent: 0 };
      }
  
      const data = snap.data().records || {};
  
      let present = 0;
      let absent = 0;
  
      Object.values(data).forEach((v) => {
        if (v === "present") present++;
        if (v === "absent") absent++;
      });
  
      return { present, absent };
  
    } catch (err) {
      console.error("Attendance fetch error:", err);
      return { present: 0, absent: 0 };
    }
  };
  useEffect(() => {
    const loadAttendance = async () => {
      if (!classes.length) return;
  
      const map = {};
  
      for (const c of classes) {
        for (const sec of c.sections) {
          const key = `${c.name}_${sec}`;
  
          const data = await getAttendanceCount(c.name, sec);
          map[key] = data;
        }
      }
  
      setAttendanceMap(map);
    };
  
    loadAttendance();
  }, [classes]);
  const getClassTeacher = (classData, section) => {
    const teacher = classData.sectionTeachers?.[section];
  
    return teacher?.name || "Not Assigned";
  };
  const getStudentCount = (className, section) => {
    return students.filter((s) => {
      return (
        String(s.class) === String(className) &&
        String(s.section).toUpperCase() === String(section).toUpperCase()
      );
    }).length;
  };

  return (
    <div className="course-container">
      <h2 className="page-title">
        <FaSchool /> Classroom
      </h2>

      {loading ? (
        <p>Loading...</p>
        ) : isSectionView && selectedClass && !selectedSection ? (

          <>
            <h3 style={{ marginTop: 20 }}>
              Class {selectedClass.name} - Sections
            </h3>
        
            <div className="class-grid">
              {selectedClass.sections.map((sec, i) => {
                const count = getStudentCount(selectedClass.name, sec);
                const teacher = getClassTeacher(selectedClass, sec);
                const key = `${selectedClass.name}_${sec}`;
                const attendance = attendanceMap[key] || { present: 0, absent: 0 };
        
                return (
                  <div
                    key={i}
                    className={`class-card card-${i % 6}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedSection(sec)}
                  >
                    <h3>[{sec}]</h3>
        
                    <p>👨‍🎓 {count} Students</p>
                    <p>✅ {attendance.present}</p>
                    <p>❌ {attendance.absent}</p>
        
                    <p style={{ color: "#555" }}>
                      👩‍🏫 {teacher}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
          ) : isSectionView && selectedClass && selectedSection ? (

            <>
            
          
              {/* 🔝 TEACHERS */}
              <div style={{
                display: "flex",
                overflowX: "auto",
                gap: 10,
                margin: "20px 0"
              }}>
               <div style={{
  display: "flex",
  overflowX: "auto",
  gap: 10,
  margin: "20px 0"
}}>
  {teachers.filter(t =>
  t.assignedClasses?.some(c =>
    String(c.class) === String(selectedClass.name) &&
    String(c.section).toUpperCase() === selectedSection
  )
)
    .map((t, i) => (
      <div key={i} style={{
        minWidth: 100,
        padding: 10,
        background: "#fff",
        borderRadius: 10,
        textAlign: "center"
      }}>
       {t.photoURL ? (
  <img
    src={t.photoURL}
    alt="teacher"
    style={{
      width: 50,
      height: 50,
      borderRadius: "50%",
      objectFit: "cover",
      margin: "0 auto 5px"
    }}
  />
) : (
  <div style={{
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 5px"
  }}>
    {t.name?.charAt(0)}
  </div>
)}
        {t.name}
      </div>
    ))}
</div>
              </div>
          
              {/* 🔽 STUDENTS */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 15
              }}>
                {students
                  .filter(s =>
                    String(s.class) === String(selectedClass.name) &&
                    String(s.section).toUpperCase() === selectedSection
                  )
                  .map((s, i) => (
                    <div key={i} style={{
                      background: "#fff",
                      padding: 15,
                      borderRadius: 12,
                      textAlign: "center"
                    }}>
                    {s.photoURL ? (
  <img
    src={s.photoURL}
    alt="student"
    style={{
      width: 60,
      height: 60,
      borderRadius: "50%",
      objectFit: "cover",
      margin: "0 auto 10px"
    }}
  />
) : (
  <div style={{
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    fontWeight: "bold"
  }}>
    {s.studentName?.charAt(0)}
  </div>
)}
          
                      <div>{s.studentName}</div>
          
                      {(() => {
  const key = `${selectedClass.name}_${selectedSection}`;
const todayData = attendance[key] || {};
  const status = todayData[s.studentId];

  let bg = "#999";
  let text = "Not Updated";

  if (status === "present") {
    bg = "green";
    text = "Present";
  } else if (status === "absent") {
    bg = "red";
    text = "Absent";
  } else if (status === "late") {
    bg = "orange";
    text = "Late";
  }

  return (
    <div style={{
      marginTop: 8,
      padding: "5px 10px",
      borderRadius: 6,
      background: bg,
      color: "#fff"
    }}>
      {text}
    </div>
  );
})()}
                    </div>
                  ))}
              </div>
            </>
      ) : (
        <div className="class-grid">
          {classes.map((c, index) => (
            <div key={c.id} className={`class-card card-${index % 6}`}>
              <h3>Class {c.name}</h3>

              <button
                className="button"
                onClick={() =>
                  handleMenuClick(`classroom-section-${c.id}`)
                }
              >
                Open Sections <FaArrowRight />
              </button>

              <button
                className="button"
                onClick={() =>
                  handleMenuClick(`classroom-students-${c.id}`)
                }
              >
                Students <FaArrowRight />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classroom;