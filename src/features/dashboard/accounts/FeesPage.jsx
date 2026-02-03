import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
export default function FeesPage({ adminUid, mode, setActivePage , globalSearch = ""}) {
const [incomeList, setIncomeList] = useState([]);
const [expenseList, setExpenseList] = useState([]);
const [showReport, setShowReport] = useState(false);
const [reportType, setReportType] = useState("month"); 
const [printMode, setPrintMode] = useState(false);
const [reportData, setReportData] = useState([]);
const [selectedFeeFilter, setSelectedFeeFilter] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [showTermDropdown, setShowTermDropdown] = useState(false);
const [feeCategory, setFeeCategory] = useState("Tuition");
const [filterClass, setFilterClass] = useState("All");
const [showPendingPopup, setShowPendingPopup] = useState(false);
const [pendingClass, setPendingClass] = useState("");
const [pendingFee, setPendingFee] = useState(null);
const [feesMaster, setFeesMaster] = useState([]);
const [students, setStudents] = useState([]);
const [showGeneratedReport, setShowGeneratedReport] = useState(false);
const [reportFilter, setReportFilter] = useState("all"); 
const [classes, setClasses] = useState([]);
const [classSearchText, setClassSearchText] = useState("");
const [showClassFilterDropdown, setShowClassFilterDropdown] = useState(false);
const [reportPendingClass, setReportPendingClass] = useState("");
const [reportPendingFee, setReportPendingFee] = useState(null);
const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);

const normalizePaymentType = (i) => {
  if (!i.paymentType) return "";

  return i.paymentType
    .toLowerCase()
    .replace(/\s+/g, "");
};
const generateReport = () => {
  let data = filterIncomeByDate().map(i => ({
    ...i,
    paymentType: normalizePaymentType(i)
  }));

  if (reportFilter === "new") {
    data = data.filter(i => i.isNew === true);
  }
  else if (reportFilter !== "all" && reportFilter !== "pending") {
    data = data.filter(i => i.paymentType === reportFilter);
  }
  if (reportFilter === "pending") {
    if (!reportPendingClass || !reportPendingFee) {
      alert("Please select class and fees");
      return;
    }
    data = students
      .filter(s => s.class === reportPendingClass)
      .map(s => {
        const balance = getBalance(s.id, reportPendingFee);
        if (balance <= 0) return null;

        return {
          id: s.id,
          studentName: s.studentName,
          className: reportPendingClass,
          balance,
          paidAmount: getPaidAmount(s.id, reportPendingFee.id),
          paymentType: "pending"
        };
      })
      .filter(Boolean);
  }
  setReportData(data);
  setShowGeneratedReport(true);
};
const filterIncomeByDate = () => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  let filtered = [...incomeList];
  if (reportType === "day") {
    filtered = filtered.filter(i => i.date === todayStr);
  }
  if (reportType === "month") {
    const month = todayStr.slice(0, 7);
    filtered = filtered.filter(i => i.date?.startsWith(month));
  }
  if (reportType === "year") {
    const year = todayStr.slice(0, 4);
    filtered = filtered.filter(i => i.date?.startsWith(year));
  }
  if (reportType === "custom") {
    if (!fromDate || !toDate) return [];
    filtered = filtered.filter(
      i => i.date >= fromDate && i.date <= toDate
    );
  }
  return filtered;
};
const applyDateFilter = (list) => {
  if (!printMode) return list;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (reportType === "day") {
    return list.filter(i => i.date === todayStr);
  }
  if (reportType === "month") {
    const month = todayStr.slice(0, 7);
    return list.filter(i => i.date?.startsWith(month));
  }
  if (reportType === "year") {
    const year = todayStr.slice(0, 4);
    return list.filter(i => i.date?.startsWith(year));
  }
  if (reportType === "custom") {
    if (!fromDate || !toDate) return list;
    return list.filter(
      i => i.date >= fromDate && i.date <= toDate
    );
  }
  return list;
};
  const [incomeTab, setIncomeTab] = useState("new"); 
  const [feesMasterTab, setFeesMasterTab] = useState(false);
  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );
  const expenseRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Expenses"
  );
  const feesRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "FeesMaster"
  );
  const studentsRef = collection(db, "users", adminUid, "students");
const unsubStudents = onSnapshot(studentsRef, snap => {
  setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});
