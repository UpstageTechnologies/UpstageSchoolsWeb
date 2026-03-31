import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Attendance.css";

export default function OfficeStaffAttendance({ globalSearch }) {
  const adminUid = localStorage.getItem("adminUid");

  const userId =
    localStorage.getItem("adminUid") ||
    localStorage.getItem("subAdminId");

  const [staffs, setStaffs] = useState([]);
  const [records, setRecords] = useState({});
  const [lateTimes, setLateTimes] = useState({});
  const [history, setHistory] = useState({});
  const [dayLabels, setDayLabels] = useState([]);

  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  /* 1️⃣ LOAD STAFF */
  useEffect(() => {
    async function loadStaff() {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "office_staffs")
      );

      setStaffs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    loadStaff();
  }, [adminUid]);

  /* 2️⃣ LOAD ATTENDANCE + HISTORY */
  useEffect(() => {
    async function loadAttendance() {
      if (!adminUid || staffs.length === 0) return;

      // ⭐ Today
      const todayDoc = await getDoc(
        doc(db, "users", adminUid, "officeStaffAttendance", date)
      );

      if (todayDoc.exists()) {
        setRecords(todayDoc.data().records || {});
        setLateTimes(todayDoc.data().lateTimes || {});
      } else {
        const init = {};
        staffs.forEach(s => (init[s.id] = ""));
        setRecords(init);
        setLateTimes({});
      }

      // ⭐ Previous 7 days
      const hist = {};
      const labels = [];

      for (let i = 1; i <= 7; i++) {
        const d = new Date(date);
        d.setDate(d.getDate() - i);

        const y = d.toISOString().substring(0, 10);
        labels.push(String(d.getDate()).padStart(2, "0"));

        const past = await getDoc(
          doc(db, "users", adminUid, "officeStaffAttendance", y)
        );

        if (past.exists()) {
          const rec = past.data().records || {};
          staffs.forEach(s => {
            if (!hist[s.id]) hist[s.id] = [];
            hist[s.id].push(rec[s.id] || null);
          });
        } else {
          staffs.forEach(s => {
            if (!hist[s.id]) hist[s.id] = [];
            hist[s.id].push(null);
          });
        }
      }

      Object.keys(hist).forEach(k => hist[k].reverse());
      setHistory(hist);
      setDayLabels(labels.reverse());
    }

    loadAttendance();
  }, [staffs, date, adminUid]);

  /* 3️⃣ SAVE */
  async function saveAttendance() {
    try {
      await setDoc(
        doc(db, "users", adminUid, "officeStaffAttendance", date),
        {
          records,
          lateTimes,
          updatedAt: Timestamp.now(),
          markedBy: userId,
          date
        },
        { merge: true }
      );

      alert("✅ Office staff attendance saved");
    } catch (e) {
      console.error(e);
      alert("❌ Save failed");
    }
  }

  const filteredStaffs = staffs.filter(s =>
    `${s.name || ""}`
      .toLowerCase()
      .includes(globalSearch?.toLowerCase() || "")
  );

  return (
    <div className="tt-container">
      <h2 className="tt-title">Office Staff Attendance</h2>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {staffs.length > 0 && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>

              <th colSpan={dayLabels.length} style={{ textAlign: "center" }}>
                Previous 7 Days
              </th>
            </tr>

            <tr>
              <th></th><th></th>

              {dayLabels.map((d, i) => (
                <th key={i}>{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredStaffs.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>

                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["present", "absent", "late"].map(st => (
                      <button
                        key={st}
                        onClick={() => {
                          setRecords(prev => ({ ...prev, [s.id]: st }));

                          if (st === "late") {
                            const time = prompt("Late time HH:MM", "00:00");
                            if (time) {
                              setLateTimes(prev => ({
                                ...prev,
                                [s.id]: time
                              }));
                            }
                          }
                        }}
                        style={{
                          background:
                            records[s.id] === st
                              ? st === "present"
                                ? "#4caf50"
                                : st === "absent"
                                ? "#e74c3c"
                                : "#f1c40f"
                              : "#fff",
                          color: records[s.id] === st ? "#fff" : "#333",
                          border: "1px solid #ccc",
                          borderRadius: 6,
                          padding: "6px 10px"
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </td>

                {/* Previous */}
                {dayLabels.map((_, i) => {
                  const st = (history[s.id] || [])[i];
                  return (
                    <td key={i} style={{ textAlign: "center" }}>
                      {st === "present"
                        ? "✔"
                        : st === "absent"
                        ? "✖"
                        : st
                        ? "L"
                        : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="save-btn" onClick={saveAttendance}>
        Save Attendance
      </button>
    </div>
  );
}