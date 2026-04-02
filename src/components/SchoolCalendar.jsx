import React, { useEffect, useMemo, useState, useRef } from "react";
  import { collection, doc, getDocs, setDoc, addDoc, Timestamp, deleteDoc , onSnapshot } from "firebase/firestore";
  import { db } from "../services/firebase";
  import "./SchoolCalendar.css";

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const buildPrintWeeks = (year, month, events) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
  
    const weeks = [];
    let week = Array(firstDay).fill(null);
  
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const ev = events[date] || null;

      const dayOfWeek = new Date(date).getDay();
      const isSunday = dayOfWeek === 0;
      
      const finalEvent = ev || (isSunday ? {
        title: "Sunday",
        type: "holiday"
      } : null);
  
      const prev = week[week.length - 1];
  
      if (
        finalEvent &&
        prev &&
        prev.event &&
        prev.event.type === finalEvent.type &&
        prev.event.title === finalEvent.title
      ) {
        prev.span += 1;   // 🔥 merge
      } else {
        week.push({
          day: d,
          span: 1,
          event: finalEvent
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
  

  export default function SchoolCalendar({ adminUid, role, onDateSelect , compact ,classId ,hidePrint}) {
    const [eventType, setEventType] = useState("");
const [eventSearch, setEventSearch] = useState("");
const [showEventDropdown, setShowEventDropdown] = useState(false);
const dropdownRef = useRef(null);
const modalRef = useRef(null);
useEffect(() => {
  const handleClickOutside = (e) => {

    // 🔻 DROPDOWN CLOSE
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target)
    ) {
      setShowEventDropdown(false);
    }

    // 🔻 MODAL CLOSE (only if dropdown already closed)
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target)
    ) {
      setEditingDate(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
const [eventTypeList, setEventTypeList] = useState([
  { name: "Holiday", color: "#ff3d71" },
  { name: "Exam", color: "#2140df" },
  { name: "Meeting", color: "#00bcd4" },
  { name: "Birthday", color: "#ff9800" }
]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [editingDate, setEditingDate] = useState(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayStr = new Date().toLocaleDateString("en-CA");
    const [academicStart, setAcademicStart] = useState(null);
const [academicEnd, setAcademicEnd] = useState(null);
const [newEvent, setNewEvent] = useState({
  title: "",
  subtitle: "",
  message: "",
  type: "holiday"
});
useEffect(() => {
  if (!adminUid) return;

  const loadAcademicYear = async () => {
    const snap = await getDocs(
      collection(db, "users", adminUid, "SchoolSettings")
    );

    snap.forEach(doc => {
      if (doc.id === "academicYear") {
        const data = doc.data();
        setAcademicStart(new Date(data.startDate));
        setAcademicEnd(new Date(data.endDate));
        setCurrentDate(new Date()); // 🔥 always current month
      }
    });
  };

  loadAcademicYear();
}, [adminUid]);
useEffect(() => {
  if (!adminUid) return;

  const globalRef = collection(db, "users", adminUid, "calendar");

  let globalData = {};

  const unsubGlobal = onSnapshot(globalRef, (snap) => {
    const temp = {};
    snap.forEach(d => {
      temp[d.id] = d.data();
    });

    globalData = temp;

    // 👉 no class → only global
    if (!classId) {
      setEvents(globalData);
    }
  });

  if (classId) {
    const classRef = collection(
      db,
      "users",
      adminUid,
      "Classes",
      classId,
      "calendar"
    );

    const unsubClass = onSnapshot(classRef, (snap) => {
      const classData = {};
      snap.forEach(d => {
        classData[d.id] = d.data();
      });

      // 🔥 MERGE (IMPORTANT)
      setEvents({
        ...globalData,
        ...classData
      });
    });

    return () => {
      unsubGlobal();
      unsubClass();
    };
  }

  return () => unsubGlobal();

}, [adminUid, classId]);

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
     
      const addEvent = async () => {
        if (!newEvent.title) return alert("Title required");
        const data = {
          ...newEvent,
          type: eventType.toLowerCase(), // 🔥 use this
          date: editingDate,
          createdAt: Timestamp.now()
        };
      
        await setDoc(
          doc(
            db,
            "users",
            adminUid,
            ...(classId
              ? ["Classes", classId, "calendar", editingDate]
              : ["calendar", editingDate])
          ),
          data,
          { merge: true }
        );
      
        setEvents(prev => ({ ...prev, [editingDate]: data }));
        setEditingDate(null);
      };
      if (!title) return;

      const type = prompt("Type: holiday / exam / meeting / birthday");
      if (!EVENT_COLORS[type]) return alert("Invalid type");

      const data = { 
        title,
        subtitle,
        message,
        type,
        date: dateStr,
        createdAt: Timestamp.now()
      };
      await setDoc(
        doc(
          db,
          "users",
          adminUid,
          ...(classId
            ? ["Classes", classId, "calendar", dateStr]
            : ["calendar", dateStr])
        ),
        data,
        { merge: true }
      );

      // instant UI update
      setEvents(prev => ({ ...prev, [dateStr]: data }));
    };

    /* SAVE EDITED EVENT */
    const saveEdit = async () => {
      await setDoc(
        doc(
          db,
          "users",
          adminUid,
          ...(classId
            ? ["Classes", classId, "calendar", editingDate]
            : ["calendar", editingDate])
        ),
        events[editingDate],
        { merge: true }   // 🔥 ADD THIS
      );
      alert("Updated");
      setEditingDate(null);
    };

    /* DELETE EVENT */
    const deleteEvent = async () => {
      await deleteDoc(
        doc(
          db,
          "users",
          adminUid,
          ...(classId
            ? ["Classes", classId, "calendar", editingDate]
            : ["calendar", editingDate])
        )
      );
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
        return Object.entries(events)
          .filter(([date, e]) => {
            return date.startsWith(
              `${year}-${String(month + 1).padStart(2, "0")}`
            );
          })
          .map(([date, e]) => ({
            ...e,
            date // 🔥 force correct date
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }, [events, year, month]);
     
      
    return (
      <>
   <div className="print-calendar print-only">

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
                  {cell.event && (
  <div className="print-event">
    <div className="print-title">
      {cell.event.title}
    </div>

    {cell.event.subtitle && (
      <div className="print-subtitle">
        {cell.event.subtitle}
      </div>
    )}

    {cell.event.message && (
      <div className="print-message">
        {cell.event.message}
      </div>
    )}
  </div>
)}
                </div>
              ) : (
                <div key={j} />
              )
            )}
          </div>
        ))}
      </div>
    
<div className="sc-calendar no-print">

        <div className="sc-header">
        <button
  onClick={() => {
    const newDate = new Date(year, month - 1, 1);
    if (!academicStart || newDate >= new Date(academicStart.getFullYear(), academicStart.getMonth(), 1)) {
      setCurrentDate(newDate);
    }
  }}
>
  ‹
</button>

  <h3>
    {currentDate.toLocaleString("default", { month: "long" })} {year}
  </h3>

  <div className="sc-header-actions">
  {!hidePrint && (
  <button
    className="sc-icon-btn sc-print-btn"
    onClick={() => window.print()}
  >
    🖨️
  </button>
)}



<button
  onClick={() => {
    const newDate = new Date(year, month + 1, 1);
    if (!academicEnd || newDate <= new Date(academicEnd.getFullYear(), academicEnd.getMonth(), 1)) {
      setCurrentDate(newDate);
    }
  }}
>
  ›
</button>
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
            const dayOfWeek = new Date(dateStr).getDay();
const isSunday = dayOfWeek === 0;
const finalEvent = ev || (isSunday ? {
  title: "Sunday",
  type: "holiday"
} : null);
const typeObj = eventTypeList.find(
  t => t.name.toLowerCase() === finalEvent?.type
);
            const dateObj = new Date(dateStr);

            const isOutside =
              academicStart &&
              academicEnd &&
              (dateObj < academicStart || dateObj > academicEnd);

            return (
              <div
              key={day}
              className={`sc-day 
                ${dateStr === todayStr ? "today" : ""} 
                ${isOutside ? "disabled-day" : ""}
              `}
              style={
                isOutside
                  ? { opacity: 0.3, pointerEvents: "none" }
                  : finalEvent
                  ? { background: typeObj?.color || "#ff3d71", color: "#fff" }
                  : {}
              }
              onClick={() => !isOutside && onDateSelect?.(dateStr)}
              onDoubleClick={() => {
                if (isOutside) return;
              
                if (ev) {
                  setNewEvent(ev);
                } else {
                  setNewEvent({
                    title: "",
                    subtitle: "",
                    message: "",
                    type: "holiday"
                  });
                }
              
                setEditingDate(dateStr);
              }}
            >
                <span>{day}</span>
                {finalEvent && (
  <div className="event-box">
    <small className="event-title">{finalEvent.title}</small>

    <div className="event-tooltip">
      <div className="tooltip-title">{finalEvent.title}</div>

      {finalEvent.subtitle && (
        <div className="tooltip-subtitle">
          {finalEvent.subtitle}:
        </div>
      )}

      {finalEvent.message && (
        <div className="tooltip-message">
          {finalEvent.message}
        </div>
      )}
    </div>
  </div>
)}
              </div>
            );
          })}
        </div>

        {!compact && upcoming.length > 0 && (
          <div className="sc-upcoming">
            <h4>Upcoming</h4>

            {upcoming.map((e, i) => {
  const typeObj = eventTypeList.find(
    t => t.name.toLowerCase() === e.type
  );

  return (
    <div key={i} className="sc-up-item">

      {/* 🎨 COLOR DOT */}
      <span
        className="dot"
        style={{ background: typeObj?.color || "#999" }}
      />

      <div className="up-content">

        {/* 🟣 TITLE */}
        <div className="up-title">
          {e.title}
        </div>

        {/* 🟪 SUBTITLE */}
        {e.subtitle && (
          <div className="up-subtitle">
            {e.subtitle}:
          </div>
        )}

        {/* 📜 MESSAGE */}
        {e.message && (
          <div className="up-message">
            {e.message}
          </div>
        )}

        {/* 📅 DATE */}
        <div className="up-date">
          {e.date}
        </div>

      </div>
    </div>
  );
})}
          </div>
        )}

        <div className="sc-footer">
          <span>Click → Select</span>
          <span>Double click → Add / Edit</span>
        </div>

        {/* EDIT POPUP */}
        {editingDate && (
  <div className="sc-modal">
    <div className="sc-modal-box" ref={modalRef}>
      <h4>Edit Event</h4>

      {/* TITLE */}
      <input
        placeholder="Title"
        value={events[editingDate]?.title || ""}
        onChange={e =>
          setEvents(prev => ({
            ...prev,
            [editingDate]: {
              ...prev[editingDate],
              title: e.target.value
            }
          }))
        }
      />

      {/* SUBTITLE */}
      <input
        placeholder="Subtitle"
        value={events[editingDate]?.subtitle || ""}
        onChange={e =>
          setEvents(prev => ({
            ...prev,
            [editingDate]: {
              ...prev[editingDate],
              subtitle: e.target.value
            }
          }))
        }
      />

      {/* MESSAGE */}
      <textarea
        placeholder="Message"
        value={events[editingDate]?.message || ""}
        onChange={e =>
          setEvents(prev => ({
            ...prev,
            [editingDate]: {
              ...prev[editingDate],
              message: e.target.value
            }
          }))
        }
      />
<div className="student-dropdown" ref={dropdownRef}>

<input
  placeholder="Event Type"
  value={eventType || eventSearch}
  onChange={e => {
    setEventSearch(e.target.value);
    setEventType("");
    setShowEventDropdown(true);
  }}
  onFocus={() => setShowEventDropdown(true)}
/>

{showEventDropdown && (
  <div className="student-dropdown-list">

    {eventTypeList
      .filter(t =>
        t.name.toLowerCase().includes(eventSearch.toLowerCase())
      )
      .map((t, i) => (
        <div
          key={i}
          className="student-option"
          onClick={() => {
            setEventType(t.name);
            setEventSearch("");
            setShowEventDropdown(false);
          }}
        >
          <span
            className="dot"
            style={{ background: t.color }}
          />
          {t.name}
        </div>
      ))}

    {/* ➕ ADD NEW TYPE */}
    {eventSearch && (
      <div
        className="student-option"
        style={{ color: "#2563eb" }}
        onClick={() => {
          const newType = eventSearch;

          // 🔥 random color OR default yellow
          const newColor = "#facc15"; // yellow

          setEventTypeList(prev => [
            ...prev,
            { name: newType, color: newColor }
          ]);

          setEventType(newType);
          setEventSearch("");
          setShowEventDropdown(false);
        }}
      >
        ➕ Add "{eventSearch}"
      </div>
    )}

  </div>
)}
</div>

      <div className="sc-actions">
        <button onClick={saveEdit}>Save</button>
        <button onClick={deleteEvent}>Delete</button>
        <button onClick={() => setEditingDate(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}
      </div>
      </>
    );
  }