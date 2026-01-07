import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import { Navigation } from "react-calendar";

export default function FeesPage({ adminUid }) {

  const [feesMaster, setFeesMaster] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  const [tab, setTab] = useState("fees");   // 👉 TAB CONTROL

  const feesRef     = collection(db,"users",adminUid,"Account","accounts","FeesMaster");
  const incomeRef   = collection(db,"users",adminUid,"Account","accounts","Income");
  const expenseRef  = collection(db,"users",adminUid,"Account","accounts","Expenses");

  useEffect(() => {
    if (!adminUid) return;

    onSnapshot(feesRef, s =>
      setFeesMaster(s.docs.map(d => ({ id:d.id, ...d.data() })))
    );

    onSnapshot(incomeRef, s =>
      setIncomeList(s.docs.map(d => ({ id:d.id, ...d.data() })))
    );

    onSnapshot(expenseRef, s =>
      setExpenseList(s.docs.map(d => ({ id:d.id, ...d.data() })))
    );

  }, [adminUid]);

  return (
    <div className="accounts-wrapper fade-in">
      
      

      <h2 className="page-title">Accounts Details</h2>

      {/* ---------- TAB BUTTONS ---------- */}
      <div className="tab-buttons">
        <button
          className={tab === "fees" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("fees")}
        >
          Fees Summary
        </button>

        <button
          className={tab === "income" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("income")}
        >
          Income Details
        </button>

        <button
          className={tab === "expenses" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("expenses")}
        >
          Expenses Details
        </button>
      </div>

      {/* =============== 1️⃣ FEES SUMMARY =============== */}
      {tab === "fees" && (
        <div className="section-card pop">
          <h3 className="section-title">Fees Summary</h3>

          <div className="nice-table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Fee Name</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {feesMaster.map(f => (
                  <tr key={f.id}>
                    <td data-label="Classname">{f.className}</td>
                    <td data-label="Name">{f.name}</td>
                    <td data-label="Amount">₹{f.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============== 2️⃣ INCOME DETAILS =============== */}
      {tab === "income" && (
        <>
          {/* NEW ADMISSION PAYMENTS */}
          <div className="section-card pop">
            <h3 className="section-title">New Admission — Payments</h3>

            <div className="nice-table-wrapper">
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Parent</th>
                    <th>Class</th>
                    <th>Paid</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {incomeList
                    .filter(i => i.studentId)
                    .map(i => (
                      <tr key={i.id}>
                        <td data-label="Student Name">{i.studentName}</td>
                        <td data-label="Parent Name">{i.parentName}</td>
                        <td data-label="Class Name">{i.className}</td>
                        <td data-label="PaidAmount">₹{i.paidAmount}</td>
                        <td data-label="Type">{i.type || "-"}</td>
                        <td data-label="Date">{i.date}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OLD STUDENTS */}
          <div className="section-card pop">
            <h3 className="section-title">Old Students — Fee Payments</h3>

            <div className="nice-table-wrapper">
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Paid</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {incomeList
                    .filter(i => i.studentId && !i.isNew)
                    .map(i => (
                      <tr key={i.id}>
                        <td data-label="Student Name">{i.studentName}</td>
                        <td data-label="Class Name">{i.className}</td>
                        <td data-label="PaidAmount">₹{i.paidAmount}</td>
                        <td data-label="Date">{i.date}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FULL PAYMENT */}
          <div className="section-card pop">
            <h3 className="section-title">Full Payment Students</h3>

            <div className="nice-table-wrapper">
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Paid</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {incomeList
                    .filter(i => i.type === "full")
                    .map(i => (
                      <tr key={i.id}>
                        <td data-label="Student Name">{i.studentName}</td>
                        <td data-label="Class Name">{i.className}</td>
                        <td data-label="PaidAmount">₹{i.paidAmount}</td>
                        <td data-label="Date">{i.date}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PARTIAL PAYMENT */}
          <div className="section-card pop">
            <h3 className="section-title">Partial Payment Students</h3>

            <div className="nice-table-wrapper">
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {incomeList
                    .filter(i => i.type === "partial")
                    .map(i => (
                      <tr key={i.id}>
                        <td data-label="Student Name">{i.studentName}</td>
                        <td data-label="Class Name">{i.className}</td>
                        <td data-label="PaidAmount">₹{i.paidAmount}</td>
                        <td data-label="balance">₹{(i.totalFees || 0) - (i.paidAmount || 0)}</td>
                        <td data-label="Date">{i.date}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =============== 3️⃣ EXPENSE DETAILS =============== */}
      {tab === "expenses" && (
        <div className="section-card pop">
          <h3 className="section-title">Expenses Details</h3>

          <div className="nice-table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {expenseList.map(e => (
                  <tr key={e.id}>
                    <td data-label="Type">{e.type}</td>
                    <td data-label="Name">{e.name}</td>
                    <td data-label="Amount">₹{e.amount}</td>
                    <td data-label="Date">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
