import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../dashboard_styles/courses.css";
import { FaArrowCircleRight, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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

      const classList = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        sections: doc.data().sections || [],
      }));

      setClasses(classList);
      setLoading(false);
    };

    loadClasses();
  }, [adminUid]);

  return (
    <div className="course-container">
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
