import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../dashboard_styles/courses.css";
import { FaArrowCircleRight, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
export default function Course({ handleMenuClick }) {

  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  onClick={() => navigate(`/courses/${c.id}/timetable-planner`)}
>
  Timetable Planner <FaArrowRight />
</button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
