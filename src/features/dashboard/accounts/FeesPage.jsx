import React, { useEffect, useState , useRef} from "react";
import { collection, onSnapshot ,getDoc , doc ,query ,where } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/History.css";
import "../../dashboard_styles/ios.css";
import "../../../components/IntroPopup.css";
import ExpenseReport from "./ExpenseReport";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { FaBible, FaFileInvoice ,FaPrint } from "react-icons/fa";
import Report from "./Report";
export default function FeesPage({ adminUid, mode, setActivePage , globalSearch = ""}) {
const [incomeList, setIncomeList] = useState([]);
const [expenseList, setExpenseList] = useState([]);
const [showReport, setShowReport] = useState(false);
const [reportType, setReportType] = useState("month"); 
const [printMode, setPrintMode] = useState(false);
const [reportData, setReportData] = useState([]);
const [activeTable, setActiveTable] = useState(null)
const [loadingTable, setLoadingTable] = useState(false)
const [selectedFeeFilter, setSelectedFeeFilter] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [showTermDropdown, setShowTermDropdown] = useState(false);
const [feeCategory, setFeeCategory] = useState("Tuition");
const [filterClass, setFilterClass] = useState("All");
const [activeTab, setActiveTab] = useState("new")
const [loadingTab, setLoadingTab] = useState(false)
const [sortField, setSortField] = useState(null);
const [sortDirection, setSortDirection] = useState("asc");
const [currentPage, setCurrentPage] = useState(1);
const [reportSearch,setReportSearch]= useState("");
const [filterSearch,setFilterSearch] = useState("")
const [showFilterList,setShowFilterList] = useState(false)
const [incomeTab, setIncomeTab] = useState("new"); 
const [tableSearch, setTableSearch] = useState("");
const [allDates, setAllDates] = useState([]);
const [allDatesFull, setAllDatesFull] = useState([]);
const [currentPageIndexFull, setCurrentPageIndexFull] = useState(0);
const [currentPageIndexPartial, setCurrentPageIndexPartial] = useState(0);
const [allDatesPartial, setAllDatesPartial] = useState([]);
const currentDatePartial = allDatesPartial[currentPageIndexPartial] || "";
const [allDatesTerm1, setAllDatesTerm1] = useState([]);
const [currentPageIndexTerm1, setCurrentPageIndexTerm1] = useState(0);
const [term1TableData, setTerm1TableData] = useState([]);

const currentDateTerm1 = allDatesTerm1[currentPageIndexTerm1] || "";
const [allDatesTerm2, setAllDatesTerm2] = useState([]);
const [currentPageIndexTerm2, setCurrentPageIndexTerm2] = useState(0);
const [term2TableData, setTerm2TableData] = useState([]);

const currentDateTerm2 = allDatesTerm2[currentPageIndexTerm2] || "";
const [allDatesTerm3, setAllDatesTerm3] = useState([]);
const [currentPageIndexTerm3, setCurrentPageIndexTerm3] = useState(0);
const [term3TableData, setTerm3TableData] = useState([]);
const [allReportData, setAllReportData] = useState([]);
const currentDateTerm3 = allDatesTerm3[currentPageIndexTerm3] || "";

const isSkipped = localStorage.getItem("skipIntro") === "true";
const [showExpenseGuide, setShowExpenseGuide] = useState(!isSkipped);
const [showIncomeGuide, setShowIncomeGuide] = useState(!isSkipped);
useEffect(() => {
  const isSkipped = localStorage.getItem("skipIntro") === "true";

  if (isSkipped) {
    setShowExpenseGuide(false);
    setShowIncomeGuide(false);
  }
}, []);
const [visibleCount, setVisibleCount] = useState(20);
const handleScroll = () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 100
  ) {
    setVisibleCount(prev => prev + 20);
  }
};
useEffect(() => {
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
useEffect(() => {
  setVisibleCount(20);
}, [expenseList, reportData]); 
const currentDateFull = allDatesFull[currentPageIndexFull] || "";
const [tableData, setTableData] = useState([]);
const [oldTableData, setOldTableData] = useState([]);
const [currentPageIndex, setCurrentPageIndex] = useState(0);
const [fullTableData, setFullTableData] = useState([]);
const [partialTableData, setPartialTableData] = useState([]);
const currentDate = allDates[currentPageIndex] || "";
const dropdownRef = useRef(null);
useEffect(() => {

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowFilterList(false);
    }
  };
  
  document.addEventListener("mousedown", handleClickOutside);
  
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
  
  }, []);
const openTab = (tab) => {

  setLoadingTab(true)

  setTimeout(() => {
    setActiveTab(tab)
    setIncomeTab(tab)   // existing logic
    setLoadingTab(false)
  }, 100)

}
const tableFilter = (...fields) => {
  if (!tableSearch.trim()) return true;

  const search = tableSearch.toLowerCase();

  return fields.some(field =>
    field?.toString().toLowerCase().includes(search)
  );
};
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
const rowsPerPage =10;

