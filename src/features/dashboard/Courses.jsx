import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../dashboard_styles/courses.css";
import { FaArrowCircleRight, FaArrowRight ,FaArrowLeft} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
export default function Course({ handleMenuClick }) {
  
  const isSkipped = localStorage.getItem("skipIntro") === "true";
  const [showCourseGuide, setShowCourseGuide] = useState(!isSkipped);
  useEffect(() => {
    const isSkipped = localStorage.getItem("skipIntro") === "true";
  
    if (isSkipped) {
      setShowCourseGuide(false);
    }
  }, []);
  
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");
    const [teacherClassId, setTeacherClassId] = useState(null);
    const role = localStorage.getItem("role");
    useEffect(() => {
      const loadTeacherClass = async () => {
        if (role !== "teacher") return;
    
        const teacherId =
          localStorage.getItem("teacherId") ||
          localStorage.getItem("viewId");
    
        if (!teacherId || !adminUid) return;
    
        const ref = doc(db, "users", adminUid, "teachers", teacherId);
        const snap = await getDoc(ref);
    
        if (snap.exists()) {
          const data = snap.data();
          setTeacherClassId(data.assignedClassId);
        }
      };
    
      loadTeacherClass();
    }, [adminUid, role]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const classId = localStorage.getItem("selectedClassId");
  useEffect(() => {
    if (!adminUid) return;
  
    const loadClasses = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );
  
      let classList = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        sections: doc.data().sections || [],
      }));
  
      // 🔥 ROLE CHECK
      const role = localStorage.getItem("role");
  
      if (role === "teacher") {
        const teacherId =
          localStorage.getItem("teacherId") ||
          localStorage.getItem("viewId");
  
        if (teacherId) {
          const ref = doc(db, "users", adminUid, "teachers", teacherId);
          const teacherSnap = await getDoc(ref);
  
          if (teacherSnap.exists()) {
            const teacherData = teacherSnap.data();
            const assignedClassId = teacherData.assignedClassId;
  
            // ✅ FILTER ONLY TEACHER CLASS
            classList = classList.filter(
              (c) => c.id === assignedClassId
            );
          }
        }
      }
  
      setClasses(classList);
      setLoading(false);
    };
  
    loadClasses();
  }, [adminUid]);
  useEffect(() => {
    if (!adminUid) return;
  }, [adminUid, teacherClassId]); // 🔥 IMPORTANT
  return (

    <div className="course-container">
      {role === "teacher" && (
  <div
    onClick={() => handleMenuClick("subdashboard")} // 🔥 back to SubDashboard inner home
    style={{
      position: "fixed",
      top: "20px",
      left: "20px",
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: 9999
    }}
  >
    <FaArrowLeft />
  </div>
)}
      <h2 className="page-title">Courses</h2>
      {showCourseGuide && (
  <div className="guide-banner">
    <p>
      Plan and organize your school activities from here.

      • Course Planner – Click and add subjects, topics, periods, and days based on your settings  
      • Timetable Planner – Your subjects, periods, and assigned teachers will be used to create the timetable  
      • Calendar Planner – Add class-wise schedules, events, and academic activities  

      You can also print the calendar for easy reference.

      Explore each planner and click <strong>Finish</strong>.
    </p>

    <button
  className="finish-btn"
  onClick={() => {
    setShowCourseGuide(false);

    // 🔥 OPEN ATTENDANCE INTRO POPUP
    if (window.openIntroPopup) {
      window.openIntroPopup("attendance");
    }
  }}
>
  Finish →
</button>
  </div>
)}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="class-grid">
          {classes.map((c, index) => (
            <div key={c.id} className={`class-card card-${index % 6}`}>
              <h3>Class {c.name}</h3>
              <button
  className="button"
  onClick={() => handleMenuClick(`course-planner-${c.id}`)}
>
  Course Planner <FaArrowRight />
</button>


<button
  className="button"
  onClick={() => handleMenuClick(`timetable-planner-${c.id}`)}

>
  Timetable Planner <FaArrowRight />
</button>
<button
  className="button"
  onClick={() => {
    localStorage.setItem("selectedClassId", c.id);  // 🔥 store class
    handleMenuClick("calendar");
  }}
>
  Calendar Planner <FaArrowRight />
</button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
