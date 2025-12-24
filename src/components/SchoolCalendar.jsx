import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import "./SchoolCalendar.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_COLORS = {
  holiday: "#ff3d71",
  exam: "#2140df",
  meeting: "#00bcd4",
  birthday: "#ff9800"
};

export default function SchoolCalendar({ adminUid, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toLocaleDateString("en-CA");

  /* ================= LOAD EVENTS ================= */
  useEffect(() => {
    if (!adminUid) return;
    loadEvents();
  }, [adminUid]);

  const loadEvents = async () => {
    const snap = await getDocs(
      collection(db, "users", adminUid, "calendar")
    );

    const data = {};
    snap.forEach(d => {
      data[d.id] = d.data();
    });
    setEvents(data);
  };

  /* ================= ADD EVENT ================= */
  const addEvent = async (dateStr) => {
    const title = prompt("Event name");
    if (!title) return;

    const type = prompt("Type: holiday / exam / meeting / birthday");
    if (!EVENT_COLORS[type]) {
      alert("Invalid type");
      return;
    }

    await setDoc(
      doc(db, "users", adminUid, "calendar", dateStr),
      { title, type, date: dateStr, createdAt: new Date() }
    );

    loadEvents();
  };

  /* ================= DATE UTILS ================= */
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const formatDate = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  /* ================= UPCOMING ================= */
  const upcoming = useMemo(() => {
    return Object.values(events)
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  /* ================= UI ================= */
  return (
    <div className="sc-calendar">

      {/* HEADER */}
      <div className="sc-header">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
      </div>

      {/* WEEK */}
      <div className="sc-week">
        {DAYS.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* GRID */}
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
              style={
                ev
                  ? {
                      background: EVENT_COLORS[ev.type],
                      color: "#fff"
                    }
                  : {}
              }
              
              onClick={() => onDateSelect?.(dateStr)}
              onDoubleClick={() => addEvent(dateStr)}
            >
              <span>{day}</span>
              {ev && <small>{ev.title}</small>}
            </div>
          );
        })}
      </div>

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <div className="sc-upcoming">
          <h4>Upcoming</h4>

          {upcoming.map((e, i) => (
            <div key={i} className="sc-up-item">
              <span
                className="dot"
                style={{ background: EVENT_COLORS[e.type] }}
              />
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
        <span>Double click → Add</span>
      </div>
    </div>
  );
}
