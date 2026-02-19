import React, { useEffect, useState } from "react";
import { collection, onSnapshot ,getDoc , doc } from "firebase/firestore";
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
const [analysisClassFilter, setAnalysisClassFilter] = useState("All");
const [analysisClassSearch, setAnalysisClassSearch] = useState("");
const [showAnalysisClassDD, setShowAnalysisClassDD] = useState(false);
const currentYear = new Date().getFullYear().toString();

const [analysisYear, setAnalysisYear] = useState(currentYear);

const [savedYear, setSavedYear] = useState(null);
const [selectedCompetition, setSelectedCompetition] = useState(null);
const [competitionList, setCompetitionList] = useState([]);
const competitionRef = collection(
  db,
  "users",
  adminUid,
  "Account",
  "accounts",
  "Competition"
);

const unsubCompetition = onSnapshot(competitionRef, snap => {
  setCompetitionList(
    snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))
  );
});

const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);
const historyRef = collection(
  db,
  "users",
  adminUid,
  "Account",
  "accounts",
  "History"
);

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
  useEffect(() => {
    if (!adminUid) return;
  
    const loadAcademicYear = async () => {
      const ref = doc(
        db,
        "users",
        adminUid,
        "SchoolSettings",
        "academicYear"
      );
  
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        setSavedYear(snap.data());
      }
    };
  
    loadAcademicYear();
  }, [adminUid]);
  
  
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
const getStatusInfo = (paid, balance, endDate, pendingLabel) => {

  if (!endDate) {
    return {
      title: pendingLabel || "Fully Not Paid",
      sub: "",
      color: "red"
    };
  }

  const today = new Date();
  const due = new Date(endDate);
  const diff = Math.ceil((due - today) / 86400000);

  // FULLY PAID
  if (balance <= 0) {
    return {
      title: "Paid",
      sub: "On Time",
      color: "green"
    };
  }

  // 🔴 OVERDUE
  if (diff < 0) {
    return {
      title: pendingLabel || "Fully Not Paid",
      sub: `Overdue – ${Math.abs(diff)} days`,
      color: "red"
    };
  }

  // 🟠 NOT YET DUE
  return {
    title: pendingLabel || "Fully Not Paid",
    sub: `Due in ${diff} days`,
    color: "orange"
  };
};const competitionCards = competitionList.map((comp) => {

  const totalIncome = incomeList
    .filter(i =>
      i.incomeType === "competition" &&
      i.competitionName?.trim().toLowerCase() === comp.name?.trim().toLowerCase()
    )
    .reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);

  const totalExpense = expenseList
    .filter(e =>
      e.type === "student_misc" &&
      e.miscName?.trim().toLowerCase() === comp.name?.trim().toLowerCase()
    )
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return {
    competitionName: comp.name,
    totalIncome,
    totalExpense
  };
});
const competitionClasses = [
  ...new Set(
    incomeList
      .filter(i =>
        i.incomeType === "competition" &&
        i.competitionName?.trim().toLowerCase() ===
          selectedCompetition?.trim().toLowerCase()
      )
      .map(i => i.className)
  )
];

  return (
    <div className="accounts-wrapper fade-in">

  <div className="table-header">
 
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

    <table className="nice-table1">
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

  {/* ===== IF NO CARD SELECTED ===== */}
  {!selectedCompetition ? (

    <div className="class-grid">
      {competitionCards.map((comp, index) => (
  <div
  key={index}
  className={`class-card card-${index % 6}`}
  onClick={() => setSelectedCompetition(comp.competitionName)}
>
  <h3 className="card-title-main">
    {comp.competitionName}
  </h3>

  <div className="card-amounts">
    <p className="income-text">
      Income: ₹{comp.totalIncome.toLocaleString()}
    </p>

    <p className="expense-text">
      Expense: ₹{comp.totalExpense.toLocaleString()}
    </p>

    <p
      className={
        comp.totalIncome - comp.totalExpense >= 0
          ? "balance-text positive"
          : "balance-text negative"
      }
    >
      Balance: ₹{(comp.totalIncome - comp.totalExpense).toLocaleString()}
    </p>
  </div>

  <button className="button">
    View Details →
  </button>
</div>

))}


    </div>

  ) : (

    <>
      <button
        className="button"
        onClick={() => setSelectedCompetition(null)}
        style={{ marginBottom: 20 }}
      >
        ← Back
      </button>
      <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
    {/* YEAR DROPDOWN */}
<div className="student-dropdown" style={{ width: 150 }}>
  <select
    value={analysisYear}
    onChange={(e) => setAnalysisYear(e.target.value)}
    style={{ width: "100%", padding: "8px" }}
  >
    {[...new Set(
      incomeList
        .filter(i => i.date)
        .map(i => i.date.slice(0, 4))
    )]
      .sort((a, b) => b - a)   // latest year first
      .map(year => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
  </select>
</div>

{/* CLASS DROPDOWN */}
<div className="student-dropdown" style={{ width: 200 }}>
  <input
    placeholder="All Class"
    value={
      analysisClassFilter === "All"
        ? analysisClassSearch
        : analysisClassFilter
    }
    onChange={e => {
      setAnalysisClassSearch(e.target.value);
      setAnalysisClassFilter("All");
      setShowAnalysisClassDD(true);
    }}
    onFocus={() => setShowAnalysisClassDD(true)}
  />

  {showAnalysisClassDD && (
    <div className="student-dropdown-list">

      <div
        className="student-option"
        onClick={() => {
          setAnalysisClassFilter("All");
          setAnalysisClassSearch("");
          setShowAnalysisClassDD(false);
        }}
      >
        All Classes
      </div>

      {competitionClasses
        .filter(cls =>
          cls
            ?.toLowerCase()
            .includes(analysisClassSearch.toLowerCase())
        )
        .map(cls => (
          <div
            key={cls}
            className="student-option"
            onClick={() => {
              setAnalysisClassFilter(cls);
              setAnalysisClassSearch("");
              setShowAnalysisClassDD(false);
            }}
          >
            Class {cls}
          </div>
        ))}
    </div>
  )}
</div>

</div>

      <table className="nice-table1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Class</th>
            <th>Income Name</th>
            <th>Income</th>
            <th>Expense Name</th>
         
            <th>Expense</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
{competitionClasses
  .filter(cls =>
    analysisClassFilter === "All" ||
    cls === analysisClassFilter
  )
  .map((cls, index) => {

    // 🔹 Filter income by class
    const classIncome = incomeList.filter(i =>
      i.incomeType === "competition" &&
      i.competitionName?.trim().toLowerCase() === selectedCompetition?.trim().toLowerCase() &&
      i.date?.startsWith(analysisYear) &&
      i.className === cls
    );

    if (!classIncome.length) return null;

    // 🔹 Merge student names + amount
    const studentIncomeList = classIncome.map(i =>
      `${i.studentName} - ₹${i.paidAmount}`
    );

    const totalIncome = classIncome.reduce(
      (sum, i) => sum + Number(i.paidAmount || 0),
      0
    );

    // 🔹 Filter expenses
    const relatedExpenses = expenseList.filter(e =>
      e.type === "student_misc" &&
      e.miscName?.trim().toLowerCase() === selectedCompetition?.trim().toLowerCase()
    );

    // 🔹 Group expenses by name
    const expenseGrouped = {};
    relatedExpenses.forEach(e => {
      if (!expenseGrouped[e.name]) {
        expenseGrouped[e.name] = 0;
      }
      expenseGrouped[e.name] += Number(e.amount || 0);
    });

    const totalExpense = Object.values(expenseGrouped)
      .reduce((sum, amt) => sum + amt, 0);

    const balance = totalIncome - totalExpense;

    return (
      <tr key={index}>
        <td>{analysisYear}</td>
        <td>{cls}</td>

        {/* Income Names */}
        <td>
          {studentIncomeList.map((s, i) => (
            <div key={i}>{s}</div>
          ))}
        </td>

        {/* Income Total */}
        <td style={{ color: "green", fontWeight: 600 }}>
          ₹{totalIncome}
        </td>

        {/* Expense Name + Amount */}
        <td>
          {Object.entries(expenseGrouped).map(([name, amt], i) => (
            <div key={i}>
              {name} - ₹{amt}
            </div>
          ))}
        </td>

        {/* Expense Total */}
        <td style={{ fontWeight: 600 }}>
          ₹{totalExpense}
        </td>

        {/* Balance */}
        <td style={{
          fontWeight: 700,
          color: balance >= 0 ? "green" : "red"
        }}>
          ₹{balance}
        </td>
      </tr>
    );

  })}
</tbody>

      </table>
    </>
  )}

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
      placeholder="All Class"
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
<table className="nice-table1">
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
let pendingLabel = "";

if (paid === 0 && balance > 0) {
  pendingLabel = "Fully Not Paid";
}
else if (paid > 0 && balance > 0) {
  pendingLabel = getPendingTerms(student.id, fee.id);
}

const statusInfo = getStatusInfo(
  paid,
  balance,
  savedYear?.endDate,
  pendingLabel
);


      
      return (
        <tr key={`${student.id}_${fee.id}`}>
          <td data-label="StudentName">{student.studentName}</td>
          <td data-label="class">{student.class}</td>
          <td data-label="Feesname">{fee.name}</td>
          <td data-label="paid">₹{paid}</td>
          <td data-label="Balance">₹{balance}</td>

          <td>
  <div
    style={{
      fontWeight: 600,
      color: statusInfo.color
    }}
  >
    {statusInfo.title}
  </div>

  {/* 🔴 Overdue / Due in X days */}
  {statusInfo.sub && (
    <div
      style={{
        fontSize: 12,
        marginTop: 2,
        color: statusInfo.color
      }}
    >
      {statusInfo.sub}
    </div>
  )}

  {/* 📅 Due Date */}
  {statusInfo.dateText && (
    <div
      style={{
        fontSize: 11,
        marginTop: 2,
        color: "#9ca3af"
      }}
    >
      {statusInfo.dateText}
    </div>
  )}
</td>

        </tr>
      );
    })
))}
</tbody>
</table>
</div>
)}

