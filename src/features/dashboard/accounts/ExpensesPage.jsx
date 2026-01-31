import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/ac.css";
export default function ExpensesPage({ adminUid, setActivePage }) {

  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const role = localStorage.getItem("role");
  const isOfficeStaff = role === "office_staff";
  useEffect(() => {
    if (!adminUid) return;
    return onSnapshot(
      collection(db, "users", adminUid, "Account", "accounts", "Income"),
      snap => setIncomeList(snap.docs.map(d => d.data()))
    );
  }, [adminUid]);

  useEffect(() => {
    if (!adminUid) return;
    return onSnapshot(
      collection(db, "users", adminUid, "Account", "accounts", "Expenses"),
      snap => setExpenseList(snap.docs.map(d => d.data()))
    );
  }, [adminUid]);
  
  const getPercent = (value, total) => {
    if (!total || total <= 0) return 0;
    return Math.min((value / total) * 100, 100);
  };
const totalFees = incomeList
  .filter(i => i.studentId)
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);
const otherIncome = incomeList
  .filter(i => !i.studentId)
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);
const totalIncome = totalFees + otherIncome;
const totalExpense = expenseList.reduce(
  (s, e) => s + Number(e.amount || 0), 0
);
const profit = totalIncome - totalExpense;

const totalBase = Math.max(
  totalFees,
  totalIncome,
  totalExpense,
  Math.abs(profit),
  1
);

const pillData = [
  { label: "Fees Income", value: totalFees, color: "fill-purple", icon: "fa-graduation-cap" },
  { label: "Total Income", value: totalIncome, color: "fill-blue", icon: "fa-arrow-up" },
  { label: "Total Expense", value: totalExpense, color: "fill-red", icon: "fa-arrow-down" },
  { label: "Total Profit", value: profit, color: "fill-green", icon: "fa-chart-line" }
];

const maxValue = Math.max(...pillData.map(p => Math.abs(p.value)), 1);

const getFillPercent = (value) => {
  if (!value) return 5;              // tiny visible base
  return Math.min((Math.abs(value) / maxValue) * 100, 100);
};

  /// Today Income (fees + source)
const todayIncome = incomeList
.filter(i => i.date === today)
.reduce((s, i) => s + Number(i.paidAmount || 0), 0);

// Today Expense
const todayExpense = expenseList
.filter(e => e.date === today)
.reduce((s, e) => s + Number(e.amount || 0), 0);