useEffect(() => {

  if (!adminUid) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("isNew","==",true)
  );

  const unsub = onSnapshot(q, snap => {

    const dates = [
      ...new Set(
        snap.docs.map(d => d.data().date).filter(Boolean)
      )
    ].sort((a,b)=>b.localeCompare(a));

    setAllDates(dates);

  });

  return () => unsub();

}, [adminUid]);
useEffect(() => {

  if (!adminUid) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","full")
  );

  const unsub = onSnapshot(q, snap => {

    const dates = [
      ...new Set(
        snap.docs.map(d => d.data().date).filter(Boolean)
      )
    ].sort((a,b)=>b.localeCompare(a));

    setAllDatesFull(dates); 

  });

  return () => unsub();

}, [adminUid]);
useEffect(() => {

  if (!adminUid || !currentDate) return;
  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("isNew","==",true),
    where("date","==",currentDate)
  );

  const unsub = onSnapshot(q, snap => {

    setTableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid,currentDate]);

useEffect(() => {

  if (!adminUid || !currentDate) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("isNew","==",false),
    where("date","==",currentDate)
  );

  const unsub = onSnapshot(q, snap => {

    setOldTableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid,currentDate]);

useEffect(() => {

  if (!adminUid || !currentDateFull) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","full"),
    where("date","==",currentDateFull) 
  );

  const unsub = onSnapshot(q, snap => {

    setFullTableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid,currentDateFull]);
useEffect(() => {

  if (!adminUid) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","partial")
  );

  const unsub = onSnapshot(q, snap => {

    const dates = [
      ...new Set(
        snap.docs.map(d => d.data().date).filter(Boolean)
      )
    ].sort((a,b)=>b.localeCompare(a));

    setAllDatesPartial(dates);

  });

  return () => unsub();

}, [adminUid]);
useEffect(() => {

  if (!adminUid || !currentDatePartial) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","partial"),
    where("date","==",currentDatePartial)   // 🔥 IMPORTANT
  );

  const unsub = onSnapshot(q, snap => {

    setPartialTableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid, currentDatePartial]);
useEffect(() => {

  if (!adminUid) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","term1")
  );

  const unsub = onSnapshot(q, snap => {

    const dates = [
      ...new Set(
        snap.docs.map(d => d.data().date).filter(Boolean)
      )
    ].sort((a,b)=>b.localeCompare(a));

    setAllDatesTerm1(dates);

  });

  return () => unsub();

}, [adminUid]);
useEffect(() => {

  if (!adminUid || !currentDateTerm1) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","term1"),
    where("date","==",currentDateTerm1)
  );

  const unsub = onSnapshot(q, snap => {

    setTerm1TableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid, currentDateTerm1]);
const filteredTerm1Data = React.useMemo(() => {
  return getSortedData(
    term1TableData.filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.date,
        i.paidAmount
      )
    )
  );
}, [term1TableData, tableSearch, sortField, sortDirection]);

const totalTerm1Income = React.useMemo(() => {
  return filteredTerm1Data.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredTerm1Data]);
useEffect(() => {

  if (!adminUid) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","term2")
  );

  const unsub = onSnapshot(q, snap => {

    const dates = [
      ...new Set(
        snap.docs.map(d => d.data().date).filter(Boolean)
      )
    ].sort((a,b)=>b.localeCompare(a));

    setAllDatesTerm2(dates);

  });

  return () => unsub();

}, [adminUid]);
useEffect(() => {

  if (!adminUid || !currentDateTerm2) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","term2"),
    where("date","==",currentDateTerm2)
  );

  const unsub = onSnapshot(q, snap => {

    setTerm2TableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid, currentDateTerm2]);
const filteredTerm2Data = React.useMemo(() => {
  return getSortedData(
    term2TableData.filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.date,
        i.paidAmount
      )
    )
  );
}, [term2TableData, tableSearch, sortField, sortDirection]);
const totalTerm2Income = React.useMemo(() => {
  return filteredTerm2Data.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredTerm2Data]);
useEffect(() => {

  if (!adminUid) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","term3")
  );

  const unsub = onSnapshot(q, snap => {

    const dates = [
      ...new Set(
        snap.docs.map(d => d.data().date).filter(Boolean)
      )
    ].sort((a,b)=>b.localeCompare(a));

    setAllDatesTerm3(dates);

  });

  return () => unsub();

}, [adminUid]);
useEffect(() => {

  if (!adminUid || !currentDateTerm3) return;

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const q = query(
    incomeRef,
    where("paymentType","==","term3"),
    where("date","==",currentDateTerm3)
  );

  const unsub = onSnapshot(q, snap => {

    setTerm3TableData(
      snap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    );

  });

  return () => unsub();

}, [adminUid, currentDateTerm3]);
const filteredTerm3Data = React.useMemo(() => {
  return getSortedData(
    term3TableData.filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.date,
        i.paidAmount
      )
    )
  );
}, [term3TableData, tableSearch, sortField, sortDirection]);

const totalTerm3Income = React.useMemo(() => {
  return filteredTerm3Data.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredTerm3Data]);
const getGrandTotal = (type) => {
  return incomeList
    .filter(i => {
      if (type === "new") return i.isNew === true;
      if (type === "old") return i.isNew === false;
      if (type === "full") return i.paymentType === "full";
      if (type === "partial") return i.paymentType === "partial";
      if (type === "term1") return i.paymentType === "term1";
      if (type === "term2") return i.paymentType === "term2";
      if (type === "term3") return i.paymentType === "term3";
      return true;
    })
    .reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);
};
const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  } else {
    setSortField(field);
    setSortDirection("asc");
  }
};
function getSortedData(data) {

  if (!sortField) return data;

  return [...data].sort((a, b) => {

    const aVal =
      a[sortField] ??
      a.student?.[sortField] ??
      a.fee?.[sortField] ??
      "";

    const bVal =
      b[sortField] ??
      b.student?.[sortField] ??
      b.fee?.[sortField] ??
      "";

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc"
        ? aVal - bVal
        : bVal - aVal;
    }

    return sortDirection === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());

  });

}
const filteredTableData = React.useMemo(() => {

  return getSortedData(
    tableData.filter(i =>
      tableFilter(
        i.studentName,
        i.parentName,
        i.className,
        i.date,
        i.paidAmount
      )
    )
  );

}, [tableData, tableSearch, sortField, sortDirection]);
const totalIncome = React.useMemo(() => {
  return filteredTableData.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredTableData]);

