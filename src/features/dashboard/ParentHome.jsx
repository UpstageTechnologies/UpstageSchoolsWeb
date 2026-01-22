import React, { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Home.css";
import { FaUserCircle } from "react-icons/fa";

export default function ParentHome({ adminUid, parentId }) {
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState(null);

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  /* ================= PARENT PROFILE ================= */
  useEffect(() => {
    if (!adminUid || !parentId) return;

    const ref = doc(db, "users", adminUid, "parents", parentId);

    return onSnapshot(ref, snap => {
      if (snap.exists()) setParent(snap.data());
    });
  }, [adminUid, parentId]);

  /* ================= LOAD PARENT STUDENTS ================= */
  useEffect(() => {
    if (!adminUid || !parentId) return;

    const q = query(
      collection(db, "users", adminUid, "students"),
      where("parentId", "==", parentId)
    );

    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setStudents(list);

      if (list.length === 1) {
        setSelectedStudent(list[0]);
      }
    });
  }, [adminUid, parentId]);

  /* ================= STUDENT MONTHLY ATTENDANCE ================= */
  useEffect(() => {
    if (!adminUid || !selectedStudent) return;

    const attendanceRef = collection(
      db,
      "users",
      adminUid,
      "attendance"
    );

    return onSnapshot(attendanceRef, snap => {
      let total = 0;
      let present = 0;
      let late = 0;
      let absent = 0;

      snap.docs.forEach(cls => {
        const dateRef = collection(
          db,
          "users",
          adminUid,
          "attendance",
          cls.id,
          "dates"
        );

        onSnapshot(dateRef, dateSnap => {
          dateSnap.docs.forEach(d => {
            if (!d.id.startsWith(month)) return;

            const status =
              d.data().records?.[selectedStudent.id];

            if (!status) return;

            total++;
            if (status === "present") present++;
            else if (status === "late") late++;
            else if (status === "absent") absent++;
          });

          setStats({ total, present, late, absent });
        });
      });
    });
  }, [adminUid, selectedStudent, month]);

  const percent = (v, t) =>
    t === 0 ? 0 : Math.round((v / t) * 100);

  return (
    <>
      {/* ===== PARENT HEADER ===== */}
      {parent && (
        <div className="student-header">
          <div className="student-top-row">
            <div className="student-left">
              <div className="student-avatar">
                {parent.photoURL ? (
                  <img src={parent.photoURL} alt="" />
                ) : (
                  <FaUserCircle size={55} color="#ccc" />
                )}
              </div>

              <div className="name-role-row">
                <h3>{parent.name}</h3>
                <span className="role-badge">PARENT</span>
              </div>
            </div>

            <div className="student-info">
              <div><span>Email</span><b>{parent.email}</b></div>
              <div><span>Phone</span><b>{parent.phone || "—"}</b></div>
              <div><span>Address</span><b>{parent.address || "—"}</b></div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STUDENT SWITCH ===== */}
      {students.length > 0 && (
        <div className="oval-toggle">
          <div
            className={`oval-slider ${
              students.length > 1 &&
              selectedStudent?.id === students[1]?.id
                ? "right"
                : "left"
            }`}
          />

          {students.map(s => (
            <button
              key={s.id}
              className={
                selectedStudent?.id === s.id ? "active" : ""
              }
              onClick={() => setSelectedStudent(s)}
            >
              {s.studentName}
            </button>
          ))}
        </div>
      )}

      {/* ===== ATTENDANCE ===== */}
      {stats && selectedStudent && (
        <div className="summary-layout">
          <div className="summary-left">
            <div className="attendance-panel">
              <div>
                <h4>Class Days</h4>
                <h2>{stats.total}</h2>
              </div>
              <div>
                <h4>Attendance Rate</h4>
                <h1>{percent(stats.present, stats.total)}%</h1>
              </div>
            </div>
          </div>

          <div className="summary-wrapper">
            <div className="summary-title">
              {selectedStudent.studentName} – This Month Attendance
            </div>

            <div className="summary-cards">
              <SummaryCard label="Total" value={stats.total} color="green" />
              <SummaryCard label="Present" value={stats.present} color="blue" />
              <SummaryCard label="Late" value={stats.late} color="yellow" />
              <SummaryCard label="Absent" value={stats.absent} color="red" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== SMALL COMPONENT ===== */
function SummaryCard({ label, value, color }) {
  return (
    <div className="summary-card">
      <div className="summary-top">{value}</div>
      <div className={`summary-fill fill-${color}`} />
      <div className="summary-content">
        <span>{label}</span>
      </div>
    </div>
  );
}
