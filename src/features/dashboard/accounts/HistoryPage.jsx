import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";

export default function HistoryPage({ adminUid, setActivePage , globalSearch = ""}) {


  const [historyList, setHistoryList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); 
  const filteredHistory = historyList.filter(h => {

    const q = globalSearch.toLowerCase();
  
    // 🔥 TYPE FILTER USING MODULE
    if (activeFilter !== "all") {
  
      if (
        activeFilter === "income" &&
        !["FEES", "FEES_MASTER", "INCOME", "COMPETITION"].includes(h.module)
      ) return false;
  
      if (
        activeFilter === "expense" &&
        !["STUDENT_MISC", "EXPENSE"].includes(h.module)
      ) return false;
  
      if (
        activeFilter === "inventory" &&
        !["INVENTORY"].includes(h.module)
      ) return false;
    }
  
    // 🔍 SEARCH FILTER
    return (
      h.module?.toLowerCase().includes(q) ||
      h.action?.toLowerCase().includes(q) ||
      h.name?.toLowerCase().includes(q) ||
      String(h.amount || "").includes(q)
    );
  });
  
  
  useEffect(() => {

    if (!adminUid) return;
    const incomesRef  = collection(db,"users",adminUid,"Account","accounts","Income");
    const expensesRef = collection(db,"users",adminUid,"Account","accounts","Expenses");
    
    const historyRef  = collection(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      "History"
    );
    

    const unsub = onSnapshot(historyRef, snap => {
        setHistoryList(
            snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .sort((a,b)=> b.createdAt?.seconds - a.createdAt?.seconds)
          );          
    });
    return () => unsub();

  }, [adminUid]);
  const formatDate = (d) => {
    if (!d) return "";
  
    // Firestore Timestamp
    if (d.seconds) {
      return new Date(d.seconds * 1000).toLocaleDateString();
    }
  
    // Normal date string
    return new Date(d).toLocaleDateString();
  };
  const allDates = [
    ...new Set(
      filteredHistory
        .map(h => {
          if (!h.date) return null;
  
          // Firestore Timestamp
          if (h.date.seconds) {
            return new Date(h.date.seconds * 1000)
              .toISOString()
              .split("T")[0];
          }
  
          // normal string date
          return h.date;
        })
        .filter(Boolean)
    )
  ].sort();
  const [entryDate, setEntryDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  
  const currentPageIndex = allDates.indexOf(entryDate);
  const totalPages = allDates.length;
  
  const maxVisiblePages = 5;
  
  const getVisiblePages = () => {
    let start = Math.max(
      0,
      currentPageIndex - Math.floor(maxVisiblePages / 2)
    );
  
    let end = start + maxVisiblePages;
  
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - maxVisiblePages);
    }
  
    return allDates.slice(start, end).map((_, i) => start + i);
  };
  
  const goToPage = (index) => {
    if (index < 0 || index >= totalPages) return;
    setEntryDate(allDates[index]);
  };
  
  const prevPage = () => goToPage(currentPageIndex - 1);
  const nextPage = () => goToPage(currentPageIndex + 1);
  
  

  return (
    <div className="accounts-wrapper">
      <h2 className="page-title">History</h2>
      <div className="history-filters">


  <button
    className={activeFilter==="all" ? "tab-btn active" : "tab-btn"}
    onClick={()=>setActiveFilter("all")}
  >
    All
  </button>

  <button
    className={activeFilter==="income" ? "tab-btn active" : "tab-btn"}
    onClick={()=>setActiveFilter("income")}
  >
    Income
  </button>

  <button
    className={activeFilter==="expense" ? "tab-btn active" : "tab-btn"}
    onClick={()=>setActiveFilter("expense")}
  >
    Expense
  </button>

  <button
    className={activeFilter==="inventory" ? "tab-btn active" : "tab-btn"}
    onClick={()=>setActiveFilter("inventory")}
  >
    Inventory
  </button>
</div>

      <div className="section-card pop">
      <input
  type="date"
  value={entryDate}
  onChange={e => setEntryDate(e.target.value)}
  style={{ marginBottom: 12 }}
/>

        <table className="nice-table">
          <thead>
            <tr>
            <th>Type</th>
              <th>Action</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {historyList.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No history found
                </td>
              </tr>
            )}
{filteredHistory
  .filter(h => {
    if (!entryDate) return true;

    let hDate = "";

    // Firestore Timestamp
    if (h.date?.seconds) {
      hDate = new Date(h.date.seconds * 1000)
        .toISOString()
        .split("T")[0];
    } 
    // Normal date string
    else {
      hDate = h.date;
    }

    return hDate === entryDate;
  })
  .map(h => (
    <tr key={h.id}>
      <td data-label="Type">{h.module}</td>
      <td data-label="Action">{h.action}</td>
      <td data-label="Name">{h.name}</td>
      <td data-label="Amount">₹{h.amount}</td>
      <td data-label="Date">{formatDate(h.date)}</td>
    </tr>
  ))}

</tbody></table>
<div className="pagination-bar">
  <div className="tab-buttons">

    <button
      className="tab-btn"
      disabled={currentPageIndex === 0}
      onClick={prevPage}
    >
      Previous
    </button>

    {getVisiblePages().map(i => (
      <button
        key={i}
        className={`tab-btn ${i === currentPageIndex ? "active" : ""}`}
        onClick={() => goToPage(i)}
      >
        {i + 1}
      </button>
    ))}

    <button
      className="tab-btn"
      disabled={currentPageIndex === totalPages - 1}
      onClick={nextPage}
    >
      Next
    </button>

  </div>
</div>
 </div>

    </div>
  );
}
