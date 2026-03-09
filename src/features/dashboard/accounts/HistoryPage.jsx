import React, { useEffect, useState } from "react";
import { collection, onSnapshot , addDoc, deleteDoc, doc , setDoc,query,orderBy} from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/History.css";
import { FaArrowLeft,FaArrowRight, FaUndo } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
export default function HistoryPage({ adminUid, setActivePage , globalSearch = ""}) {
  const [historyList, setHistoryList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); 
   const [sortField, setSortField] = useState("createdAt");
   const [sortDirection, setSortDirection] = useState("desc");
   const [openMenuId, setOpenMenuId] = useState(null);
  const filteredHistory = historyList.filter(h => {
    const entryType = h.entryType;
    const action =   h.action;
  
    if (activeFilter === "income") {
      return entryType === "income" && action !== "DELETE";
    }
  
    else if (activeFilter === "expense") {
      return entryType === "expense" && action !== "DELETE";
    }
  
    else if (activeFilter === "inventory") {
      return entryType === "inventory" && action !== "DELETE";
    }

    else if (activeFilter === "deleted") {
      return action === "DELETE";
    }
  
    else {
      return true; // all
    }
  
  });
  const handleUndo = async (item) => {

    if (!item.originalData) {
      alert("Old record – No backup data available");
      return;
    }
  
    let collectionName = "";
  
    // 🔥 use module instead of entryType
    if (item.module === "SALARY_MASTER") {
      collectionName = "FeesMaster";
    }
    else if (item.module === "FEES_MASTER") {
      collectionName = "FeesMaster";
    }
    else if (item.module === "COMPETITION") {
      collectionName = "Competition";
    }
    else if (item.entryType === "income") {
      collectionName = "Income";
    }
    else if (item.entryType === "expense") {
      collectionName = "Expenses";
    }
    else {
      return;
    }
  
    await addDoc(
      collection(db, "users", adminUid, "Account", "accounts", collectionName),
      item.originalData
    );
  
    await deleteDoc(
      doc(db, "users", adminUid, "Account", "accounts", "History", item.id)
    );
  
    alert("Restored successfully ✅");
  };
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
    const q = query(
      historyRef,
      orderBy(sortField, sortDirection)
    );
    
    const unsub = onSnapshot(q, snap => {
      setHistoryList(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();

  }, [adminUid, sortField, sortDirection]);
  
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
  const handleSort = (field) => {
    console.log("Clicked:", field); 
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const [entryDate, setEntryDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  
  const currentPageIndex = allDates.indexOf(entryDate);
  const totalPages = allDates.length;
  
  const maxVisiblePages = 4;
  
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
  
  const [tableSearch, setTableSearch] = useState("");
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
  
    return sortDirection === "asc" 
      ?<FiChevronUp style={{ marginLeft: 6, fontSize: 12 }} />
      : <FiChevronDown style={{ marginLeft: 6, fontSize: 12 }} />;
  };
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
  <button
  className={activeFilter==="deleted" ? "tab-btn active" : "tab-btn"}
  onClick={()=>setActiveFilter("deleted")}
>
  Deleted
</button>
</div>

<div className="section-card pop">

<div className="history-controls">

  <input
    type="date"
    value={entryDate}
    onChange={e => setEntryDate(e.target.value)}
  />

  <input
    type="text"
    placeholder="Search history..."
    value={tableSearch}
    onChange={(e) => setTableSearch(e.target.value)}
  />

</div>

        <table className="history-table">
          <thead>
            <tr>
            <th onClick={() => handleSort("module")}>Type</th>

<th onClick={() => handleSort("action")}>Action</th>
<th 
  onClick={() => handleSort("name")}
  style={{ cursor: "pointer" }}
>
  Name {renderSortIcon("name")}
</th>

<th 
  onClick={() => handleSort("amount")}
  style={{ cursor: "pointer" }}
>
  Amount {renderSortIcon("amount")}
</th>

<th 
  onClick={() => handleSort("date")}
  style={{ cursor: "pointer" }}
>
  Date {renderSortIcon("date")}
</th>
<th>Action</th>
            </tr>
          </thead>

          <tbody>

          {filteredHistory
  .filter(h => {
    if (!entryDate) return true;

    let hDate = "";

    if (h.date?.seconds) {
      hDate = new Date(h.date.seconds * 1000)
        .toISOString()
        .split("T")[0];
    } else {
      hDate = h.date;
    }

    return hDate === entryDate;
  })
  .filter(h => {
    if (!tableSearch.trim()) return true;
    const search = tableSearch.toLowerCase();

    return (
      h.module?.toLowerCase().includes(search) ||
      h.action?.toLowerCase().includes(search) ||
      h.name?.toLowerCase().includes(search) ||
      String(h.amount)?.includes(search)
    );
  }).length === 0 && (

<tr>
  <td colSpan="6" style={{ textAlign:"center", padding:"20px" }}>
  No history available for this date
  </td>
</tr>

)}
{filteredHistory
  .filter(h => {
    console.log(tableSearch);
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
  
  .filter(h => {
   
    if (!tableSearch.trim()) return true;
    const search = tableSearch.toLowerCase();
    
    return (
      h.module?.toLowerCase().includes(search) ||
      h.action?.toLowerCase().includes(search) ||
      h.name?.toLowerCase().includes(search) ||
      String(h.amount)?.includes(search)
    );
  })
  .map(h => (
    <tr key={h.id}>
      <td data-label="Type">{h.module}</td>
      <td data-label="Action">{h.action}</td>
      <td data-label="Name">{h.name}</td>
      <td data-label="Amount">₹{h.amount}</td>
      <td data-label="Date">{formatDate(h.date)}</td>
      <td className="action-cell">

  {h.action === "DELETE" && (
    <>
      {/* Desktop Undo */}
      <button
        className="undo-btn"
        onClick={() => handleUndo(h)}
      >
        <FaUndo style={{ marginRight: 6 }} /> Undo
      </button>

      {/* Mobile 3 dots */}
      <button
        className="menu-dots"
        onClick={() =>
          setOpenMenuId(openMenuId === h.id ? null : h.id)
        }
      >
        <BsThreeDotsVertical />
      </button>

      {openMenuId === h.id && (
        <div className="menu-popup">
          <button onClick={() => handleUndo(h)}>
            <FaUndo style={{ marginRight: 6 }} />
            Undo
          </button>
        </div>
      )}
    </>
  )}

  {h.action === "UNDO" && (
    <span style={{ color: "green", fontWeight: "bold" }}>
      Restored
    </span>
  )}

</td>
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
      <span><FaArrowLeft/></span>
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
      <span><FaArrowRight/></span>
    </button>

  </div>
</div>
 </div>

    </div>
  );
}
