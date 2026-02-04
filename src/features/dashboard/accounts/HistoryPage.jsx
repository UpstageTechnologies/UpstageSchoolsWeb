import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";

export default function HistoryPage({ adminUid, setActivePage }) {

  const [historyList, setHistoryList] = useState([]);

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

      {/* BACK */}
      <span
        style={{ cursor: "pointer", color: "#2140df", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>

      <h2 className="page-title">History</h2>

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
{historyList.map(h => (
  <tr key={h.id}>
  <td>{h.module}</td>
    <td>{h.action}</td>
    <td>{h.name}</td>
    <td>₹{h.amount}</td>
    <td>{formatDate(h.date)}</td>
  </tr>
))}
</tbody></table>

      </div>

    </div>
  );
}