{incomeTab === "new" &&  (
  <div className="section-card pop ">
              <h3 className="section-title">New Admission Payments</h3>
              <div className="nice-table1-wrapper">
                <table className="nice-table1">
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
              <div className="nice-table-wrapper1">
                <table className="nice-table1">
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

<div className="nice-table-wrapper1">
<table className="nice-table1">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="full").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div></div>
)}
{incomeTab==="partial"&&(
<div className="section-card pop"><h3 className="section-title">Partial Payment Students</h3>
<div className="nice-table-wrapper1"><table className="nice-table1">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="partial").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td  data-label="Balance">₹{getFeeBalance(i.studentId,i.feeId)}</td><td  data-label="Date">{i.date}</td></tr>
))}</tbody>
</table></div></div>
)}
{incomeTab==="term1"&&(
<div className="section-card pop"><h3 className="section-title">Term 1 Payments</h3>
<table className="nice-table1">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{applyDateFilter(incomeList).filter(i=>i.paymentType==="term1").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}
{incomeTab==="term2"&&(
<div className="section-card pop"><h3 className="section-title">Term 2 Payments</h3>
<table className="nice-table1">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="term2").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}
{incomeTab==="term3"&&(
<div className="section-card pop"><h3 className="section-title">Term 3 Payments</h3>
<table className="nice-table1">
<thead><tr><th>Name</th><th>Class</th><th>Paid</th><th>Balance</th><th>Date</th></tr></thead>
<tbody>{incomeList.filter(i=>i.paymentType==="term3").map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}</>)}
      {mode==="expenses"&&(
<div className="section-card pop"><h3 className="section-title">Expenses Details</h3>
<div className="nice-table-wrapper1">
  <table className="nice-table1">
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