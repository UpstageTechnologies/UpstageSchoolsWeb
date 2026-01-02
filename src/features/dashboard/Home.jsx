import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Home.css";
import {
  FaUserGraduate,
  FaUserTimes,
  FaChalkboardTeacher,
  FaUserCheck
} from "react-icons/fa";

const today = new Date().toLocaleDateString("en-CA");

export default function Home({ adminUid, setActivePage }) {
  const [stats, setStats] = useState({
    studentPresent: 0,
    studentAbsent: 0,
    teacherPresent: 0,
    teacherAbsent: 0
  });

  const [loading, setLoading] = useState(true);
  

  const loadData = async () => {
    if (!adminUid) return;

    setLoading(true);

    /* ================= STUDENTS ================= */

    const classesSnap = await getDocs(
      collection(db, "users", adminUid, "attendance")
    );

    // fetch all date docs **together**
    const datePromises = classesSnap.docs.map(c =>
      getDoc(
        doc(db, "users", adminUid, "attendance", c.id, "dates", today)
      )
    );

    const allDates = await Promise.all(datePromises);

    let studentPresent = 0;
    let studentAbsent = 0;

    allDates.forEach(dateDoc => {
      if (!dateDoc.exists()) return;
      const rec = dateDoc.data().records || {};

      Object.values(rec).forEach(status => {
        if (status === "present") studentPresent++;
        if (status === "absent") studentAbsent++;
      });
    });

    /* ================= TEACHERS ================= */

    let teacherPresent = 0;
    let teacherAbsent = 0;

    const tDoc = await getDoc(
      doc(db, "users", adminUid, "teacherAttendance", today)
    );

    if (tDoc.exists()) {
      const rec = tDoc.data().records || {};

      Object.values(rec).forEach(status => {
        if (status === "present") teacherPresent++;
        if (status === "absent") teacherAbsent++;
      });
    }

    setStats({
      studentPresent,
      studentAbsent,
      teacherPresent,
      teacherAbsent
    });

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [adminUid]);

  return (
    <div className="home-wrapper">
      <div className="cards-row">

        {/* STUDENTS */}
        <div className="home-card green">
          <h4>
            Students Present <FaUserGraduate />
          </h4>

          <h1>{loading ? "…" : stats.studentPresent}</h1>

          <p>____________________________</p>

          <h4>
            Students Absent <FaUserTimes />
          </h4>

          <h1>{loading ? "…" : stats.studentAbsent}</h1>

          <br />

          <button
            onClick={e => {
              e.stopPropagation();
              setActivePage("todays-absent");
            }}
          >
            Absent list
          </button>
        </div>

        {/* TEACHERS */}
        <div className="home-card blue">
          <h4>
            Teachers Present <FaUserCheck />
          </h4>

          <h1>{loading ? "…" : stats.teacherPresent}</h1>

          <p>____________________________</p>

          <h4>
            Teachers Absent <FaChalkboardTeacher />
          </h4>

          <h1>{loading ? "…" : stats.teacherAbsent}</h1>

          <br />

          <button
            onClick={e => {
              e.stopPropagation();
              setActivePage("teacher-absents");
            }}
          >
            Absent list
          </button>
        </div>
      </div>
    </div>
  );
}
