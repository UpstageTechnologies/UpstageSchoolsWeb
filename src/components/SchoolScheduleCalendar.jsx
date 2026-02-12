import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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
  const [editData, setEditData] = useState({
    title: "",
    type: "working"
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* =====================================================
     LOAD ACADEMIC YEAR + SCHOOL EVENTS
  ===================================================== */
  useEffect(() => {
    if (!adminUid) return;

    const loadData = async () => {

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

      const eventSnap = await getDocs(
        collection(db, "users", adminUid, "calendar")
      );

      const evData = {};
      eventSnap.forEach(d => {
        evData[d.id] = d.data();
      });

      setEvents(evData);
    };

    loadData();
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
          <div className="sc-modal-box">
            <h4>Edit {editingDate}</h4>

            <input
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              placeholder="Title"
            />

            <select
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value })
              }
            >
              <option value="working">Working Day</option>
              <option value="holiday">Holiday</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="birthday">Birthday</option>
            </select>

            <div className="sc-actions">
              <button
                onClick={() => {
                  setEvents(prev => ({
                    ...prev,
                    [editingDate]: {
                      date: editingDate,
                      ...editData
                    }
                  }));
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
