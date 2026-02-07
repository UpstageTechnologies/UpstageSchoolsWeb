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
{filteredHistory.map(h => (
  <tr key={h.id}>
 <td data-label="Type">{h.module}</td>
<td data-label="Action">{h.action}</td>
<td data-label="Name">{h.name}</td>
<td data-label="Amount">₹{h.amount}</td>
<td data-label="Date">{formatDate(h.date)}</td>
  </tr>
))}
</tbody></table>

      </div>

    </div>
  );
}
