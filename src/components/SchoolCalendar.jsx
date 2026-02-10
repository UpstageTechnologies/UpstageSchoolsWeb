  import React, { useEffect, useMemo, useState } from "react";
  import { collection, doc, getDocs, setDoc, addDoc, Timestamp, deleteDoc } from "firebase/firestore";
  import { db } from "../services/firebase";
  import "./SchoolCalendar.css";

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const EVENT_COLORS = {
    holiday: "#ff3d71",
    exam: "#2140df",
    meeting: "#00bcd4",
    birthday: "#ff9800"
  };
  const buildPrintWeeks = (year, month, events) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
  
    const weeks = [];
    let week = Array(firstDay).fill(null);
  
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const ev = events[date] || null;
  
      const prev = week[week.length - 1];
  
      if (
        ev &&
        prev &&
        prev.event &&
        prev.event.type === ev.type &&
        prev.event.title === ev.title
      ) {
        prev.span += 1;   // 🔥 merge
      } else {
        week.push({
          day: d,
          span: 1,
          event: ev
        });
      }
  
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
  
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
  
    return weeks;
  };
  

  export default function SchoolCalendar({ adminUid, role, onDateSelect }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [editingDate, setEditingDate] = useState(null);
    const [printMode, setPrintMode] = useState(false);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayStr = new Date().toLocaleDateString("en-CA");

    useEffect(() => {
      if (!adminUid) return;

      const loadEvents = async () => {
        const snap = await getDocs(collection(db, "users", adminUid, "calendar"));

        const data = {};
        snap.forEach(d => (data[d.id] = d.data()));
        setEvents(data);
      };

      loadEvents();
    }, [adminUid]);

    /* APPROVAL (SUB ADMIN) */
    const requestEventApproval = async (dateStr, data) => {
      await addDoc(collection(db, "users", adminUid, "approval_requests"), {
        module: "calendar",
        action: "create",
        targetDate: dateStr,
        payload: data,
        status: "pending",
        createdBy: localStorage.getItem("adminId"),
        createdAt: Timestamp.now()
      });

      alert("⏳ Sent for admin approval");
    };

    /* ADD EVENT */
    const addEvent = async (dateStr) => {
      const title = prompt("Event name");
      if (!title) return;

      const type = prompt("Type: holiday / exam / meeting / birthday");
      if (!EVENT_COLORS[type]) return alert("Invalid type");

      const data = { title, type, date: dateStr, createdAt: new Date() };

      if (role === "admin") return requestEventApproval(dateStr, data);

      await setDoc(doc(db, "users", adminUid, "calendar", dateStr), data);

      // instant UI update
      setEvents(prev => ({ ...prev, [dateStr]: data }));
    };

    /* SAVE EDITED EVENT */
    const saveEdit = async () => {
      await setDoc(
        doc(db, "users", adminUid, "calendar", editingDate),
        events[editingDate]
      );
      alert("Updated");
      setEditingDate(null);
    };

    /* DELETE EVENT */
    const deleteEvent = async () => {
      await deleteDoc(doc(db, "users", adminUid, "calendar", editingDate));

      const copy = { ...events };
      delete copy[editingDate];
      setEvents(copy);

      alert("Deleted");
      setEditingDate(null);
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const formatDate = d =>
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      const upcoming = useMemo(() => {
        const yearStr = String(year);
        const monthStr = String(month + 1).padStart(2, "0");
      
        return Object.values(events)
          .filter(e =>
            e.date.startsWith(`${yearStr}-${monthStr}`)   // only this month
          )
          .sort((a, b) => a.date.localeCompare(b.date));
      }, [events, year, month]);
      
      useEffect(() => {
        const afterPrint = () => setPrintMode(false);
        window.addEventListener("afterprint", afterPrint);
        return () => window.removeEventListener("afterprint", afterPrint);
      }, []);
      
    return (
      <>
    {printMode && (
      <div className="print-calendar">
        <h2>
          ACADEMIC CALENDAR –{" "}
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>

        <div className="print-week days">
          {DAYS.map(d => (
            <div key={d}>{d.toUpperCase()}</div>
          ))}
        </div>

        {buildPrintWeeks(year, month, events).map((week, i) => (
          <div key={i} className="print-week">
            {week.map((cell, j) =>
              cell ? (
                <div
                  key={j}
                  className="print-cell"
                  style={{ gridColumn: `span ${cell.span}` }}
                >
                  <strong>{cell.day}</strong>
                  {cell.event && <div>{cell.event.title}</div>}
                </div>
              ) : (
                <div key={j} />
              )
            )}
          </div>
        ))}
      </div>
    )}

      <div className="sc-calendar">
        <div className="sc-header">
  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>

  <h3>
    {currentDate.toLocaleString("default", { month: "long" })} {year}
  </h3>

  <div className="sc-header-actions">
  <button
  className="sc-icon-btn sc-print-btn"
  onClick={() => {
    setPrintMode(true);
    setTimeout(() => window.print(), 200);
  }}
>
  🖨️
</button>


    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
  </div>
</div>


        <div className="sc-week">
          {DAYS.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="sc-grid">
          {[...Array(firstDay)].map((_, i) => (
            <div key={i} className="sc-empty" />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const ev = events[dateStr];

            return (
              <div
                key={day}
                className={`sc-day ${dateStr === todayStr ? "today" : ""}`}
                style={ev ? { background: EVENT_COLORS[ev.type], color: "#fff" } : {}}
                onClick={() => onDateSelect?.(dateStr)}
                onDoubleClick={() => (ev ? setEditingDate(dateStr) : addEvent(dateStr))}
              >
                <span>{day}</span>
                {ev && <small>{ev.title}</small>}
              </div>
            );
          })}
        </div>

        {upcoming.length > 0 && (
          <div className="sc-upcoming">
            <h4>Upcoming</h4>

            {upcoming.map((e, i) => (
              <div key={i} className="sc-up-item">
                <span className="dot" style={{ background: EVENT_COLORS[e.type] }} />
                <div>
                  <strong>{e.title}</strong>
                  <p>{e.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="sc-footer">
          <span>Click → Select</span>
          <span>Double click → Add / Edit</span>
        </div>

        {/* EDIT POPUP */}
        {editingDate && (
          <div className="sc-modal">
            <div className="sc-modal-box">
              <h4>Edit Event</h4>

              <input
                value={events[editingDate].title}
                onChange={e =>
                  setEvents(prev => ({
                    ...prev,
                    [editingDate]: { ...prev[editingDate], title: e.target.value }
                  }))
                }
              />

              <select
                value={events[editingDate].type}
                onChange={e =>
                  setEvents(prev => ({
                    ...prev,
                    [editingDate]: { ...prev[editingDate], type: e.target.value }
                  }))
                }
              >
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="birthday">Birthday</option>
              </select>

              <div className="sc-actions">
                <button onClick={saveEdit}>Save</button>

                <button style={{ background: "#e74c3c", color: "#fff" }} onClick={deleteEvent}>
                  Delete
                </button>

                <button onClick={() => setEditingDate(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
    );
  }
