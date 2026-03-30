import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  Timestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";

export default function OfficeStaffAttendance() {
  const adminUid = localStorage.getItem("adminUid");

  const [staffs, setStaffs] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  /* ================= LOAD STAFF ================= */
  useEffect(() => {
    async function load() {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "office_staffs")
      );

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setStaffs(list);

      // 🔥 init empty records
      const init = {};
      list.forEach(s => (init[s.id] = ""));
      setRecords(init);
    }

    load();
  }, [adminUid]);

  /* ================= LOAD TODAY DATA ================= */
  useEffect(() => {
    async function loadToday() {
      if (!adminUid) return;

      const ref = doc(
        db,
        "users",
        adminUid,
        "attendance",
        "office_staff",
        "dates",
        date
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {
        setRecords(snap.data().records || {});
      }
    }

    loadToday();
  }, [date, adminUid]);

  /* ================= SAVE ================= */
  async function saveAttendance() {
    try {
      await setDoc(
        doc(
          db,
          "users",
          adminUid,
          "attendance",
          "office_staff",
          "dates",
          date
        ),
        {
          date,
          type: "office_staff",
          records,
          updatedAt: Timestamp.now()
        },
        { merge: true }
      );

      alert("✅ Staff Attendance Saved");
    } catch (err) {
      console.error(err);
      alert("❌ Save failed");
    }
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20 }}>
      <h3>Office Staff Attendance</h3>

      {/* DATE */}
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      {/* STAFF LIST */}
      {staffs.map(s => {
        const status = records[s.id];

        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8
            }}
          >
            {/* NAME */}
            <span>{s.name || "No Name"}</span>

            {/* STATUS BUTTONS */}
            <div>
              {["present", "absent"].map(st => (
                <button
                  key={st}
                  onClick={() =>
                    setRecords({ ...records, [s.id]: st })
                  }
                  style={{
                    marginLeft: 5,
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background:
                      status === st
                        ? st === "present"
                          ? "green"
                          : "red"
                        : "#eee",
                    color: status === st ? "#fff" : "#000",
                    fontWeight: 600
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* SAVE BUTTON */}
      {staffs.length > 0 && (
        <button
          onClick={saveAttendance}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(90deg, #7c3aed, #2563eb)",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Save Attendance
        </button>
      )}
    </div>
  );
}