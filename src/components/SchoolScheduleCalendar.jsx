import React, { useEffect, useState ,useRef } from "react";
import { collection, getDocs ,onSnapshot ,setDoc,doc } from "firebase/firestore";
import { db } from "../services/firebase";
import "./SchoolCalendar.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchoolScheduleCalendar({ adminUid }) {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [schoolStart, setSchoolStart] = useState(null);
  const [schoolEnd, setSchoolEnd] = useState(null);
  const [govHolidays, setGovHolidays] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [eventSearch, setEventSearch] = useState("");
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
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    type: "working"
  });
  const [eventType, setEventType] = useState("");
  const [eventTypeList, setEventTypeList] = useState([
    { name: "Holiday", color: "#ff3d71" },
    { name: "Exam", color: "#2140df" },
    { name: "Meeting", color: "#00bcd4" },
    { name: "Birthday", color: "#ff9800" }
  ]);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* =====================================================
     LOAD ACADEMIC YEAR + SCHOOL EVENTS
  ===================================================== */
  useEffect(() => {
    if (!adminUid) return;
  
    // 🔥 1. School settings (one time ok)
    const loadSettings = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "SchoolSettings")
      );
  
      snap.forEach(doc => {
        const data = doc.data();
        if (data.startDate && data.endDate) {
          setSchoolStart(new Date(data.startDate));
          setSchoolEnd(new Date(data.endDate));
        }
      });
    };
  
    loadSettings();
  
    // 🔥 2. EVENTS → LIVE UPDATE
    const ref = collection(db, "users", adminUid, "calendar");
  
    const unsub = onSnapshot(ref, (snap) => {
      const evData = {};
      snap.forEach(d => {
        evData[d.id] = d.data();
      });
  
      console.log("🔥 LIVE EVENTS", evData);
  
      setEvents(evData);
    });
  
    return () => unsub();
  
  }, [adminUid]);

  /* =====================================================
     FETCH GOVT HOLIDAYS
  ===================================================== */
  useEffect(() => {
    if (!schoolStart || !schoolEnd) return;

    const fetchHolidays = async () => {
      try {
        const apiKey = "aZ4wCy6TovBRzSqAOmZzbQpn4m4mAZ8Q";
        const startYear = schoolStart.getFullYear();
        const endYear = schoolEnd.getFullYear();

        let holidayMap = {};

        for (let y = startYear; y <= endYear; y++) {
          const res = await fetch(
            `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=IN&year=${y}`
          );

          if (!res.ok) continue;

          const data = await res.json();
          if (!data.response) continue;

          data.response.holidays.forEach((holiday) => {
            const holidayDate = new Date(holiday.date.iso);

            if (
              holidayDate >= schoolStart &&
              holidayDate <= schoolEnd
            ) {
              holidayMap[holiday.date.iso] = {
                title: holiday.name,
                type: "gov"
              };
            }
          });
        }

        setGovHolidays(holidayMap);

      } catch (err) {
        console.error("Holiday fetch error:", err);
      }
    };

    fetchHolidays();
  }, [schoolStart, schoolEnd]);
  // 🔥 Range Limit Logic
const canGoPrev =
schoolStart &&
new Date(year, month - 1, 1) >=
  new Date(schoolStart.getFullYear(), schoolStart.getMonth(), 1);

const canGoNext =
schoolEnd &&
new Date(year, month + 1, 1) <=
  new Date(schoolEnd.getFullYear(), schoolEnd.getMonth(), 1);

  /* =====================================================
     SUMMARY CALCULATION
  ===================================================== */

  let totalDays = 0;
  let holidayCount = 0;

  if (schoolStart && schoolEnd) {
    let temp = new Date(schoolStart);

    while (temp <= schoolEnd) {

      totalDays++;

      const dateStr = temp.toISOString().split("T")[0];
      const isSunday = temp.getDay() === 0;
      const manual = events[dateStr];
      const gov = govHolidays[dateStr];

      // 🔥 Priority: Manual > Govt > Sunday
      if (manual?.type === "holiday") {
        holidayCount++;
      }
      else if (manual?.type === "working") {
        // override → working
      }
      else if (gov) {
        holidayCount++;
      }
      else if (isSunday) {
        holidayCount++;
      }

      temp.setDate(temp.getDate() + 1);
    }
  }

  const workingDays = totalDays - holidayCount;

  /* =====================================================
     CALENDAR GRID
  ===================================================== */

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const formatDate = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="sc-calendar">
<div className="sc-header">