useEffect(() => {
    if (!adminUid) return;
    let unsubIncome = () => {};
    let unsubExpense = () => {};
    let unsubFees = () => {};
    let unsubStudents = () => {};
    if (mode === "income") {
      unsubIncome = onSnapshot(incomeRef, snap => {
        setIncomeList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  
    if (mode === "expenses" || mode === "income") {
      unsubExpense = onSnapshot(expenseRef, snap => {
        setExpenseList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  
    unsubFees = onSnapshot(feesRef, snap => {
      setFeesMaster(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  
    unsubStudents = onSnapshot(studentsRef, snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const classesRef = collection(db, "users", adminUid, "Classes");
const unsubClasses = onSnapshot(classesRef, snap => {
  setClasses(snap.docs.map(d => ({
    id: d.id,
    name: d.data().name
  })));
});
    return () => {
      unsubIncome();
      unsubExpense();
      unsubFees();
      unsubStudents();
      unsubClasses();
    };
  }, [adminUid, mode]);
  const isPrintActive = (tab) => incomeTab === tab
const getFeePaid = (studentId, feeId) =>
incomeList
  .filter(i => i.studentId === studentId && i.feeId === feeId)
  .reduce((t, i) => t + Number(i.paidAmount || 0), 0);

// balance using payableAmount (after discount)
const getFeeBalance = (studentId, fee) => {
const payments = incomeList.filter(
  i => i.studentId === studentId && i.feeId === fee
);

if (!payments.length) return 0;

const payable = payments[0].payableAmount || payments[0].totalFees || 0;
const paid = getFeePaid(studentId, fee);

return Math.max(0, payable - paid);
};
const getPaidAmount = (studentId, feeId) =>
  incomeList
    .filter(i => i.studentId === studentId && i.feeId === feeId)
    .reduce((t, i) => t + Number(i.paidAmount || 0), 0);

const getBalance = (studentId, fee) => {
  const payments = incomeList.filter(
    i => i.studentId === studentId && i.feeId === fee.id
  );

  if (!payments.length) return fee.amount;

  const admission = payments.find(p => p.paymentStage === "Admission");
  const payable = admission?.payableAmount || fee.amount;

  const paid = getPaidAmount(studentId, fee.id);
  return Math.max(0, payable - paid);
};

const getPendingTerms = (studentId, feeId) => {
  const termPayments = incomeList.filter(
    i =>
      i.studentId === studentId &&
      i.feeId === feeId &&
      i.paymentType?.startsWith("term")
  );

  const paidTerms = termPayments.map(p => p.paymentType); 
  const allTerms = ["term1", "term2", "term3"];

  const pending = allTerms.filter(t => !paidTerms.includes(t));

  if (pending.length === 3) return "Not Paid";

  return pending
    .map(t => t.replace("term", "Term "))
    .join(" & ") + " Not Paid";
};
const competitionAnalysis = (() => {

  const map = {};

  // 🟢 COLLECT COMPETITION INCOME
  incomeList
    .filter(i => i.incomeType === "competition")
    .forEach(i => {

      const key = `${i.className}__${i.competitionName}`;

      if (!map[key]) {
        map[key] = {
          className: i.className,
          competitionName: i.competitionName,
          expenseName: "",
          income: 0,
          expense: 0
        };
      }

      map[key].income += Number(i.paidAmount || 0);
    });

  // 🔴 COLLECT STUDENT MISC EXPENSE
  expenseList
    .filter(e => e.type === "student_misc")
    .forEach(e => {

      const key = `${e.className}__${e.miscName}`;

      if (!map[key]) {
        map[key] = {
          className: e.className,
          competitionName: e.miscName,
          expenseName: "",
          income: 0,
          expense: 0
        };
      }

      map[key].expense += Number(e.amount || 0);

      if (!map[key].expenseName) {
        map[key].expenseName = e.name;
      }
    });

  return Object.values(map);
})();

  return (
    <div className="accounts-wrapper fade-in">

  <div className="table-header">
  <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>
      <button style={{marginLeft:"30%"}}
    className="report-btn"
    onClick={() => setShowReport(true)}
  >
    📄 Report
  </button>
</div>
{showReport && (
  <div className="report-box">
    <h3>{mode === "income" ? "Income Report" : "Expense Report"}</h3>
    <select
      value={reportType}
      onChange={e => setReportType(e.target.value)}
    >
      <option value="year">Yearly</option>
      <option value="month">Monthly</option>
      <option value="day">Daily</option>
      <option value="custom">Custom</option>
    </select>
{reportType === "custom" && (
      <>
        <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
      </> )}
    <select
  value={reportFilter}
  onChange={(e) => {
    setReportFilter(e.target.value);
    if (e.target.value === "pending") {
      setShowPendingPopup(true); // same popup
    }
  }}>
  <option value="all">All</option>
  <option value="new">New Admission</option>
  <option value="full">Full Payment</option>
  <option value="partial">Partial Payment</option>
  <option value="term1">Term 1</option>
  <option value="term2">Term 2</option>
  <option value="term3">Term 3</option>
  <option value="pending">Pending Payment</option>
</select>
    <button onClick={generateReport} style={{marginLeft:12}}>Generate</button>
    <button onClick={() => {
  setShowReport(false);
  setShowGeneratedReport(false);
  setReportData([]);
}}>
  Close
</button>


    <button   onClick={() => {
    window.print();
    setPrintMode(false);
  }} style={{marginLeft:12,margin:10}}>
      🖨 Print
    </button>

  </div>
)}
      <h2 className="page-title">
        {mode === "income" ? "Income Details" : "Expenses Details"}
      </h2>
      {showGeneratedReport && (
  <div className="section-card pop print-area">
    <h3 className="section-title">
      Income Report – {reportFilter.toUpperCase()}
    </h3>

    <table className="nice-table">
  <thead>
    <tr>
      <th>Student</th>
      <th>Class</th>
      <th>Payment Type</th>
      <th>Paid</th>
      <th>Balance</th>
      <th>Date</th>
    </tr>
  </thead>

  <tbody>
    {reportData.length === 0 ? (
      <tr>
        <td colSpan="6" style={{ textAlign: "center" }}>
          No data found
        </td>
      </tr>
    ) : (
      reportData.map(i => {
        const balance =
          i.paymentType === "pending"
            ? i.balance
            : getFeeBalance(i.studentId, i.feeId);

        return (
          <tr key={i.id}>
            <td data-label="Student">{i.studentName}</td>
            <td data-label="Class">{i.className}</td>

            <td
              data-label="Payment Type"
              style={{ textTransform: "capitalize" }}
            >
              {i.paymentType}
            </td>

            <td data-label="Paid">₹{i.paidAmount || 0}</td>

            <td
              data-label="Balance"
              style={{ color: balance > 0 ? "red" : "green" }}>
              ₹{balance}
            </td>

            <td data-label="Date">{i.date || "-"}</td>
          </tr>
        );
      })
    )}
  </tbody>
</table>

  </div>
)}
      {mode === "income" && (
        <>
         <div className="tab-buttons">

  <button
    className={incomeTab === "new" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("new")}
  >
    New Admission
  </button>

  <button
    className={incomeTab === "old" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("old")}
  >
    Old Admission
  </button>

  <button
    className={incomeTab === "full" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("full")}
  >
    Full Payment
  </button>

  <button
    className={incomeTab === "partial" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("partial")}
  >
    Partial Payment
  </button>

  {/* 🔽 TERMS DROPDOWN */}
  <div className="term-dropdown-wrapper">
  <button
    className={`tab-btn ${
      incomeTab.startsWith("term") ? "active" : ""
    }`}
    onClick={() => setShowTermDropdown(!showTermDropdown)}
  >
    Terms ▾
  </button>

  {showTermDropdown && (
    <div className="term-dropdown">
      <div onClick={() => { setIncomeTab("term1"); setShowTermDropdown(false); }}>
        Term 1
      </div>
      <div onClick={() => { setIncomeTab("term2"); setShowTermDropdown(false); }}>
        Term 2
      </div>
      <div onClick={() => { setIncomeTab("term3"); setShowTermDropdown(false); }}>
        Term 3
      </div>
    </div>
  )}
</div>
<button
  className={incomeTab === "tuition" ? "tab-btn active" : "tab-btn"}
  onClick={() => {
    setIncomeTab("tuition");
    setFeeCategory("Tuition");
  }}
>
  Tuition
</button>

<button
  className={incomeTab === "other" ? "tab-btn active" : "tab-btn"}
  onClick={() => {
    setIncomeTab("other");
    setFeeCategory("Other");
  }}
>
  Other
</button>

<button
  className={incomeTab === "expenseAnalysis" ? "tab-btn active" : "tab-btn"}
  onClick={() => setIncomeTab("expenseAnalysis")}
>
  Expense Analysis
</button>
</div>
{incomeTab === "expenseAnalysis" && (
  <div className="section-card pop">

    <h3 className="section-title">Competition Expense Analysis</h3>

    <table className="nice-table">
      <thead>
        <tr>
          <th>Class</th>
          <th>Competition Name</th>
          <th>Expense Name</th>
          <th>Income</th>
          <th>Expense</th>
          <th>Balance</th>
        </tr>
      </thead>

      <tbody>

        {competitionAnalysis.length === 0 && (
          <tr>
            <td colSpan="6" style={{ textAlign: "center" }}>
              No competition data
            </td>
          </tr>
        )}

        {competitionAnalysis.map((r, i) => (
          <tr key={i}>

            <td data-label="Class">{r.className}</td>

            <td data-label="Competition">{r.competitionName}</td>

            <td data-label="ExpenseName">{r.expenseName || "-"}</td>

            <td data-label="Income"style={{ color: "green" }}>
              ₹{r.income}
            </td>

            <td data-label="Expenses"style={{ color: "red" }}>
              ₹{r.expense}
            </td>

            <td data-label="Balance"style={{ 
              color: r.income - r.expense >= 0 ? "green" : "red" 
            }}>
              ₹{r.income - r.expense}
            </td>

          </tr>
        ))}

      </tbody>
    </table>

  </div>
)}

{(incomeTab === "tuition" || incomeTab === "other") && (

<div className="section-card pop">

  <div className="feesmaster-topbar">

  <h3 className="section-title">
    {feeCategory} Fees Collection Details
  </h3>

  <div className="student-dropdown">
    <input
      placeholder="Select Class"
      value={filterClass === "All" ? classSearchText : filterClass}
      onChange={(e) => {
        setClassSearchText(e.target.value);
        setFilterClass("All");
        setShowClassFilterDropdown(true);
      }}
      onFocus={() => setShowClassFilterDropdown(true)}
    />
    {showClassFilterDropdown && (
      <div className="student-dropdown-list">
        <div
          className="student-option"
          onClick={() => {
            setFilterClass("All");
            setClassSearchText("");
            setShowClassFilterDropdown(false);
          }}>
          All Classes
        </div>

        {classes.map(c => (
          <div
            key={c.id}
            className="student-option"
            onClick={() => {
              setFilterClass(c.name);
              setClassSearchText("");
              setShowClassFilterDropdown(false);
            }}
          >
            Class {c.name}
          </div>
        ))}
      </div>
    )}
  </div>
  
</div>  
<table className="nice-table">
<thead>
<tr>
  <th>Student</th>
  <th>Class</th>
  <th>Fee Name</th>
  <th>Paid</th>
  <th>Balance</th>
  <th>Status</th>
</tr>
</thead>
<tbody>
{students
  .filter(s =>
    s.studentName
      ?.toLowerCase()
      .includes(globalSearch.toLowerCase())
  )
  
  .map(student => (

    feesMaster
      .filter(fee =>
        fee.type === "fees" &&
        fee.feeType === feeCategory &&
        fee.className === student.class &&
        (filterClass === "All" || student.class === filterClass)
      )
      .map(fee => {

        const paid = getPaidAmount(student.id, fee.id);
const balance = getBalance(student.id, fee);

if (balance <= 0) return null;

let status = "Not Paid";

if (paid === 0 && balance > 0) {
  status = "Fully Not Paid";
}
else if (paid > 0 && balance > 0) {
  status = getPendingTerms(student.id, fee.id);
}
        
      
      return (
        <tr key={`${student.id}_${fee.id}`}>
          <td>{student.studentName}</td>
          <td>{student.class}</td>
          <td>{fee.name}</td>
          <td>₹{paid}</td>
          <td>₹{balance}</td>

          <td style={{
            color:
              status === "Full" ? "green" :
              status === "Partial" ? "orange" :
              "red"
          }}>
            {status}
          </td>
        </tr>
      );
    })
))}
</tbody>
</table>
</div>
)}
{showPendingPopup && (
  <div className="modal-backdrop">
    <div className="modal-box">
      <h3>Pending Payment</h3>
      <select
        value={pendingClass}
        onChange={e => {
          setPendingClass(e.target.value);
          setPendingFee(null);
        }}
      >
        <option value="">Select Class</option>
        {classes.map(c => (
  <option key={c} value={c}>
    Class {c}
  </option>
))}
      </select>
      <select
        value={pendingFee?.id || ""}
        disabled={!pendingClass}
        onChange={e => {
          const fee = feesMaster.find(f => f.id === e.target.value);
          setPendingFee(fee);
        }}
      >
        <option value="">Select Fees</option>
        {feesMaster
          .filter(f => f.type === "fees" && f.className === pendingClass)
          .map(f => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
        ))}
      </select>
      <div style={{ marginTop: 12 }}>
      <button
  onClick={() => {
    if (!pendingClass || !pendingFee) return;
    setReportPendingClass(pendingClass);
    setReportPendingFee(pendingFee);

    setShowPendingPopup(false);
  }}
>
  OK
</button>
        <button onClick={() => setShowPendingPopup(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{incomeTab === "pending" && pendingClass && pendingFee && (
  <div className="section-card pop ">
    <h3 className="section-title">
      Pending Balance – Class {pendingClass}
    </h3>
    <p>
      Fees: <b>{pendingFee.name}</b>
    </p>
    <table className="nice-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Paid</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {students
          .filter(s => s.class === pendingClass)
          .map(s => {
            const balance = getBalance(s.id, pendingFee);
            if (balance <= 0) return null;

            return (
              <tr key={s.id}>
                <td data-label="Student Name">{s.studentName}</td>
                <td data-label="Paid">₹{getPaidAmount(s.id, pendingFee.id)}</td>
                <td data-label="Balance"style={{ color: "red" }}>₹{balance}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
)}
{incomeTab === "new" &&  (
  <div className="section-card pop ">
              <h3 className="section-title">New Admission Payments</h3>
              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th >Student</th>
                      <th>Parent</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
.filter(i => i.isNew === true)
.filter(i =>
  i.studentName?.toLowerCase()
    .includes(globalSearch.toLowerCase())
)
                      .map(i => (
                        <tr key={i.id}>
                          <td data-label="Student">{i.studentName}</td>
                          <td data-label="Parent">{i.parentName}</td>
                          <td data-label="Class">{i.className}</td>
                          <td data-label="Paid">₹{i.paidAmount}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {incomeTab === "old" && (
  <div className="section-card pop">
<h3 className="section-title">Old Admission Payments</h3>
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
                      .filter(i => i.isNew === false)

                      .map(i => (
                        <tr key={i.id}>
                          <td data-label="Student">{i.studentName}</td>
                          <td data-label="Class">{i.className}</td>
                          <td data-label="Paid">₹{i.paidAmount}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
{incomeTab==="full"&&(
<div className="section-card pop"><h3 className="section-title">Full Payment Students</h3>
<div className="nice-table-wrapper"><table className="nice-table">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="full").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹0</td><td>{i.date}</td></tr>
))}</tbody>
</table></div></div>
)}
{incomeTab==="partial"&&(
<div className="section-card pop"><h3 className="section-title">Partial Payment Students</h3>
<div className="nice-table-wrapper"><table className="nice-table">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="partial").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div></div>
)}
{incomeTab==="term1"&&(
<div className="section-card pop"><h3 className="section-title">Term 1 Payments</h3>
<table className="nice-table">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{applyDateFilter(incomeList).filter(i=>i.paymentType==="term1").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}
{incomeTab==="term2"&&(
<div className="section-card pop"><h3 className="section-title">Term 1 Payments</h3>
<table className="nice-table">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="term2").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}
{incomeTab==="term3"&&(
<div className="section-card pop"><h3 className="section-title">Term 1 Payments</h3>
<table className="nice-table">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="term3").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}</>)}
      {mode==="expenses"&&(
<div className="section-card pop"><h3 className="section-title">Expenses Details</h3>
<div className="nice-table-wrapper"><table className="nice-table">
<thead><tr><th>Type</th><th>Name</th><th>Amount</th><th>Date</th></tr></thead>
<tbody>{expenseList
.filter(e =>
  e.name?.toLowerCase().includes(globalSearch.toLowerCase())
)
.map(e => (
<tr key={e.id}><td data-label="Type">{e.type}</td><td data-label="Name">{e.name}</td><td data-label="Amount">₹{e.amount}</td><td>{e.date}</td></tr>
))}</tbody>
</table>
</div></div>
)}</div>
  );
}
