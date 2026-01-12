import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function ExpensesPage({ adminUid, setActivePage }) {

  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  const role = localStorage.getItem("role");
  const isOfficeStaff = role === "office_staff";

  /* LOAD INCOME */
  useEffect(() => {
    if (!adminUid) return;
    return onSnapshot(
      collection(db,"users",adminUid,"Account","accounts","Income"),
      snap => {
        let arr=[];
        snap.forEach(d=>arr.push(d.data()));
        setIncomeList(arr);
      }
    );
  }, [adminUid]);

  /* LOAD EXPENSE */
  useEffect(() => {
    if (!adminUid) return;
    return onSnapshot(
      collection(db,"users",adminUid,"Account","accounts","Expenses"),
      snap => {
        let arr=[];
        snap.forEach(d=>arr.push(d.data()));
        setExpenseList(arr);
      }
    );
  }, [adminUid]);

  const totalIncome = useMemo(
    ()=>incomeList.reduce((s,i)=>s+Number(i.paidAmount||0),0),
    [incomeList]
  );
  const totalExpense = useMemo(
    ()=>expenseList.reduce((s,e)=>s+Number(e.amount||0),0),
    [expenseList]
  );
  const profit = totalIncome - totalExpense;

  /* GROUP BY DATE FOR CHART */
  const chartData = useMemo(()=>{
    const map={};
    incomeList.forEach(i=>{
      const d=i.date||"Unknown";
      map[d]=map[d]||{date:d,income:0,expense:0};
      map[d].income+=Number(i.paidAmount||0);
    });
    expenseList.forEach(e=>{
      const d=e.date||"Unknown";
      map[d]=map[d]||{date:d,income:0,expense:0};
      map[d].expense+=Number(e.amount||0);
    });
    return Object.values(map)
      .map(d=>({...d,profit:d.income-d.expense}))
      .sort((a,b)=>a.date.localeCompare(b.date));
  },[incomeList,expenseList]);

  return (
    <div className="accounts-wrapper fade-in">

      {!isOfficeStaff && (
        <>
          <h2 className="page-title">Accounts Dashboard</h2>

          <div className="stats-grid">
            <div className="info-card1 clickable" onClick={()=>setActivePage("income")}>
              <div className="label">Total Income</div>
              <div className="value">₹{totalIncome.toLocaleString("en-IN")}</div>
              <div className="trend up">Growing</div>
            </div>

            <div className="info-card2 clickable" onClick={()=>setActivePage("expenses")}>
              <div className="label">Total Expenses</div>
              <div className="value">₹{totalExpense.toLocaleString("en-IN")}</div>
              <div className="trend down">Spending</div>
            </div>

            <div className="info-card3 clickable" onClick={()=>setActivePage("profit")}>
              <div className="label">Profit</div>
              <div className="value">₹{profit.toLocaleString("en-IN")}</div>
              <div className={profit>=0?"trend up":"trend down"}>
                {profit>=0?"Healthy":"Loss"}
              </div>
            </div>
          </div>

          {profit<0 && <div className="alert-danger">⚠ Expenses exceed income</div>}

          <div className="chart-card">
            <div className="chart-header">
              <h3>Growth Overview</h3>
              <span>Income vs Expense vs Profit</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4}/>
                <XAxis dataKey="date"/>
                <YAxis/>
                <Tooltip formatter={v=>`₹${v.toLocaleString("en-IN")}`}/>
                <Line dataKey="income" stroke="#2563eb" strokeWidth={3}/>
                <Line dataKey="expense" stroke="#dc2626" strokeWidth={3}/>
                <Line dataKey="profit" stroke="#16a34a" strokeWidth={3}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="summary-row">
            <div className="summary-box blue">Income ₹{totalIncome.toLocaleString("en-IN")}</div>
            <div className="summary-box red">Expenses ₹{totalExpense.toLocaleString("en-IN")}</div>
            <div className="summary-box green">Profit ₹{profit.toLocaleString("en-IN")}</div>
          </div>
        </>
      )}

      <div className="accounts-grid">
        <div className="accounts-card" onClick={()=>setActivePage("profit")}>📒 Journal Entry</div>
        <div className="accounts-card" onClick={()=>setActivePage("inventory")}>📦 Inventory</div>
        {!isOfficeStaff && (
          <>
            <div className="accounts-card" onClick={()=>setActivePage("income")}>💵 Income</div>
            <div className="accounts-card" onClick={()=>setActivePage("expenses")}>💸 Expenses</div>
          </>
        )}
      </div>
    </div>
  );
}
