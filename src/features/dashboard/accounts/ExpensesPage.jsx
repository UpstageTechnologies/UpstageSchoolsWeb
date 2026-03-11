import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/ac.css";
import "../../dashboard_styles/accountwrapper.css"
import "../../dashboard_styles/design.css"
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
// ---------- CASH / ACCOUNT BALANCE ----------

// Cash income
const cashIncome = incomeList
  .filter(i => i.paymentMode === "Cash")
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

// Account income
const accountIncome = incomeList
  .filter(i => i.paymentMode === "Account")
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

// Cash expense
const cashExpense = expenseList
  .filter(e => e.paymentMode === "Cash")
  .reduce((s, e) => s + Number(e.amount || 0), 0);

// Account expense
const accountExpense = expenseList
  .filter(e => e.paymentMode === "Account")
  .reduce((s, e) => s + Number(e.amount || 0), 0);

// Final balances
const cashBalance = cashIncome - cashExpense;
const accountBalance = accountIncome - accountExpense;
// ---------- INCOME BREAKDOWN ----------
const sourceIncome = incomeList
  .filter(i => i.type === "source")
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

const newAdmission = incomeList
  .filter(i => i.paymentStage === "Admission")
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

const oldAdmission = incomeList
  .filter(i => i.paymentStage === "Term")
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

const competitionIncome = incomeList
  .filter(i => i.incomeType === "competition")
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);


// ---------- EXPENSE BREAKDOWN ----------
const salaryExpense = expenseList
  .filter(e => e.type === "salary")
  .reduce((s, e) => s + Number(e.amount || 0), 0);

const miscExpense = expenseList
  .filter(e => e.type === "student_misc")
  .reduce((s, e) => s + Number(e.amount || 0), 0);

const otherExpense = expenseList
  .filter(e => e.type === "others")
  .reduce((s, e) => s + Number(e.amount || 0), 0);
  const donutData = [
    { label: "Source Income", value: sourceIncome, color: "#8e44ad" },
    { label: "New Admission", value: newAdmission, color: "#a569bd" },
    { label: "Old Admission", value: oldAdmission, color: "#6c3483" },
    { label: "Competition Income", value: competitionIncome, color: "#e67e22" },
  
    { label: "Salary Expense", value: salaryExpense, color: "#3498db" },
    { label: "Student Misc", value: miscExpense, color: "#5dade2" },
    { label: "Other Expense", value: otherExpense, color: "#27ae60" }
  ];
  const totalBalance = cashBalance + accountBalance;
  const totalDonut = donutData.reduce((s,d)=>s+d.value,0);
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

    <div className="account-wrapper"><>
    
      {!isOfficeStaff && (
        <>
        
        
  <div className="summary2-scroll">

  <div className="summary2-layout">
  <div className="summary2-wrapper">




<div className="summary2-title">Balance Overview</div>
<div className="donut-wrapper">
<div className="donut-header">
<div className="donut-top-values">

<div className="donut-stat cash">
Cash
<b>₹{cashBalance.toLocaleString("en-IN")}</b>
</div>

<div className="donut-stat account">
Account
<b>₹{accountBalance.toLocaleString("en-IN")}</b>
</div>

</div>

</div>
<div className="donut-chart">
<svg viewBox="0 0 240 240">

{(() => {

let startAngle = -90;
const radius = 90;
const center = 120;

const polarToCartesian = (cx, cy, r, angle) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
};

return donutData.map((d,i)=>{

const percent = d.value / totalDonut;
const angle = percent * 360;

const start = polarToCartesian(center, center, radius, startAngle);
const end = polarToCartesian(center, center, radius, startAngle + angle);

const largeArc = angle > 180 ? 1 : 0;

const pathData = `
M ${start.x} ${start.y}
A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}
`;

startAngle += angle;

return (
<path
key={i}
className="donut-segment"
d={pathData}
fill="none"
stroke={d.color}
strokeWidth="34"
strokeLinecap="round"
/>
);

});

})()}

</svg>
<div className="donut-center">
₹{totalBalance.toLocaleString("en-IN")}
</div>

</div>


<div className="donut-legend">

{donutData.map((d,i)=>(
<div key={i} className="legend-item">
<span
className="legend-dot"
style={{background:d.color}}
></span>
{d.label}
</div>
))}

</div>

</div>
</div>
<div className="summary2-wrapper">
  <div className="summary2-title">Financial Overview</div>

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
    </div>
  );
}
 