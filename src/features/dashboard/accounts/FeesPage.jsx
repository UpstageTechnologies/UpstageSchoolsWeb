import React, { useEffect, useState } from "react";
import { collection, onSnapshot ,getDoc , doc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/History.css"
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { FaBible, FaFileInvoice } from "react-icons/fa";
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
const [sortField, setSortField] = useState(null);
const [sortDirection, setSortDirection] = useState("asc");
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 10;
const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  } else {
    setSortField(field);
    setSortDirection("asc");
  }
};

const getSortedData = (data) => {
  if (!sortField) return data;

  return [...data].sort((a, b) => {
    const aVal = a[sortField] ?? "";
    const bVal = b[sortField] ?? "";

    if (typeof aVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortDirection === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });
};
const paginate = (data) => {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
};
const [showPendingPopup, setShowPendingPopup] = useState(false);
const [tableSearch, setTableSearch] = useState("");
const tableFilter = (...fields) => {
  if (!tableSearch.trim()) return true;

  const search = tableSearch.toLowerCase();

  return fields.some(field =>
    field?.toString().toLowerCase().includes(search)
  );
};
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
// 🔍 Global Smart Search (Name + Class + Parent + PaymentType)
const matchesSearch = (...fields) => {
  const search = globalSearch?.toLowerCase().trim();
  if (!search) return true;

  return fields.some(field =>
    field?.toString().toLowerCase().includes(search)
  );
};
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
const getStatusInfo = (paid, balance, startDate, pendingLabel) => {

  const isMobile = window.innerWidth < 768;
  const getShortTitle = (label) => {

    if (!isMobile) return label;
  
    const text = (label || "").toLowerCase().trim();
  
    if (text === "fully not paid") return "FNP";
    if (text === "not paid") return "NP";
  
    if (text.includes("term2") && text.includes("term3")) {
      console.log("label value:", label);
      return "T2 & T3 NP";
    }
  
    if (text.includes("term3")) {
      return "T3 NP";
    }
  
    return label;
  };

  const title = getShortTitle(pendingLabel || "Fully Not Paid");
  const OVERDUE = isMobile ? "Od" : "Overdue";

  if (!startDate) {
    return {
      title,
      sub: "",
      color: "yellow"
    };
  }

  const today = new Date();
  const start = new Date(startDate);

  const diff = Math.floor((today - start) / 86400000);

  // Fully Paid
  if (balance <= 0) {
    return {
      title: "Paid",
      sub: "",
      color: "green"
    };
  }

  // Overdue
  if (diff > 0) {
    return {
      title,
      sub: `${OVERDUE} – ${diff}${isMobile ? "d" : " days"}`,
      color: "red"
    };
  }

  return {
    title,
    sub: "Recently Started",
    color: "orange"
  };
};
const competitionCards = competitionList.map((comp) => {

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

    getSortedData(
    incomeList
      .filter(i =>
        i.incomeType === "competition" &&
        i.competitionName?.trim().toLowerCase() ===
          selectedCompetition?.trim().toLowerCase()
      ))
      .map(i => i.className)
  )
];
const filteredNewPayments = getSortedData(
  incomeList
    .filter(i => i.isNew === true)
    .filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.parentName,
        i.date,
        i.paidAmount
      )
    )
);
const totalPages = Math.ceil(filteredNewPayments.length / rowsPerPage);
  return (
    <div className="income-wrapper">

 
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

    <table className="history-table">
  <thead>
    <tr>
    <th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("className")}>
  Class
  {sortField === "className" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("paymentType")}>
  Payment Type
  {sortField === "paymentType" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("balance")}>
  Balance
  {sortField === "balance" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>
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
      paginate(reportData).map(i => {
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
         <div className="history-filters">

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
  className={incomeTab === "expenseAnalysis" ? "tab-btn active" : "tab-btn"}
  onClick={() => setIncomeTab("expenseAnalysis")}
>
Competition
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

</div>
{incomeTab === "expenseAnalysis" && (
  <div className="section-card pop">

  <h3 className="section-title">Competitions</h3>

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
      getSortedData(
      incomeList
        .filter(i => i.date))
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

      <table className="history-table">
        <thead>
          <tr>
          <th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>
            <th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>

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
<td className="cell-list">
  {studentIncomeList.map((s,i)=>
    <div key={i} className="tag">{s}</div>
  )}
</td>

{/* Income Total */}
<td className="amount-income">
  ₹{totalIncome}
</td>

{/* Expense Name + Amount */}
<td className="cell-list">
  {Object.entries(expenseGrouped).map(([name, amt], i) => (
    <div key={i} className="tag-expense">
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
  <div className="table-header">

<h3 className="section-title">
  {feeCategory} Fees Collection Details
</h3>

<button
  className="report-btn"
  onClick={() => setShowReport(true)}
>
  <FaFileInvoice />
  <span className="report-text">Report</span>
</button>

</div>

<div style={{marginTop:"0px", marginBottom:"10px"}}>
<input
  type="text"
  placeholder="Search in table..."
  value={tableSearch}
  onChange={(e) => setTableSearch(e.target.value)}
  className="table-search"
/>
</div>
  
</div>  
<table className="history-table">
<thead><tr>
<th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>

<th onClick={() => handleSort("className")}>
  Class
  {sortField === "className" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>

<th onClick={() => handleSort("feeName")}>
  Fee Name
  {sortField === "feeName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>
<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("balance")}>
  Balance
  {sortField === "balance" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>

<th onClick={() => handleSort("status")}>
  Status
  {sortField === "status" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>
</tr>
</thead>
<tbody>

{
getSortedData(students
  .filter(s =>
    tableFilter(
      s.studentName,
      s.class
    )
  )
  
  ).map(student => (

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
  savedYear?.startDate,
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
        
        <div className="table-header">

<h3 className="section-title">
  New Admission Payments
</h3>

<button
  className="report-btn"
  onClick={() => setShowReport(true)}
>
  <FaFileInvoice />
  <span className="report-text">Report</span>
</button>

</div>

<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
/>
              <div className="nice-table2-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th onClick={()=>handleSort("studentName")} >Student
                      {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }</th><th onClick={()=>handleSort("parentName")}>
  Parent
  {sortField === "parentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>


<th onClick={()=>handleSort("className")}>
  Class
  {sortField === "className" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>

<th onClick={()=>handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>

<th onClick={()=>handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    
                  {
                    paginate(
                  getSortedData( incomeList
  .filter(i => i.isNew === true)
  .filter(i =>
    tableFilter(
      i.studentName,
      i.className,
      i.parentName,
      i.date,
      i.paidAmount)
))
                     ) .map(i => (
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
                <div className="pagination-bar">

<button
  className="tab-btn"
  disabled={currentPage === 1}
  onClick={() => setCurrentPage(currentPage - 1)}
>
Previous
</button>

{Array.from(
  { length: Math.ceil(
      incomeList.filter(i => i.isNew === true).length / rowsPerPage
    ) },
  (_, i) => (
    <button
      key={i}
      className={`tab-btn ${currentPage === i + 1 ? "active" : ""}`}
      onClick={() => setCurrentPage(i + 1)}
    >
      {i + 1}
    </button>
  )
)}

<button
  className="tab-btn"
  disabled={
    currentPage ===
    Math.ceil(
      incomeList.filter(i => i.isNew === true).length / rowsPerPage
    )
  }
  onClick={() => setCurrentPage(currentPage + 1)}
>
Next
</button>

</div>
              </div>
            </div>
          )}
          {incomeTab === "old" && (
  <div className="section-card pop">
<div className="table-header">

<h3 className="section-title">
  Old Admission Payments
</h3>

<button
  className="report-btn"
  onClick={() => setShowReport(true)}
>
  <FaFileInvoice />
  <span className="report-text">Report</span>
</button>

</div>

<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
/>
              <div className="nice-table-wrapper1">
                <table className="history-table">
                  <thead>
                    <tr>
                    <th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>
<th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>

<th onClick={()=>handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>
                      
<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>
                    </tr>
                  </thead>
                  <tbody>
                  {getSortedData(incomeList
  .filter(i => i.isNew === false)
  .filter(i =>
    tableFilter(
      i.studentName,
      i.className,
      i.parentName,
      i.date
    )
  )
                  )
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
<div className="section-card pop"><div className="table-header">

<h3 className="section-title">
  Full Payment Students
</h3>

<button
  className="report-btn"
  onClick={() => setShowReport(true)}
>
  <FaFileInvoice />
  <span className="report-text">Report</span>
</button>

</div>

<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
/>

<div className="nice-table-wrapper1">
<table className="history-table">
<thead><tr><th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th><th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>
<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th><th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th></tr></thead>
<tbody>{ getSortedData(incomeList
  .filter(i => i.paymentType === "full")
  .filter(i =>
    tableFilter(
      i.studentName,
      i.className,
      i.date,
      i.paidAmount
    )
  )
  ).map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div></div>
)}
{incomeTab==="partial"&&(
<div className="section-card pop"><div className="table-header">

  <h3 className="section-title">
    Partial Payment Students
  </h3>

  <button
    className="report-btn"
    onClick={() => setShowReport(true)}
  >
    <FaFileInvoice />
    <span className="report-text">Report</span>
  </button>

</div>

<input
  type="text"
  placeholder="Search in table..."
  value={tableSearch}
  onChange={(e) => setTableSearch(e.target.value)}
  className="table-search"
/>
<div className="nice-table-wrapper1"><table className="history-table">
<thead><tr><th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th><th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>
<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("balance")}>
  Balance
  {sortField === "balance" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th></tr></thead>
<tbody>{getSortedData(incomeList
  .filter(i => i.paymentType === "partial")
  .filter(i =>
    tableFilter(
      i.studentName,
      i.className,
      i.date,
      i.paidAmount
    )
  
  )).map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td  data-label="Balance">₹{getFeeBalance(i.studentId,i.feeId)}</td><td  data-label="Date">{i.date}</td></tr>
))}</tbody>
</table></div></div>
)}
{incomeTab==="term1"&&(
<div className="section-card pop"><h3 className="section-title">Term 1 Payments</h3>
<div className="table-header">
 
 <button style={{marginLeft:"30%"}}
className="report-btn"
onClick={() => setShowReport(true)}
>
<FaFileInvoice />
</button>
</div>
<div className="history-controls">
    <input
      type="text"
      placeholder="Search in table..."
      value={tableSearch}
      onChange={(e) => setTableSearch(e.target.value)}
      className="search-input"
    />
  </div>
<table className="history-table">
<thead><tr><th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th><th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>

<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("balance")}>
  Balance
  {sortField === "balance" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th></tr></thead>
<tbody>{getSortedData(applyDateFilter(incomeList)
  .filter(i => i.paymentType === "term1")
  .filter(i =>
    tableFilter(
      i.studentName,
      i.className,
      i.date,
      i.paidAmount
    )
  )).map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}
{incomeTab==="term2"&&(
<div className="section-card pop"><h3 className="section-title">Term 2 Payments</h3>
<div className="table-header">
 
 <button style={{marginLeft:"30%"}}
className="report-btn"
onClick={() => setShowReport(true)}
>
<FaFileInvoice />
</button>
</div>
<div className="history-controls">
    <input
      type="text"
      placeholder="Search in table..."
      value={tableSearch}
      onChange={(e) => setTableSearch(e.target.value)}
      className="search-input"
    />
  </div>
<table className="history-table">
<thead><tr><th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th><th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>
<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("balance")}>
  Balance
  {sortField === "balance" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th></tr></thead>
<tbody>{getSortedData(incomeList.filter(i=>i.paymentType==="term2")).map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}
{incomeTab==="term3"&&(
<div className="section-card pop"><h3 className="section-title">Term 3 Payments</h3>
<div className="table-header">
 
 <button style={{marginLeft:"30%"}}
className="report-btn"
onClick={() => setShowReport(true)}
>
<FaFileInvoice />
</button>
</div>
<div className="history-controls">
    <input
      type="text"
      placeholder="Search in table..."
      value={tableSearch}
      onChange={(e) => setTableSearch(e.target.value)}
      className="search-input"
    />
  </div><table className="history-table">
<thead><tr><th onClick={() => handleSort("studentName")}>
  Student
  {sortField === "studentName" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th><th onClick={() => handleSort("className")}>
  Class {sortField === "className" && (sortDirection === "asc" ? <FiChevronUp size={14}/> : <FiChevronDown size={14}/>)}
</th>
<th onClick={() => handleSort("paidAmount")}>
  Paid
  {sortField === "paidAmount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("balance")}>
  Balance
  {sortField === "balance" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th>

<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )}
</th></tr></thead>
<tbody>{getSortedData(incomeList.filter(i=>i.paymentType==="term3")).map(i=>(
<tr key={i.id}><td data-label="Student">{i.studentName}</td><td data-label="Class">{i.className}</td><td data-label="Paid">₹{i.paidAmount}</td><td>₹{getFeeBalance(i.studentId,i.feeId)}</td><td>{i.date}</td></tr>
))}</tbody>
</table></div>
)}</>)}
      {mode==="expenses"&&(
<div className="section-card pop"><h3 className="section-title">Expenses Details</h3>
<div className="table-header">
 
 <button style={{marginLeft:"30%"}}
className="report-btn"
onClick={() => setShowReport(true)}
>
<FaFileInvoice />
</button>
</div>
<div className="history-controls">
  <input
    type="text"
    placeholder="Search in table..."
    value={tableSearch}
    onChange={(e) => setTableSearch(e.target.value)}
    className="search-input"
  />
</div>
<div className="nice-table-wrapper1">
  <table className="history-table">
<thead><tr>
<th onClick={() => handleSort("type")}>
  Type
  {sortField === "type" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th><th onClick={() => handleSort("name")}>
  Name
  {sortField === "name" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>


<th onClick={() => handleSort("amount")}>
  Amount
  {sortField === "amount" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th>

<th onClick={() => handleSort("date")}>
  Date
  {sortField === "date" &&
    (sortDirection === "asc"
      ? <FiChevronUp size={14}/>
      : <FiChevronDown size={14}/>
    )
  }
</th></tr></thead>
<tbody>
{getSortedData(
  expenseList.filter(e =>
    tableFilter(
      e.name,
      e.type,
      e.amount,
      e.date
    )
  )
)
.map(e => (
<tr key={e.id}><td data-label="Type">{e.type}</td><td data-label="Name">{e.name}</td><td data-label="Amount">₹{e.amount}</td><td>{e.date}</td></tr>
))}</tbody>
</table>
</div></div>
)}</div>
  );
}