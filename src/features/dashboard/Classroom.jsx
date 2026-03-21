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
          const key = `${selectedClass.name}_${sec}`;

  
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
      ) : isSectionView && selectedClass ? (
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
      onClick={() =>
        handleMenuClick(
          `classroom-${selectedClass.id}-section-${sec}`
        )
      }
    >
      <h3>[{sec}]</h3>

      <p style={{ fontSize: 14, marginTop: 8 }}>
        👨‍🎓 {count} Students
      </p>
      <p>✅ Present: {attendance.present}</p>
<p>❌ Absent: {attendance.absent}</p>

      <p
        style={{
          fontSize: 13,
          marginTop: 4,
          color: teacher === "Not Assigned" ? "red" : "#555"
        }}
      >
        👩‍🏫 {teacher}
      </p>
    </div>
  );
})}
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