const filteredOldData = React.useMemo(() => {

  return getSortedData(
    oldTableData.filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.parentName,
        i.date
      )
    )
  );

}, [oldTableData, tableSearch, sortField, sortDirection]);
const totalOldIncome = React.useMemo(() => {
  return filteredOldData.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredOldData]);
const filteredFullData = React.useMemo(() => {

  return getSortedData(
    fullTableData.filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.date,
        i.paidAmount
      )
    )
  );

}, [fullTableData, tableSearch, sortField, sortDirection]);
const filteredPartialData = React.useMemo(() => {
  return getSortedData(
    partialTableData.filter(i =>
      tableFilter(
        i.studentName,
        i.className,
        i.date,
        i.paidAmount
      )
    )
  );
}, [partialTableData, tableSearch, sortField, sortDirection]);

const totalFullIncome = React.useMemo(() => {
  return filteredFullData.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredFullData]);

const maxVisiblePages = 3;

const getVisiblePages = () => {

  let start = Math.max(
    0,
    currentPageIndex - Math.floor(maxVisiblePages/2)
  );

  let end = start + maxVisiblePages;

  if(end > allDates.length){
    end = allDates.length;
    start = Math.max(0,end-maxVisiblePages);
  }

  return Array.from({length:end-start},(_,i)=>start+i)

}
const paginate = (data) => {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
};
const totalPartialIncome = React.useMemo(() => {
  return filteredPartialData.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );
}, [filteredPartialData]);
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
useEffect(() => {

  if (!adminUid) return;

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

  // 🔥 important cleanup
  return () => unsubCompetition();

}, [adminUid]);

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

  if (!i.paymentType) {
    return "unknown";   // 🔥 IMPORTANT
  }

  return i.paymentType
    .toLowerCase()
    .replace(/\s+/g, "");
};
useEffect(() => {
  if (!adminUid) return;

  const reportRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Report"
  );

  const unsub = onSnapshot(reportRef, snap => {
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    console.log("🔥 REPORT FETCH:", data);

    setAllReportData(data); // 🔥 VERY IMPORTANT
  });

  return () => unsub();
}, [adminUid]);
const generateReport = () => {

  let data = [...allReportData];

  if (reportFilter !== "all") {

    if (reportFilter === "new") {
      data = data.filter(i => i.admissionType === "new");   // ✅ FIX
    }

    // ✅ OLD FIX
    else if (reportFilter === "old") {
      data = data.filter(i =>
        i.isNew === false || i.admissionType === "old"
      );
    }

    // ✅ OTHER FILTERS
    else {
      data = data.filter(i => {
        const payment = i.paymentType?.toLowerCase();
        const income = i.incomeType?.toLowerCase();

        return (
          payment === reportFilter.toLowerCase() ||
          income === reportFilter.toLowerCase()
        );
      });
    }
  }

  // ✅ DATE FILTER
  if (fromDate && toDate) {
    data = data.filter(i =>
      i.date >= fromDate && i.date <= toDate
    );
  }

  console.log("FILTERED DATA:", data);

  setReportData(data);
  setShowGeneratedReport(true);
};
const generateExpenseReport = () => {

  let data = [...expenseList]; // 🔥 use expenseList NOT report collection

  // ✅ TYPE FILTER
  if (reportFilter !== "all") {
    data = data.filter(i =>
      i.type?.toLowerCase() === reportFilter.toLowerCase()
    );
  }

  // ✅ DATE FILTER
  if (fromDate && toDate) {
    data = data.filter(i =>
      i.date >= fromDate && i.date <= toDate
    );
  }

  console.log("EXPENSE REPORT:", data);

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
  
  const [expenseTab, setExpenseTab] = useState("all");
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
  useEffect(() => {
    if (allDatesPartial.length > 0) {
      setCurrentPageIndexPartial(0);
    }
  }, [allDatesPartial]);
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
  const getFeePaid = (studentId, fee) => {

    if (!fee) return 0;   // 🔥 prevent crash
  
    const payments = incomeList.filter(i => {
  
      if (fee.feeType === "Tuition") {
        return i.studentId === studentId && i.feeType === "Tuition";
      }
  
      return i.studentId === studentId && i.feeId === fee.id;
  
    });
  
    return payments.reduce(
      (t, i) => t + Number(i.paidAmount || 0),
      0
    );
  };
  const getFeeBalance = (studentId, fee, feeId) => {

    const normalize = v => String(v).trim();
  
    const payments = incomeList.filter(i => {
  
      const sameStudent =
        normalize(i.studentId) === normalize(studentId);
  
      const sameFee =
        normalize(i.feeId) === normalize(fee?.id || feeId);
  
      const sameTuition =
        i.feeType === "Tuition" && fee?.feeType === "Tuition";
  
      return sameStudent && (sameFee || sameTuition);
  
    });
  
    console.log("payments:", payments);
    let total = fee
    ? fee.amount - (fee.amount * (fee.discount || 0)) / 100
    : 0;
  
  if (payments.length > 0) {
    const first = payments[0];
  
    if (first.payableAmount) {
      total = Number(first.payableAmount);
    }
  }
    const paid = payments.reduce(
      (t, p) => t + Number(p.paidAmount || 0),
      0
    );
  
    return Math.max(0, total - paid);
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

const totalPages = Math.ceil(filteredNewPayments.length / rowsPerPage);
const feeRows = React.useMemo(() => {
  console.log("feeCategory:", feeCategory);
  console.log("feesMaster:", feesMaster);
  console.log("incomeList:", incomeList);
  return students
    .filter(s =>
      tableFilter(
        s.studentName,
        s.class
      )
    )
    .flatMap(student => {
      const feesForClass = feesMaster.filter(fee =>
        fee.type === "fees" &&
        fee.feeType?.toLowerCase() === feeCategory.toLowerCase() &&
        String(fee.className).trim() === String(student.class).trim() &&
        (filterClass === "All" || student.class === filterClass)
      );

      let feesToShow = feesForClass;

      if (feeCategory === "Tuition" && feesForClass.length > 0) {
        feesToShow = [feesForClass[0]];
      }

      return feesToShow.map(fee => {

        const paid = getPaidAmount(student.id, fee.id);
        const balance = getBalance(student.id, fee);

        if (balance <= 0) return null;

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

        return {
          student,
          fee,
          paid,
          balance,
          statusInfo
        };

      }).filter(Boolean);

    });

}, [students, feesMaster, incomeList, feeCategory, filterClass, savedYear,tableSearch]);
const [currentPageTuition, setCurrentPageTuition] = useState(0);
const rowsPerPageTuition = 10;

const paginatedTuitionData = React.useMemo(() => {

  const sorted = getSortedData(feeRows);

  const start = currentPageTuition * rowsPerPageTuition;

  return sorted.slice(
    start,
    start + rowsPerPageTuition
  );

}, [feeRows, currentPageTuition, sortField, sortDirection]);
const totalTuitionIncome = React.useMemo(() => {
  return paginatedTuitionData.reduce(
    (sum, row) => sum + Number(row.paid || 0),
    0
  );
}, [paginatedTuitionData]);
const grandTotal = getGrandTotal(incomeTab);
const totalPagesTuition = Math.ceil(
  feeRows.length / rowsPerPageTuition
);
  return (
    <div className="income-wrapper">

      <h2 className="page-title">
        {mode === "income" ? "Income Details" : "Expenses Details"}
      </h2>
      {mode === "income" && showIncomeGuide && (
  <div className="guide-banner">
    <p>
      Manage all your school finances here.

      All the entries you add here will be safely stored and organized.
      Income entries will be tracked separately and used for calculations.

      Based on these entries, you can view reports, track performance,
      and understand your overall financial status.

      Check few entries and click <strong>Next</strong>.
    </p>

    <button
      className="finish-btn"
      onClick={() => {
        setShowIncomeGuide(false);
        setActivePage("expenses");
      }}
    >
      Next →
    </button>
  </div>
)}

{mode === "expenses" && showExpenseGuide && (
  <div className="guide-banner">
    <p>
      Track all your school expenses here.

      Expenses will be recorded separately such as salaries,
      competition costs, and other operational expenses.

      This helps you clearly understand where your money is spent
      and manage your school finances effectively.

      Review a few entries and click <strong>Next</strong>.
    </p>

    <button
  className="finish-btn"
  onClick={() => {
    setShowExpenseGuide(false);

    // 🔥 NEXT STEP (Account Creation popup)
    if (window.openIntroPopup) {
      window.openIntroPopup("account_creation");
    }
  }}
>
  Finish →
</button>
  </div>
)}
      {mode === "income" && (
        <>
         <div className="history-filters">

  <button
    className={incomeTab === "new" ? "tab-btn active" : "tab-btn"}
    onClick={() => openTab("new")}
  >
    New Admission
  </button>

  <button
    className={incomeTab === "old" ? "tab-btn active" : "tab-btn"}
    onClick={() => openTab("old")}
  >
    Old Admission
  </button>

  <button
    className={incomeTab === "full" ? "tab-btn active" : "tab-btn"}
    onClick={() => openTab("full")}
  >
    Full Payment
  </button>

  <button
    className={incomeTab === "partial" ? "tab-btn active" : "tab-btn"}
    onClick={() => openTab("partial")}
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
      <div onClick={() => { openTab("term1"); setShowTermDropdown(false); }}>
        Term 1
      </div>
      <div onClick={() => { openTab("term2"); setShowTermDropdown(false); }}>
        Term 2
      </div>
      <div onClick={() => { openTab("term3"); setShowTermDropdown(false); }}>
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
  onClick={() => openTab("expenseAnalysis")}
>
Competition
</button>
<button
  className={incomeTab === "other" ? "tab-btn active" : "tab-btn"}
  onClick={() => {
    openTab("other");
    setFeeCategory("Other");
  }}
>
  Other
</button>

<button
  className="report-btn"
  onClick={() => {
    console.log("MODE:", mode);
    setShowReport(true);
    setReportFilter("all");
    generateReport();
  
    if (mode === "income") {
      setIncomeTab("report");
    } else {
      setExpenseTab("report"); // 🔥 MUST
    }
  }}
>
  <FaFileInvoice />
  <span className="report-text">Report</span>
</button>

</div>
{incomeTab === "report" && (
  <Report
    reportFilter={reportFilter}
    setReportFilter={setReportFilter}
    filterSearch={filterSearch}
    setFilterSearch={setFilterSearch}
    showFilterList={showFilterList}
    setShowFilterList={setShowFilterList}
    fromDate={fromDate}
    setFromDate={setFromDate}
    toDate={toDate}
    setToDate={setToDate}
    generateReport={generateReport}
    setShowGeneratedReport={setShowGeneratedReport}
    setReportData={setReportData}
    showGeneratedReport={showGeneratedReport}
    reportData={reportData}
    handleSort={handleSort}
    sortField={sortField}
    sortDirection={sortDirection}
    paginate={paginate}
    getFeeBalance={getFeeBalance}
    dropdownRef={dropdownRef}
    allReportData={allReportData}   // 🔥 ADD THIS
  />
)}

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

  

<div className="history-controls">
  <div className="table-header">

<h3 className="section-title">
  {feeCategory} Fees Collection Details
</h3>


</div>
<input
  type="text"
  placeholder="Search in table..."
  value={tableSearch}
  onChange={(e) => setTableSearch(e.target.value)}
  className="table-search"
/>
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
</thead><tbody>

{paginatedTuitionData.length === 0 ? (

  <tr>
    <td colSpan="6" style={{ textAlign: "center" }}>
      No records
    </td>
  </tr>

) : (

  paginatedTuitionData.map(row => {

    const { student, fee, paid, balance, statusInfo } = row;

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

)}

{/* ✅ TOTAL ROW */}
<tr className="total-row">
  <td colSpan="3"><strong>TOTAL</strong></td>
  <td><strong>₹{totalTuitionIncome}</strong></td>
  <td colSpan="2"></td>
</tr>
<tr className="total-row" style={{ color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>

</tbody>
</table>
<div className="pagination-bar">
  <div className="tab-buttons">

    <button
      className="tab-btn"
      disabled={currentPageTuition === 0}
      onClick={() => setCurrentPageTuition(p => p - 1)}
    >
      ←
    </button>

    {Array.from({ length: totalPagesTuition }, (_, i) => (
      <button
        key={i}
        className={`tab-btn ${i === currentPageTuition ? "active" : ""}`}
        onClick={() => setCurrentPageTuition(i)}
      >
        {i + 1}
      </button>
    ))}

    <button
      className="tab-btn"
      disabled={currentPageTuition === totalPagesTuition - 1}
      onClick={() => setCurrentPageTuition(p => p + 1)}
    >
      →
    </button>

  </div>
</div>
</div>
)}

{incomeTab === "new" &&  (
  <div className="section-card pop ">
          <div className="history-controls">
        <div className="table-header">

<h3 className="section-title">
  New Admission Payments
</h3>
</div>
<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
/>  </div>
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
<>
{filteredTableData.length === 0 ? (

<tr>
<td colSpan="5" style={{textAlign:"center"}}>
No data found
</td>
</tr>


) : (
filteredTableData.map(i => (

<tr key={i.id}>
<td data-label="Student">{i.studentName}</td>
<td data-label="Parent">{i.parentName}</td>
<td data-label="Class">{i.className}</td>
<td data-label="Paid">₹{i.paidAmount}</td>
<td>{i.date}</td>
</tr>


))


)}
<tr className="total-row">
<td colSpan="3"><strong>TOTAL</strong></td>
<td><strong>₹{totalIncome}</strong></td>
<td></td>
</tr>
<tr className="total-row" style={{ color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>
</>
</tbody>
                </table>
                <div className="pagination-bar">
  <div className="tab-buttons">

<button
className="tab-btn"
disabled={currentPageIndex===0}
onClick={()=>setCurrentPageIndex(p=>p-1)}
>
←
</button>

{getVisiblePages().map(i=>(
<button
key={i}
className={`tab-btn ${i===currentPageIndex?"active":""}`}
onClick={()=>setCurrentPageIndex(i)}
>
{i+1}
</button>
))}

<button
className="tab-btn"
disabled={currentPageIndex===allDates.length-1}
onClick={()=>setCurrentPageIndex(p=>p+1)}
>
→
</button>

  </div>
</div>
              </div>
            </div>
          )}
          {incomeTab === "old" && (
            <div className="section-card pop">
      <div className="history-controls">
<div className="table-header">

<h3 className="section-title">
  Old Admission Payments
</h3>


</div>

<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
/></div>
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
<>
{filteredOldData.length === 0 ? (

<tr>
<td colSpan="4" style={{textAlign:"center"}}>
No records
</td>
</tr>

) : (

filteredOldData.map(i => (

<tr key={i.id}>
<td data-label="Student">{i.studentName}</td>
<td data-label="Class">{i.className}</td>
<td data-label="Paid">₹{i.paidAmount}</td>
<td>{i.date}</td>
</tr>

))

)}
<tr className="total-row">
    <td colSpan="2"><strong>TOTAL</strong></td>
    <td><strong>₹{totalOldIncome}</strong></td>
    <td></td>
  </tr>
  <tr className="total-row" style={{ color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>
</>
</tbody>
                </table>
                <div className="pagination-bar">
<div className="tab-buttons">

<button
className="tab-btn"
disabled={currentPageIndex === 0}
onClick={() => setCurrentPageIndex(p => p - 1)}
>
←
</button>

{allDates
.slice(
Math.max(0,currentPageIndex-1),
currentPageIndex+2
)
.map((date,i)=>{

const realIndex = allDates.indexOf(date)

return (

<button
key={date}
className={`tab-btn ${realIndex===currentPageIndex?"active":""}`}
onClick={()=>setCurrentPageIndex(realIndex)}
>
{realIndex+1}
</button>

)

})}

<button
className="tab-btn"
disabled={currentPageIndex === allDates.length-1}
onClick={() => setCurrentPageIndex(p => p + 1)}
>
→
</button>

</div>
</div>
              </div>
            </div>
          )}
{incomeTab==="full"&&(
  <div className="section-card pop">
      <div className="history-controls">
    <div className="table-header">

<h3 className="section-title">
  Full Payment Students
</h3>


</div>

<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
/>
</div>
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
<tbody>

{filteredFullData.map(i => (

<tr key={i.id}>
<td data-label="Student">{i.studentName}</td>
<td data-label="Class">{i.className}</td>
<td data-label="Paid">₹{i.paidAmount}</td>
<td>{i.date}</td>
</tr>

))}

{/* ✅ TOTAL ROW */}
<tr className="total-row">
  <td colSpan="2"><strong>TOTAL</strong></td>
  <td><strong>₹{totalFullIncome}</strong></td>
  <td></td>
</tr>
<tr className="total-row" style={{  color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>


</tbody>
</table>
<div className="pagination-bar">
<div className="tab-buttons">

<button
className="tab-btn"
disabled={currentPageIndexFull === 0}
onClick={() => setCurrentPageIndexFull(p => p - 1)}
>
←
</button>

{allDatesFull
.slice(
Math.max(0,currentPageIndexFull-1),
currentPageIndexFull+2
)
.map((date,i)=>{

const realIndex = allDatesFull.indexOf(date)

return (

<button
key={date}
className={`tab-btn ${realIndex===currentPageIndexFull?"active":""}`}
onClick={()=>setCurrentPageIndexFull(realIndex)}
>
{realIndex+1}
</button>

)

})}

<button
className="tab-btn"
disabled={currentPageIndexFull === allDatesFull.length-1}
onClick={() => setCurrentPageIndexFull(p => p + 1)}
>
→
</button>

</div>
</div></div></div>
)}
{incomeTab==="partial"&&(
  <div className="section-card pop">
    <div className="history-controls">
    <div className="table-header">

  <h3 className="section-title">
    Partial Payment Students
  </h3>


</div>

<input
  type="text"
  placeholder="Search in table..."
  value={tableSearch}
  onChange={(e) => setTableSearch(e.target.value)}
  className="table-search"
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
<tbody>

<>
{filteredPartialData.length === 0 ? (

<tr>
<td colSpan="5" style={{textAlign:"center"}}>
No records
</td>
</tr>

) : (

filteredPartialData.map(i => {

  const feeObj = feesMaster.find(
    f => String(f.id).trim() === String(i.feeId).trim()
  );

  const safeFee = feeObj || {
    id: i.feeId,
    amount: i.totalFees || i.payableAmount || 0,
    feeType: i.feeType
  };

  return (
    <tr key={i.id}>
      <td>{i.studentName}</td>
      <td>{i.className}</td>
      <td>₹{i.paidAmount}</td>
      <td>₹{getFeeBalance(i.studentId, safeFee, i.feeId)}</td>
      <td>{i.date}</td>
    </tr>
  );
})

)}

{/* ✅ TOTAL ROW */}
<tr className="total-row">
  <td colSpan="2"><strong>TOTAL</strong></td>
  <td><strong>₹{totalPartialIncome}</strong></td>
  <td colSpan="2"></td>
</tr>
<tr className="total-row" style={{color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>
</>

</tbody>
</table>
<div className="pagination-bar">
  <div className="tab-buttons">

    <button
      className="tab-btn"
      disabled={currentPageIndexPartial === 0}
      onClick={() => setCurrentPageIndexPartial(p => p - 1)}
    >
      ←
    </button>

    {allDatesPartial
      .slice(
        Math.max(0, currentPageIndexPartial - 1),
        currentPageIndexPartial + 2
      )
      .map((date, i) => {

        const realIndex = allDatesPartial.indexOf(date);

        return (
          <button
            key={date}
            className={`tab-btn ${realIndex === currentPageIndexPartial ? "active" : ""}`}
            onClick={() => setCurrentPageIndexPartial(realIndex)}
          >
            {realIndex + 1}
          </button>
        );
      })}

    <button
      className="tab-btn"
      disabled={currentPageIndexPartial === allDatesPartial.length - 1}
      onClick={() => setCurrentPageIndexPartial(p => p + 1)}
    >
      →
    </button>

  </div>
</div></div>
)}
{incomeTab==="term1"&&(
  <div className="section-card pop">  <div className="history-controls"><div className="table-header">

<h3 className="section-title">
  Term 1 Payments
</h3>


</div>

<input
type="text"
placeholder="Search in table..."
value={tableSearch}
onChange={(e) => setTableSearch(e.target.value)}
className="table-search"
style={{ marginTop: "18px", marginBottom: "20px" }}
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
<tbody>

{filteredTerm1Data.length === 0 ? (

  <tr>
    <td colSpan="5" style={{ textAlign: "center" }}>
      No records
    </td>
  </tr>

) : (

  filteredTerm1Data.map(i => {

    const feeObj = feesMaster.find(
      f => String(f.id).trim() === String(i.feeId).trim()
    );

    const safeFee = feeObj || {
      id: i.feeId,
      amount: i.totalFees || i.payableAmount || 0,
      feeType: i.feeType,
      discount: i.discount || 0
    };

    return (
      <tr key={i.id}>
        <td data-label="Student">{i.studentName}</td>
        <td data-label="Class">{i.className}</td>
        <td data-label="Paid">₹{i.paidAmount}</td>
        <td>₹{getFeeBalance(i.studentId, safeFee, i.feeId)}</td>
        <td>{i.date}</td>
      </tr>
    );

  })

)}

{/* ✅ TOTAL ROW */}
<tr className="total-row">
  <td colSpan="2"><strong>TOTAL</strong></td>
  <td><strong>₹{totalTerm1Income}</strong></td>
  <td colSpan="2"></td>
</tr>
<tr className="total-row" style={{  color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>

</tbody>
</table>
<div className="pagination-bar">
  <div className="tab-buttons">

    <button
      className="tab-btn"
      disabled={currentPageIndexTerm1 === 0}
      onClick={() => setCurrentPageIndexTerm1(p => p - 1)}
    >
      ←
    </button>

    {allDatesTerm1
      .slice(
        Math.max(0, currentPageIndexTerm1 - 1),
        currentPageIndexTerm1 + 2
      )
      .map((date) => {

        const realIndex = allDatesTerm1.indexOf(date);

        return (
          <button
            key={date}
            className={`tab-btn ${realIndex === currentPageIndexTerm1 ? "active" : ""}`}
            onClick={() => setCurrentPageIndexTerm1(realIndex)}
          >
            {realIndex + 1}
          </button>
        );
      })}

    <button
      className="tab-btn"
      disabled={currentPageIndexTerm1 === allDatesTerm1.length - 1}
      onClick={() => setCurrentPageIndexTerm1(p => p + 1)}
    >
      →
    </button>

  </div>
</div></div>
)}
  {incomeTab==="term2"&&(
    <div className="section-card pop"><div className="history-controls"><div className="table-header">

  <h3 className="section-title">
    Term 2 Payments
  </h3>


  </div>

  <input
  type="text"
  placeholder="Search in table..."
  value={tableSearch}
  onChange={(e) => setTableSearch(e.target.value)}
  className="table-search"
  style={{ marginTop: "18px", marginBottom: "20px" }}
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
  <tbody>

{filteredTerm2Data.length === 0 ? (

  <tr>
    <td colSpan="5" style={{ textAlign: "center" }}>
      No records
    </td>
  </tr>

) : (

  filteredTerm2Data.map(i => {

    const feeObj = feesMaster.find(
      f => String(f.id).trim() === String(i.feeId).trim()
    );

    const safeFee = feeObj || {
      id: i.feeId,
      amount: i.totalFees || i.payableAmount || 0,
      feeType: i.feeType,
      discount: i.discount || 0
    };

    return (
      <tr key={i.id}>
        <td>{i.studentName}</td>
        <td>{i.className}</td>
        <td>₹{i.paidAmount}</td>
        <td>₹{getFeeBalance(i.studentId, safeFee, i.feeId)}</td>
        <td>{i.date}</td>
      </tr>
    );

  })

)}

<tr className="total-row">
  <td colSpan="2"><strong>TOTAL</strong></td>
  <td><strong>₹{totalTerm2Income}</strong></td>
  <td colSpan="2"></td>
</tr>
<tr className="total-row" style={{  color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>

</tbody>
  </table><div className="pagination-bar">
  <div className="tab-buttons">

    <button
      className="tab-btn"
      disabled={currentPageIndexTerm2 === 0}
      onClick={() => setCurrentPageIndexTerm2(p => p - 1)}
    >
      ←
    </button>

    {allDatesTerm2
      .slice(
        Math.max(0, currentPageIndexTerm2 - 1),
        currentPageIndexTerm2 + 2
      )
      .map((date) => {

        const realIndex = allDatesTerm2.indexOf(date);

        return (
          <button
            key={date}
            className={`tab-btn ${realIndex === currentPageIndexTerm2 ? "active" : ""}`}
            onClick={() => setCurrentPageIndexTerm2(realIndex)}
          >
            {realIndex + 1}
          </button>
        );
      })}

    <button
      className="tab-btn"
      disabled={currentPageIndexTerm2 === allDatesTerm2.length - 1}
      onClick={() => setCurrentPageIndexTerm2(p => p + 1)}
    >
      →
    </button>

  </div>
</div></div>
  )}
{incomeTab==="term3"&&(
  <div className="section-card pop">

    <div className="history-controls">
      <div className="table-header">
        <h3 className="section-title">Term 3 Payments</h3>
      </div>

      <input
        type="text"
        placeholder="Search in table..."
        value={tableSearch}
        onChange={(e) => setTableSearch(e.target.value)}
        className="table-search"
      />
    </div>

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
            Class
          </th>

          <th onClick={() => handleSort("paidAmount")}>
            Paid
          </th>

          <th onClick={() => handleSort("balance")}>
            Balance
          </th>

          <th onClick={() => handleSort("date")}>
            Date
          </th>

        </tr>
      </thead>

      <tbody>

        {filteredTerm3Data.length === 0 ? (

          <tr>
            <td colSpan="5" style={{ textAlign: "center" }}>
              No records
            </td>
          </tr>

        ) : (

          filteredTerm3Data.map(i => {

            const feeObj = feesMaster.find(
              f => String(f.id).trim() === String(i.feeId).trim()
            );

            const safeFee = feeObj || {
              id: i.feeId,
              amount: i.totalFees || i.payableAmount || 0,
              feeType: i.feeType,
              discount: i.discount || 0
            };

            return (
              <tr key={i.id}>
                <td>{i.studentName}</td>
                <td>{i.className}</td>
                <td>₹{i.paidAmount}</td>
                <td>₹{getFeeBalance(i.studentId, safeFee, i.feeId)}</td>
                <td>{i.date}</td>
              </tr>
            );

          })

        )}

        {/* ✅ TOTAL */}
        <tr className="total-row">
          <td colSpan="2"><strong>TOTAL</strong></td>
          <td><strong>₹{totalTerm3Income}</strong></td>
          <td colSpan="2"></td>
        </tr>
        <tr className="total-row" style={{  color: "#fff" }}>
  <td colSpan="3"><strong>Grand Total</strong></td>
  <td><strong>₹{getGrandTotal(incomeTab)}</strong></td>
  <td></td>
</tr>

      </tbody>
    </table>

    {/* ✅ PAGINATION */}
    <div className="pagination-bar">
      <div className="tab-buttons">

        <button
          className="tab-btn"
          disabled={currentPageIndexTerm3 === 0}
          onClick={() => setCurrentPageIndexTerm3(p => p - 1)}
        >
          ←
        </button>

        {allDatesTerm3
          .slice(
            Math.max(0, currentPageIndexTerm3 - 1),
            currentPageIndexTerm3 + 2
          )
          .map((date) => {

            const realIndex = allDatesTerm3.indexOf(date);

            return (
              <button
                key={date}
                className={`tab-btn ${realIndex === currentPageIndexTerm3 ? "active" : ""}`}
                onClick={() => setCurrentPageIndexTerm3(realIndex)}
              >
                {realIndex + 1}
              </button>
            );
          })}

        <button
          className="tab-btn"
          disabled={currentPageIndexTerm3 === allDatesTerm3.length - 1}
          onClick={() => setCurrentPageIndexTerm3(p => p + 1)}
        >
          →
        </button>

      </div>
    </div>

  </div>
)}</>)}
      {mode==="expenses" && (
<>
  {/* FILTER BUTTONS */}
  <div className="history-filters">

    <button
      className={expenseTab === "all" ? "tab-btn active" : "tab-btn"}
      onClick={() => setExpenseTab("all")}
    >
      All
    </button>

    <button
      className={expenseTab === "salary" ? "tab-btn active" : "tab-btn"}
      onClick={() => setExpenseTab("salary")}
    >
      Salary
    </button>

    <button
      className={expenseTab === "competition" ? "tab-btn active" : "tab-btn"}
      onClick={() => setExpenseTab("competition")}
    >
      Competition
    </button>

    <button
      className={expenseTab === "others" ? "tab-btn active" : "tab-btn"}
      onClick={() => setExpenseTab("others")}
    >
      Other
    </button>

    <button
      className="report-btn"
      onClick={() => {
        setExpenseTab("report");
        setReportFilter("all");
        generateExpenseReport();
      }}
    >
      <FaFileInvoice />
      <span>Report</span>
    </button>
  </div>

  {/* 🔥 NORMAL TABLE (ONLY WHEN NOT REPORT) */}
  {expenseTab !== "report" && (
    <div className="section-card pop">

      <div className="history-controls">
        <div className="table-header">
          <h3 className="section-title">
            Expenses Details
          </h3>
        </div>

        <input
          type="text"
          placeholder="Search in table..."
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
          className="table-search"
          style={{ marginTop: "18px", marginBottom: "20px" }}
        />
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("type")}>Type</th>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("amount")}>Amount</th>
            <th onClick={() => handleSort("date")}>Date</th>
          </tr>
        </thead>

        <tbody>
          {getSortedData(
            expenseList
              .filter(e => {

                if (expenseTab === "all") return true;
                if (expenseTab === "salary") return e.type === "salary";
                if (expenseTab === "competition") return e.type === "student_misc";
                if (expenseTab === "others") return e.type === "others";

                return true;
              })
              .filter(e =>
                tableFilter(e.name, e.type, e.amount, e.date)
              )
          ).map(e => (
            <tr key={e.id}>
              <td>{e.type}</td>
              <td>{e.name}</td>
              <td>₹{e.amount}</td>
              <td>{e.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )}

  {/* 🔥 REPORT */}
  {expenseTab === "report" && (
    <ExpenseReport
      expenseList={expenseList}
      fromDate={fromDate}
      setFromDate={setFromDate}
      toDate={toDate}
      setToDate={setToDate}
      reportFilter={reportFilter}
      setReportFilter={setReportFilter}
      generateReport={generateExpenseReport}
      reportData={reportData}
      showGeneratedReport={showGeneratedReport}
      setShowGeneratedReport={setShowGeneratedReport}
      setReportData={setReportData}
      showFilterList={showFilterList}
      setShowFilterList={setShowFilterList}
      filterSearch={filterSearch}
      setFilterSearch={setFilterSearch}
      dropdownRef={dropdownRef}
    />
  )}

</>
)}</div>
  );
}