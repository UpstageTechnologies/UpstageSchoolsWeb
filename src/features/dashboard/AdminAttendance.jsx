import React, { useEffect, useState } from "react";
import { collection, getDocs, setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AdminAttendance() {
  const adminUid = localStorage.getItem("adminUid");

  const [admins, setAdmins] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        collection(db, "users", adminUid, "admins")
      );

      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAdmins(list);

      const init = {};
      list.forEach(a => (init[a.id] = ""));
      setRecords(init);
    }

    load();
  }, [adminUid]);

  async function saveAttendance() {
    const key = "admins";

    await setDoc(
      doc(db, "users", adminUid, "attendance", key, "dates", date),
      {
        date,
        type: "admin",
        records,
        updatedAt: Timestamp.now()
      }
    );

    alert("✅ Admin Attendance Saved");
  }

  return (
    <div>
      <h3>Admin Attendance</h3>

      <input type="date" value={date} onChange={e => setDate(e.target.value)} />

      {admins.map(a => (
        <div key={a.id} style={row}>
          <span>{a.name}</span>

          {["present", "absent"].map(st => (
            <button
              key={st}
              onClick={() =>
                setRecords({ ...records, [a.id]: st })
              }
              style={{
                background:
                  records[a.id] === st
                    ? st === "present"
                      ? "green"
                      : "red"
                    : "#eee",
                color: records[a.id] === st ? "#fff" : "#000",
                marginLeft: 5
              }}
            >
              {st}
            </button>
          ))}
        </div>
      ))}

      <button onClick={saveAttendance}>Save</button>
    </div>
  );
}

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10
};