{/* PREVIOUS */}
{canGoPrev && (
  <button
    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
  >
    ‹
  </button>
)}

<h3>
  {currentDate.toLocaleString("default", { month: "long" })} {year}
</h3>

{/* NEXT */}
{canGoNext && (
  <button
    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
  >
    ›
  </button>
)}

</div>

      {/* WEEK */}
      <div className="sc-week">
        {DAYS.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* GRID */}
      <div className="sc-grid">

        {[...Array(firstDay)].map((_, i) => (
          <div key={"empty" + i} className="sc-empty" />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {

          const day = i + 1;
          const dateStr = formatDate(day);

          const schoolEvent = events[dateStr];
          const govEvent = govHolidays[dateStr];
          const currentDateObj = new Date(year, month, day);

          if (
            schoolStart &&
            schoolEnd &&
            (currentDateObj < schoolStart ||
              currentDateObj > schoolEnd)
          ) {
            return <div key={day} className="sc-empty" />;
          }

          const isSunday = currentDateObj.getDay() === 0;

          let className = "sc-day";

          // 🔥 PRIORITY ORDER
          if (schoolEvent?.type === "holiday") {
            className += " holiday";
          }
          else if (schoolEvent?.type === "exam") {
            className += " exam";
          }
          else if (schoolEvent?.type === "meeting") {
            className += " meeting";
          }
          else if (schoolEvent?.type === "birthday") {
            className += " birthday";
          }
          else if (schoolEvent?.type === "working") {
            // override
          }
          else if (govEvent) {
            className += " gov-holiday";
          }
          else if (isSunday) {
            className += " sunday-holiday";
          }

          return (
            <div
              key={day}
              className={className}
              onDoubleClick={() => {
                setEditingDate(dateStr);
                setEditData({
                  title: schoolEvent?.title || "",
                  type: schoolEvent?.type || "working"
                });
              }}
            >
              <span>{day}</span>

              {schoolEvent && <small>{schoolEvent.title}</small>}
              {!schoolEvent && govEvent && <small>{govEvent.title}</small>}
            </div>
          );
        })}

      </div>

      {/* SUMMARY */}
      <div className="sc-summary">
        <h4>Academic Summary</h4>
        <div className="summary-box">
          <div>
            <strong>Total Days</strong>
            <p>{totalDays}</p>
          </div>
          <div>
            <strong>Holidays</strong>
            <p>{holidayCount}</p>
          </div>
          <div>
            <strong>Working Days</strong>
            <p>{workingDays}</p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingDate && (
        <div className="sc-modal">
        <div className="sc-modal-box modern-modal">
            <h4>Edit {editingDate}</h4>

            <input
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              placeholder="Title"
            />
            <input
            placeholder="Subtitle"/>
            <textarea placeholder="Message"/>
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
            <button
  onClick={async () => {
    console.log("🔥 SAVING", editingDate, editData);

    await setDoc(
      doc(db, "users", adminUid, "calendar", editingDate),
      {
        ...editData,
        date: editingDate
      },
      { merge: true }
    );

    console.log("✅ SAVED TO FIRESTORE");

    setEditingDate(null);
  }}
>
  Save
</button>

              <button
                onClick={() => {
                  setEvents(prev => {
                    const copy = { ...prev };
                    delete copy[editingDate];
                    return copy;
                  });
                  setEditingDate(null);
                }}
              >
                Clear
              </button>

              <button onClick={() => setEditingDate(null)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