// Today Profit
const todayProfit = todayIncome - todayExpense;


  const max = Math.max(totalIncome, totalExpense, Math.abs(profit), 1);
  const monthlyProfit = (() => {
    const map = {};
  
    incomeList.forEach(i => {
      if (!i.date) return;
      const m = i.date.slice(0,7);
      map[m] = map[m] || { income: 0, expense: 0 };
      map[m].income += Number(i.paidAmount || 0);
    });
  
    expenseList.forEach(e => {
      if (!e.date) return;
      const m = e.date.slice(0,7);
      map[m] = map[m] || { income: 0, expense: 0 };
      map[m].expense += Number(e.amount || 0);
    });
  
    const arr = Object.keys(map).sort().map(m => ({
      month: m,
      profit: map[m].income - map[m].expense
    }));
  
    return arr;
  })(); const maxProfitValue = Math.max(
    ...monthlyProfit.map(m => Math.abs(m.profit)),
    1
  ) * 1.2;  
  const getY = (profit) => {
    const mid = 60;   // center line
    const range = 45;
  
    if (profit === 0) return mid;
  
    const ratio = Math.min(Math.abs(profit) / maxProfitValue, 1);
  
    if (profit > 0) {
      return mid - ratio * range;   // profit goes UP
    } else {
      return mid + ratio * range;   // loss goes DOWN
    }
  };
  const POINT_GAP = 160; 
  const chartWidth = monthlyProfit.length * POINT_GAP;
  return (
    <>
    
      {!isOfficeStaff && (
        <>
        
        
  <div className="summary2-scroll">
  <div className="summary2-layout">


{/* ---------- LEFT SIDE : MONTHLY PROFIT FLOW ---------- */}
<div className="summary2-left">

  {/* Top small stats */}
  <div className="attendance-panel">
    <div>
      <h4>Total Months</h4>
      <h2>{monthlyProfit.length}</h2>
    </div>

    <div>
      <h4>Current Profit</h4>
      <h1>₹{profit.toLocaleString("en-IN")}</h1>
    </div>
  </div>

  {/* Monthly Profit Flow */}
  <div className="monthly-flow2">
  <svg
  className="trend-line"
  viewBox={`0 0 ${chartWidth} 120`}
  width={chartWidth}
  preserveAspectRatio="none"
><line
  x1="0"
  y1="80"
  x2={chartWidth}
  y2="80"
  stroke="#ddd"
  strokeWidth="2"
/><path
  d={
    monthlyProfit.map((m, i) => {
      const x = i * POINT_GAP;
      const y = getY(m.profit);

      const boxWidth = 110;   // same as CSS
      const boxHalf = boxWidth / 2;

      if (i === 0) {
        // Start from BOTTOM CENTER of first box
        return `M ${x} ${y + 24}`;
      }

      const prevX = (i - 1) * POINT_GAP;
      const prevY = getY(monthlyProfit[i - 1].profit);

      return `
        L ${prevX} ${prevY + 24}
        L ${prevX} ${y + 24}
        L ${x} ${y + 24}
      `;
    }).join(" ")
  }
  fill="none"
  stroke="#6fa8ff"
  strokeWidth="3"
  strokeLinecap="square"
  strokeLinejoin="miter"
/>

</svg>
{monthlyProfit.map((m, i) => {
const y = getY(m.profit);
  return (
    <div
      key={i}
      className={`flow-item ${m.profit >= 0 ? "green" : "orange"}`}
      style={{
        left: `${i * POINT_GAP - 45}px`,
        top: `${y - 5}px`        
      }}
    >
      <small>{m.month}</small>
      <b>₹{m.profit.toLocaleString("en-IN")}</b>
    </div>
  );
})}
  </div>
</div>
<div className="summary2-wrapper">
  <div className="summary2-title">Overall Accounts</div>

  <div className="summary2-cards">
  {pillData.map((p, i) => (
    <div className="summary2-card" key={i}>
      <div className="summary2-top-fixed">
        ₹{p.value.toLocaleString("en-IN")}
      </div>

      {/* Fill proportional EXACTLY like attendance */}
      <div
        className={`summary2-fill ${p.color}`}
        style={{ height: `${getPercent(Math.abs(p.value), totalBase)}%` }}
      />

      <div className="summary2-content">
        <i className={`fa ${p.icon}`}></i>
        <span>{p.label}</span>
      </div>
    </div>
  ))}
</div>


</div>

</div>
</div>
</>
      )}
      {/* ===== TODAY SUMMARY ===== */}
      {!isOfficeStaff && (
<div className="today-summary">

<div className="today-card blue">
  <span>Today Income</span>
  <h2>₹{todayIncome.toLocaleString("en-IN")}</h2>
</div>

<div className="today-card yellow">
  <span>Today Expense</span>
  <h2>₹{todayExpense.toLocaleString("en-IN")}</h2>
</div>

<div className="today-card green">
  <span>Today Profit</span>
  <h2>₹{todayProfit.toLocaleString("en-IN")}</h2>
</div>

</div>
      )}

      <div className="accounts-grid">
        <div className="accounts-card" onClick={() => setActivePage("profit")}>📒 Journal Entry</div>
        <div className="accounts-card" onClick={() => setActivePage("inventory")}>📦 Inventory</div>
        {!isOfficeStaff && (
          <>
            <div className="accounts-card" onClick={() => setActivePage("income")}>💵 Income</div>
            <div className="accounts-card" onClick={() => setActivePage("expenses")}>💸 Expenses</div>


          </>
        )}
      </div>

    </>
  );
}
