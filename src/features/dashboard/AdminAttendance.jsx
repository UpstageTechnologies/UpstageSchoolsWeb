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

export default function AdminAttendance({ globalSearch }) {
  const adminUid = localStorage.getItem("adminUid");

  const userId =
    localStorage.getItem("adminUid") ||
    localStorage.getItem("subAdminId");

  const [admins, setAdmins] = useState([]);
  const [records, setRecords] = useState({});
  const [lateTimes, setLateTimes] = useState({});
  const [history, setHistory] = useState({});
  const [dayLabels, setDayLabels] = useState([]);

  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  /* 1️⃣ LOAD ADMINS */
  useEffect(() => {
    async function loadAdmins() {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "admins")
      );

      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    loadAdmins();
  }, [adminUid]);

  /* 2️⃣ LOAD ATTENDANCE + HISTORY */
  useEffect(() => {
    async function loadAttendance() {
      if (!adminUid || admins.length === 0) return;

      // ⭐ Today
      const todayDoc = await getDoc(
        doc(db, "users", adminUid, "adminAttendance", date)
      );

      if (todayDoc.exists()) {
        setRecords(todayDoc.data().records || {});
        setLateTimes(todayDoc.data().lateTimes || {});
      } else {
        const init = {};
        admins.forEach(a => (init[a.id] = ""));
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
          doc(db, "users", adminUid, "adminAttendance", y)
        );

        if (past.exists()) {
          const rec = past.data().records || {};
          admins.forEach(a => {
            if (!hist[a.id]) hist[a.id] = [];
            hist[a.id].push(rec[a.id] || null);
          });
        } else {
          admins.forEach(a => {
            if (!hist[a.id]) hist[a.id] = [];
            hist[a.id].push(null);
          });
        }
      }

      Object.keys(hist).forEach(k => hist[k].reverse());
      setHistory(hist);
      setDayLabels(labels.reverse());
    }

    loadAttendance();
  }, [admins, date, adminUid]);

  /* 3️⃣ SAVE ATTENDANCE */
  async function saveAttendance() {
    try {
      await setDoc(
        doc(db, "users", adminUid, "adminAttendance", date),
        {
          records,
          lateTimes,
          updatedAt: Timestamp.now(),
          markedBy: userId,
          date
        },
        { merge: true }
      );

      alert("✅ Admin attendance saved");
    } catch (e) {
      console.error(e);
      alert("❌ Save failed");
    }
  }

  const filteredAdmins = admins.filter(a =>
    `${a.name || ""} ${a.adminId || ""}`
      .toLowerCase()
      .includes(globalSearch?.toLowerCase() || "")
  );

  return (
    <div className="tt-container">
      <h2 className="tt-title">Admin Attendance</h2>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {admins.length > 0 && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Admin ID</th>
              <th>Status</th>

              <th colSpan={dayLabels.length} style={{ textAlign: "center" }}>
                Previous 7 Days
              </th>
            </tr>

            <tr>
              <th></th><th></th><th></th>

              {dayLabels.map((d, i) => (
                <th key={i} style={{ textAlign: "center" }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredAdmins.map(a => (
              <React.Fragment key={a.id}>
                <tr>
                  <td>{a.name}</td>
                  <td>{a.adminId || "-"}</td>

                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["present", "absent", "late"].map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            setRecords(prev => ({ ...prev, [a.id]: st }));

                            if (st === "late") {
                              const time = prompt("Late time HH:MM", "00:00");
                              if (time) {
                                setLateTimes(prev => ({
                                  ...prev,
                                  [a.id]: time
                                }));
                              }
                            }
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            background:
                              records[a.id] === st
                                ? st === "present"
                                  ? "#4caf50"
                                  : st === "absent"
                                  ? "#e74c3c"
                                  : "#f1c40f"
                                : "#fff",
                            color: records[a.id] === st ? "#fff" : "#333",
                            fontWeight: 600
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Previous 7 days */}
                  {dayLabels.map((_, i) => {
                    const st = (history[a.id] || [])[i];
                    return (
                      <td key={i} style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              st === "present"
                                ? "green"
                                : st === "absent"
                                ? "red"
                                : "#c9a000"
                          }}
                        >
                          {st === "present"
                            ? "✔"
                            : st === "absent"
                            ? "✖"
                            : st
                            ? "L"
                            : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {admins.length > 0 && (
        <button className="save-btn" onClick={saveAttendance}>
          Save Attendance
        </button>
      )}
    </div>
  );
}