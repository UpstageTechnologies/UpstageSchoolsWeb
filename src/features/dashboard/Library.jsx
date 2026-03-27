import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import "../dashboard_styles/courses.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function Library() {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [bookResults, setBookResults] = useState({});
  const [loadingBooks, setLoadingBooks] = useState(false);

  // 📥 Load Classes
  useEffect(() => {
    if (!adminUid) return;

    const loadClasses = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );

      const classList = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setClasses(classList);
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
  };

  // 📚 Fetch Books
  const fetchBooks = async (className, subject, topic) => {
    setLoadingBooks(true);

    try {
      const query = `${className} ${subject} ${topic}`;
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );
      const data = await res.json();

      setBookResults((prev) => ({
        ...prev,
        [topic]: data.items || []
      }));
    } catch (err) {
      console.error(err);
    }

    setLoadingBooks(false);
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
                  View Subjects <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 📚 SUBJECT + TOPIC VIEW
  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => setSelectedClass(null)}
        style={{ marginBottom: 10 }}
      >
        <FaArrowLeft /> Back to Classes
      </button>

      <h2>📚 Class {selectedClass.name} - Subjects</h2>

      {subjects.length === 0 ? (
        <p>No subjects added</p>
      ) : (
        subjects.map((sub, i) => (
          <div
            key={i}
            style={{
              padding: 15,
              marginBottom: 15,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
            }}
          >
            <h3 style={{ marginBottom: 10 }}>📘 {sub.name}</h3>

            {sub.topics.length > 0 ? (
              sub.topics.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    background: "#f1f5f9",
                    borderRadius: 8
                  }}
                >
                  <b>{t.name}</b>

                  {/* 🔘 Button */}
                  <div>
                    <button
                      onClick={() =>
                        fetchBooks(
                          selectedClass.name,
                          sub.name,
                          t.name
                        )
                      }
                      style={{
                        marginTop: 5,
                        fontSize: 12,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: 5
                      }}
                    >
                      📚 Show Books
                    </button>
                  </div>

                  {/* ⏳ Loading */}
                  {loadingBooks && <p>Loading books...</p>}

                  {/* 📚 Books UI */}
                  {bookResults[t.name] && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 10,
                        flexWrap: "wrap"
                      }}
                    >
                      {bookResults[t.name]
                        .slice(0, 5)
                        .map((b) => (
                          <div
                            key={b.id}
                            style={{
                              width: 120,
                              border: "1px solid #ddd",
                              borderRadius: 8,
                              padding: 5,
                              textAlign: "center",
                              background: "#fff"
                            }}
                          >
                            <img
                              src={
                                b.volumeInfo.imageLinks
                                  ?.thumbnail ||
                                "https://via.placeholder.com/120x160"
                              }
                              alt=""
                              style={{
                                width: "100%",
                                height: 140,
                                objectFit: "cover"
                              }}
                            />
                            <p style={{ fontSize: 12 }}>
                              {b.volumeInfo.title?.slice(0, 40)}
                            </p>

                            <a
                              href={b.volumeInfo.previewLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 11,
                                color: "#2563eb"
                              }}
                            >
                              View
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ opacity: 0.6 }}>No topics</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}