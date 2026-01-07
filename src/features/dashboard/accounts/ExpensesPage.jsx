import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function ExpensesPage({ adminUid, setActivePage }) {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const profit = totalIncome - totalExpense;

  /* ----------- LOAD INCOME ----------- */
  useEffect(() => {
    if (!adminUid) return;

    const ref = collection(db, "users", adminUid, "income");

    const unsub = onSnapshot(ref, (snap) => {
      let sum = 0;
      snap.forEach((d) => (sum += Number(d.data().amount || 0)));
      setTotalIncome(sum);
    });

    return () => unsub();
  }, [adminUid]);

  /* ----------- LOAD EXPENSES ----------- */
  useEffect(() => {
    if (!adminUid) return;

    const ref = collection(db, "users", adminUid, "expenses");

    const unsub = onSnapshot(ref, (snap) => {
      let sum = 0;
      snap.forEach((d) => (sum += Number(d.data().amount || 0)));
      setTotalExpense(sum);
    });

    return () => unsub();
  }, [adminUid]);

  return (
    <div className="accounts-wrapper fade-in">
      <h2 className="page-title">Accounts Dashboard</h2>

      <div className="stats-grid">

<div className="info-card1">
  <div className="label">Total Income</div>
  <div className="value">₹{totalIncome.toLocaleString("en-IN")}</div>
</div>

<div className="info-card2">
  <div className="label">Total Expenses</div>
  <div className="value">₹{totalExpense.toLocaleString("en-IN")}</div>
</div>

<div className="info-card3">
  <div className="label">Profit</div>
  <div className="value" style={{ color: profit >= 0 ? "green" : "red" }}>
    ₹{profit.toLocaleString("en-IN")}
  </div>
</div>

</div>


<div className="accounts-grid">

{/* JOURNAL ENTRY BOX */}
<div
  className="accounts-card"
  onClick={() => setActivePage("profit")}
>
  <h3>📒 Journal Entry</h3>
  <p>Add / View Income & Expenses</p>
</div>

{/* ACCOUNTING BOX */}
<div
  className="accounts-card"
  onClick={() => setActivePage("fees")}
>
  <h3>💰 Accounting</h3>
  <p>Student Fees Management</p>
</div>

</div>

    </div>
  );
}
