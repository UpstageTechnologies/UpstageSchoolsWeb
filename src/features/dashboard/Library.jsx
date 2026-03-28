import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import "../dashboard_styles/courses.css";
import "../dashboard_styles/Lib.css"
import { FaArrowLeft } from "react-icons/fa";
export default function Library() {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [subjectBooks, setSubjectBooks] = useState({});
  const [topicBooks, setTopicBooks] = useState({});

  // 📥 Load Classes
  useEffect(() => {
    if (!adminUid) return;

    const loadClasses = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );

      setClasses(
        snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name
        }))
      );

      setLoading(false);
    };

    loadClasses();
  }, [adminUid]);

  // 📥 Load Subjects + Topics
  const loadSubjects = async (classId) => {
    const classSnap = await getDoc(
      doc(db, "users", adminUid, "Classes", classId)
    );

    const subjectNames = classSnap.data()?.subjects || [];

    let subjectData = [];

    for (let sub of subjectNames) {
      const subSnap = await getDoc(
        doc(
          db,
          "users",
          adminUid,
          "coursePlanner",
          classId,
          "subjects",
          sub
        )
      );

      subjectData.push({
        name: sub,
        topics: subSnap.data()?.topics || []
      });
    }

    setSubjects(subjectData);

    // 🔥 AUTO FETCH BOOKS
    fetchAllBooks(classSnap.data()?.name, subjectData);
  };

  // 📚 Fetch Books for all
  const fetchAllBooks = async (className, subjectData) => {
    let subjectTemp = {};
    let topicTemp = {};

    for (let sub of subjectData) {
      // 🔥 SUBJECT → 1 BOOK
      const subQuery = `${className} ${sub.name} textbook`;
      const subRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${subQuery}`
      );
      const subData = await subRes.json();

      subjectTemp[sub.name] =
        subData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || null;

      // 🔥 TOPICS → BOOKS
      for (let t of sub.topics) {
        const topicQuery = `${className} ${sub.name} ${t.name}`;
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${topicQuery}`
        );
        const data = await res.json();

        topicTemp[t.name] =
          data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || null;
      }
    }

    setSubjectBooks(subjectTemp);
    setTopicBooks(topicTemp);
  };

  // 🟦 CLASS VIEW
  if (!selectedClass) {
    return (
      <div className="course-container">
        <h2 className="page-title">📚 Library</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="class-grid">
            {classes.map((c, index) => (
              <div key={c.id} className={`class-card card-${index % 6}`}>
                <h3>Class {c.name}</h3>

                <button
                  className="button"
                  onClick={() => {
                    setSelectedClass(c);
                    loadSubjects(c.id);
                  }}
                >
                  Open Library
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="library-container">
  
      {/* HEADER */}
      <div className="header">
        
        <h1>{subjects[currentIndex]?.name}</h1>
        <p>Explore books from this subject</p>
      </div>
  
      {/* 🔥 SUBJECT CAROUSEL */}
      <div
        className="carousel"
        onScroll={(e) => {
          const scrollLeft = e.target.scrollLeft;
          const width = e.target.clientWidth;
          const index = Math.round(scrollLeft / width);
          setCurrentIndex(index);
        }}
      >
        {subjects.map((sub) => (
          <div className="carousel-item" key={sub.name}>
            {subjectBooks[sub.name] ? (
              <img src={subjectBooks[sub.name]} />
            ) : (
              <div className="book-loader" />
            )}
          </div>
        ))}
      </div>
  
      {/* 🔥 TOPIC RACK */}
      <div className="rack-container">
  
        <div className="books-row horizontal-scroll">
          {subjects[currentIndex]?.topics.map((t) => (
            <div className="book-item" key={t.name}>
              {topicBooks[t.name] ? (
                <img src={topicBooks[t.name]} />
              ) : (
                <div className="book-loader small" />
              )}
            </div>
          ))}
        </div>
  
        <div className="rack">
          {subjects[currentIndex]?.topics.map((t) => (
            <div className="rack-label" key={t.name}>
              {t.name}
            </div>
          ))}
        </div>
  
      </div>
  
    </div>
  );
}