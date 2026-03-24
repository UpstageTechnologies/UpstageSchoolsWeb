import React, { useEffect, useState ,useMemo ,useCallback } from "react";
import { collection, onSnapshot, addDoc, updateDoc,  deleteDoc, doc ,getDoc ,query, where, getDocs,Timestamp} from "firebase/firestore";
  import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";
import { useNavigate } from "react-router-dom";
import OfficeStaff from "../OfficeStaff";
import TodaySummary from "./components/TodaySummary";
import EntriesTable from "./components/EntriesTable";
import IncomeSection from "./Income/IncomeSection";
import ExpenseSection from "./expense/ExpenseSection";
import BillPage from "./BillPage";
import "../../dashboard_styles/IE.css";
import {  FaArrowLeft, FaTrash } from "react-icons/fa";
export default function ProfitPage({adminUid,setActivePage,activePage = "",plan,trialAccess,trialExpiresAt,showUpgrade}) {
  const role = localStorage.getItem("role");
const isOfficeStaff = role === "office_staff";
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [incomeLoaded, setIncomeLoaded] = useState(false);
const [expenseLoaded, setExpenseLoaded] = useState(false);
const [showStudentDropdown, setShowStudentDropdown] = useState(false);
const [showClassDropdown, setShowClassDropdown] = useState(false);
const [showExpenseType, setShowExpenseType] = useState(false);
const [sourceList, setSourceList] = useState([]);
const [expenseListMaster, setExpenseListMaster] = useState([]);
const [openDropdown, setOpenDropdown] = useState(null);
const [sourceSearch, setSourceSearch] = useState("");
const [showSourceDD, setShowSourceDD] = useState(false);

const [expenseSearch, setExpenseSearch] = useState("");
const [showExpenseDD, setShowExpenseDD] = useState(false);
const [showSalaryRole, setShowSalaryRole] = useState(false);
const [showSalaryPosition, setShowSalaryPosition] = useState(false);
const [salaryRole, setSalaryRole] = useState("");          
const [salaryPosition, setSalaryPosition] = useState("");
const [selectedFees, setSelectedFees] = useState([]);
const [showFeesDropdown, setShowFeesDropdown] = useState(false);
const [newClassSearch, setNewClassSearch] = useState("");
const [showNewClassDropdown, setShowNewClassDropdown] = useState(false);
const [competitionName, setCompetitionName] = useState("");
const [competitionAmount, setCompetitionAmount] = useState("");
const [competitionList, setCompetitionList] = useState([]);
const [competitionSearch, setCompetitionSearch] = useState("");
const [showCompetitionDropdown, setShowCompetitionDropdown] = useState(false);
const [savedYear, setSavedYear] = useState(null);
const [paymentMode,setPaymentMode] = useState("");
const [showPaymentMode,setShowPaymentMode] = useState(false);
const [competitionClass, setCompetitionClass] = useState("");
const [competitionStudent, setCompetitionStudent] = useState("");
const [entryType, setEntryType] = useState("");
const [feesMaster, setFeesMaster] = useState([]);
const [showIncomeType, setShowIncomeType] = useState(false);
const [incomeType, setIncomeType] = useState("");
const [showMiscDropdown, setShowMiscDropdown] = useState(false);
const [miscSearch, setMiscSearch] = useState("");
const [miscName, setMiscName] = useState("");       // Sports Day
const [expenseSubName, setExpenseSubName] = useState(""); // Decoration
const [expenseNameSearch, setExpenseNameSearch] = useState("");
const [showExpenseNameDD, setShowExpenseNameDD] = useState(false);


const expenseNames = [
  ...new Set(
    expenseList
      .filter(e => e.type === "student_misc")
      .map(e => e.name)
  )
].filter(Boolean);
const miscNames = competitionList
  .map(c => c.name)
  .filter(Boolean);



const getSalaryFromInventory = (role, position, teacherName) => {
  return feesMaster.find(
    f =>
      f.type === "salary" &&
      f.category === role &&
      f.position === position &&
      f.name === teacherName
  );
};
const categories = [
  "Teaching Staff",
  "Non Teaching Staff"
];
const positions = {
  "Teaching Staff": ["Teacher"],
  "Non Teaching Staff": ["Helper", "ECA Staff"]
};
const [categorySearch, setCategorySearch] = useState("");
const [positionSearch, setPositionSearch] = useState("");
const [classes, setClasses] = useState([]);
useEffect(() => {
  if (entryType === "income") {
    setExpenseMode("");
    setShowExpenseType(false);
  }

  if (entryType === "expense") {
    setIncomeMode("");
    setStudentMode("");
    setShowIncomeType(false);
  }
}, [entryType]);
useEffect(() => {
  if (!adminUid) return;
  const ref = collection(db, "users", adminUid, "Classes");
  return onSnapshot(ref, snap => {
    setClasses(snap.docs.map(d => d.data().name));
  });
}, [adminUid]);

useEffect(() => {
  if (!adminUid) return;

  const ref = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Competition"
  );

  return onSnapshot(ref, snap => {
    setCompetitionList(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  });

}, [adminUid]);

const filteredCategories = categories.filter(c =>
  c.toLowerCase().includes(categorySearch.toLowerCase()));
const filteredPositions = (positions[salaryRole] || []).filter(p =>
  p.toLowerCase().includes(positionSearch.toLowerCase()));
const [newStudentSearch, setNewStudentSearch] = useState("");
const [showNewStudentDropdown, setShowNewStudentDropdown] = useState(false);
const [selectedNewStudent, setSelectedNewStudent] = useState(null);
const [showSalaryCategory, setShowSalaryCategory] = useState(false);
const [showSalaryPositionDD, setShowSalaryPositionDD] = useState(false);
const [teachers, setTeachers] = useState([]);
const [teacherSearch, setTeacherSearch] = useState("");
const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
const [staffSearch, setStaffSearch] = useState("");
const [showStaffDropdown, setShowStaffDropdown] = useState(false);
const getClassFees = (cls) => {
  if (!cls) return [];
  return feesMaster.filter(
    f =>
      f.type === "fees" &&
      String(f.className).trim() === String(cls).trim()
  );
};
useEffect(() => {
  if (!adminUid) return;

  const unsubSource = onSnapshot(sourceMasterRef, snap => {
    setSourceList(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  });

  const unsubExpense = onSnapshot(expenseMasterRef, snap => {
    setExpenseListMaster(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  });

  return () => {
    unsubSource();
    unsubExpense();
  };
}, [adminUid]);
useEffect(() => {
  if (!adminUid) return;

  const teachersRef = collection(db, "users", adminUid, "teachers");

  const unsub = onSnapshot(teachersRef, snap => {
    setTeachers(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  });

  return () => unsub();   // 🔥 very important
}, [adminUid]);
const [showStudentType, setShowStudentType] = useState(false);
const loaded = incomeLoaded && expenseLoaded;
  const [entryDate, setEntryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });
  const [incomeMode, setIncomeMode] = useState("");
  const [studentMode, setStudentMode] = useState("");
  const [showEntryType, setShowEntryType] = useState(false);
  const [srcName, setSrcName] = useState("");
  const [srcAmt, setSrcAmt] = useState("");
  const [students, setStudents] = useState([]);
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newPayType, setNewPayType] = useState("");
  const [newPayAmount, setNewPayAmount] = useState("");
  const [newTotal, setNewTotal] = useState(0);
  const historyRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "History"
  );
  
  const newAdmissionStudents = students.filter(s => {
    const paid = incomeList.some(i =>
      i.studentId === s.id && i.paymentStage === "Admission"
    );
  
    return (
      !paid &&
      s.studentName?.toLowerCase().includes(newStudentSearch.toLowerCase())
    );
  });
  const isFullPayment = newPayType === "full";
  const feeDiscountPercent = selectedFees[0]?.discount || 0;

  const discount =
    newPayType === "full"
      ? (selectedFees[0]?.amount || 0) * (feeDiscountPercent / 100)
      : 0;
  const [oldClass, setOldClass] = useState("");
  const [oldStudent, setOldStudent] = useState("");
  const [oldParent, setOldParent] = useState("");
  const [oldTotal, setOldTotal] = useState(0);
  const [oldPayType, setOldPayType] = useState("");
  const [oldPayAmount, setOldPayAmount] = useState("");
  const paymentTypes = ["Full", "Partial", "Monthly", "Term 1", "Term 2", "Term 3"];
const [paymentType, setPaymentType] = useState("");
const [paymentSearch, setPaymentSearch] = useState("");
const [showPaymentDD, setShowPaymentDD] = useState(false);


const classFees = feesMaster.filter(
  f => f.type === "fees" && f.className === (studentMode === "new" ? newClass : oldClass)
);
useEffect(() => {
  if (!newClass) return;
  const total = selectedFees.reduce((t,f)=>t+f.amount,0);
  setNewTotal(total);
}, [selectedFees, newClass]);

useEffect(() => {
  if (!oldClass) return;
  const total = selectedFees.reduce((t,f)=>t+f.amount,0);
  setOldTotal(total);
}, [selectedFees, oldClass]);


const filteredPaymentTypes = paymentTypes.filter(p =>
  p.toLowerCase().includes(paymentSearch.toLowerCase())
);
  const [expenseMode, setExpenseMode] = useState("");
  const [selName, setSelName] = useState(""); 
  const [manualSalary, setManualSalary] = useState("");
  const [exName, setExName] = useState("");
  const [exAmt, setExAmt] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");


const allDates = useMemo(() => {
  return [
    ...new Set([
      ...incomeList.map(i => i.date),
      ...expenseList.map(e => e.date)
    ])
  ].sort();
}, [incomeList, expenseList]);
  const getClassTotal = (cls) =>
  feesMaster.filter(f => f.className === cls)
    .reduce((t, f) => t + (f.amount || 0), 0);
const getStudentPaid = (studentId) =>
  incomeList
    .filter(i => i.studentId === studentId)
    .reduce((t, i) => t + (i.paidAmount || 0), 0);

const getStudentBalance = (studentId, className) => {
  const total = getClassTotal(className);
  const paid = getStudentPaid(studentId);
  return total - paid;
};

  const currentPageIndex = allDates.indexOf(entryDate);
  const totalPages = allDates.length;

  const maxVisiblePages = 3;

const getVisiblePages = () => {
  let start = Math.max(0, currentPageIndex - Math.floor(maxVisiblePages / 2));
  let end = start + maxVisiblePages;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(0, end - maxVisiblePages);
  }

  return allDates.slice(start, end).map((d, i) => start + i);
};


  const goToPage = (index) => {
    if (index < 0 || index >= totalPages) return;
    setEntryDate(allDates[index]);
  };
  
  const prevPage = () => goToPage(currentPageIndex - 1);
  const nextPage = () => goToPage(currentPageIndex + 1);
  
  
  const incomesRef  = collection(db,"users",adminUid,"Account","accounts","Income");
  const expensesRef = collection(db,"users",adminUid,"Account","accounts","Expenses");
  const sourceMasterRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Masters",

    "Main",
    "Sources"
  );
  
  const expenseMasterRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Masters",
    "Main",
    "ExpenseNames"
  );
  const studentsRef = collection(db, "users", adminUid, "students");
  const feesRef     = collection(db,"users",adminUid,"Account","accounts","FeesMaster");

  const studentsMainRef = collection(db, "users", adminUid, "students");
const parentsRef = collection(db, "users", adminUid, "parents");



const filteredTeachers = teachers
  .filter(t => t.category === "Teaching Staff")
  .filter(t =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredNonTeachingStaff = teachers
  .filter(
    t =>
      t.category === "Non Teaching Staff" &&
      t.nonTeachingRole === salaryPosition
  )
  .filter(t =>
    t.name?.toLowerCase().includes(staffSearch.toLowerCase())
  );

useEffect(() => {
  if (!adminUid) return;

  const unsubIncome = onSnapshot(incomesRef, s => {
    setIncomeList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    setIncomeLoaded(true);
  });

  const unsubExpense = onSnapshot(expensesRef, s => {
    setExpenseList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    setExpenseLoaded(true);
  });

  const unsubStudents = onSnapshot(studentsRef, s => {
    setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  const unsubFees = onSnapshot(feesRef, s => {
    setFeesMaster(s.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  return () => {
    unsubIncome();
    unsubExpense();
    unsubStudents();
    unsubFees();
  };
}, [adminUid]);
  const filteredStudents = students.filter(s =>
    String(s.class) === String(oldClass) &&
    s.studentName?.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const saveSourceIncome = async () => {
    if (!srcName || !srcAmt || !entryDate)
      return alert("Fill all source fields");
  
    try {
      await addDoc(incomesRef, {
        type: "source",
        name: srcName,              // 🔥 CHANGE HERE
        paidAmount: Number(srcAmt),
        paymentMode: paymentMode,
        date: entryDate,
        createdAt: new Date()
      });
  
      // 2️⃣ Save History
      await addDoc(historyRef, {
        entryType: "income",     // 🔥 IMPORTANT
        action: "ADD",
        module: "INCOME",
        name: srcName,
        amount: Number(srcAmt),
        paymentMode: paymentMode,   // 🔥 ADD
        date: entryDate,
        createdAt: new Date()
      });
  
      console.log("History saved successfully ✅");
  
      setSrcName("");
      setSrcAmt("");
  
    } catch (err) {
      console.error("History Save Error:", err);
      alert("Failed to save history");
    }
  };
  const competitionRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Competition"
  );
  
 
  
  const safeRequirePremium = (cb, type) => {
    if (!loaded && !isOfficeStaff) return;
  
    // Office staff → always allowed
    if (isOfficeStaff) {
      cb();
      return;
    }
  
    const now = new Date();
  
    const hasAccess =
      plan === "premium" ||
      plan === "lifetime" ||
      (
        plan === "basic" &&
        trialAccess === true &&
        trialExpiresAt &&
        trialExpiresAt.toDate() > now
      );
  
    if (!hasAccess) {
      showUpgrade();
      return;
    }
  
    // 🚫 Apply limits ONLY when BASIC & NO TRIAL
    if (
      plan === "basic" &&
      !(trialAccess && trialExpiresAt && trialExpiresAt.toDate() > now)
    ) {
      const incomeCount = incomeList.filter(i => i.date === entryDate).length;
      const expenseCount = expenseList.filter(e => e.date === entryDate).length;
  
      if (type === "income" && incomeCount >= 1) {
        showUpgrade();
        return;
      }
  
      if (type === "expense" && expenseCount >= 1) {
        showUpgrade();
        return;
      }
    }
  
    cb();
  };
  
  const alreadyPaidThisYear = (studentId, feeId) => {
    if (!savedYear) return false;
  
    const start = new Date(savedYear.startDate);
    const end = new Date(savedYear.endDate);
  
    return incomeList.some(i => {
      if (i.studentId !== studentId) return false;
      if (i.feeId !== feeId) return false;
  
      const paymentDate = new Date(i.date);
  
      return paymentDate >= start && paymentDate <= end;
    });
  };
  
  
  
  const saveNewAdmission = async () => {

  
    if (!newName || !newParent || !newClass || !newPayType || !entryDate)
      return alert("Fill all fields");
  
      const fee = selectedFees[0];
      
      if (!fee) return alert("Select fee");
const alreadyPaid = incomeList.some(
  i =>
    i.feeId === fee.id &&
    i.className === newClass &&
    i.paymentStage === "Admission" &&
    i.studentName.toLowerCase() === newName.toLowerCase()
);

if (alreadyPaid) {
  alert("Admission already paid for this fee");
  return;
}
      const total = fee.amount;
      const feeDiscountPercent = fee.discount || 0;
      const discountAmount =
        newPayType === "full"
          ? total * (feeDiscountPercent / 100)
          : 0;
      const payableAmount = total - discountAmount;
      let final = 0;
      if (newPayType === "full") {
        final = payableAmount;
      
      } else if (newPayType.startsWith("term")) {
        final = Number(newPayAmount);
      
      } else {
        if (!newPayAmount) return alert("Enter amount");
        final = Number(newPayAmount);
      }
      if (final > payableAmount) {
        alert("Cannot pay more than balance");
        return;
      }
      const balanceAfter = payableAmount - final;
      
  // 🔹 generate readable Parent ID
const generatedParentId = `P-${Date.now()}`;
    /* ================= CREATE PARENT ================= */
    const parentDocRef = await addDoc(
      collection(db, "users", adminUid, "parents"),
      {
        parentName: newParent,
        parentId: generatedParentId,
        studentsCount: 1,
        students: [],
        createdAt: new Date()
      }
    );
    
    const studentDocRef = await addDoc(
      collection(db, "users", adminUid, "students"),
      {
        studentName: newName,
        studentId: `S-${Date.now()}`,
        parentId: generatedParentId,   // ✅ MATCH WITH PARENT
        parentName: newParent,
        class: newClass,
        section: "",
        createdAt: new Date()
      }
    );
    
    // update parent student list
    await updateDoc(
      doc(db, "users", adminUid, "parents", parentDocRef.id),
      {
        students: [
          {
            studentDocId: studentDocRef.id,
            studentName: newName,
            class: newClass,
            section: ""
          }
        ]
      }
    );
    // 🔥 STUDENT CREATE HISTORY
await addDoc(
  collection(db, "users", adminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "STUDENT",
    name: newName,
    role: newClass,
    action: "CREATE",
    date: Timestamp.now(),
    createdAt: Timestamp.now(),
    originalData: {
      id: studentDocRef.id,
      studentName: newName,
      parentName: newParent,
      parentId: generatedParentId,
      class: newClass
    }
  }
);
    
    
  
    /* ================= UPDATE PARENT WITH STUDENT ================= */
    await updateDoc(
      doc(db, "users", adminUid, "parents", parentDocRef.id),
      {
        students: [
          {
            studentDocId: studentDocRef.id,
            studentName: newName,
            class: newClass,
            section: ""
          }
        ]
      }
    );
    await addDoc(incomesRef, {

      studentId: studentDocRef.id,
      studentName: newName,
      parentName: newParent,
      className: newClass,
    
      feeId: fee.id,
      feeName: fee.name,
    
      totalFees: total,
      discountApplied: discountAmount,
      payableAmount: payableAmount,
    
      paidAmount: final,
      balanceBefore: payableAmount,
      balanceAfter: balanceAfter,
    
      paymentType: newPayType.toLowerCase(),
      paymentMode: paymentMode,
    
      paymentStage: "Admission",
    
      isNew: true,
    
      academicYearId: savedYear?.id || null,
    
      date: entryDate || new Date().toISOString().slice(0,10),
    
      createdAt: new Date()
    
    });
    await addDoc(historyRef,{
      entryType: "income",
      action: "ADD",
      module: "FEES",
      name: newName + " (" + newClass + ")",
      amount: Number(final),
      date: entryDate,
      createdAt: new Date()
    });
    
 /* ================= RESET ================= */
    setNewName("");
    setNewParent("");
    setNewClass("");
    setNewPayType("");
    setNewPayAmount("");
    setNewTotal(0);
    setOldPayType("");
setOldPayAmount("");

  };
  const isFeePaidInCurrentYear = (studentId, feeId) => {
    if (!savedYear?.startDate || !savedYear?.endDate) return false;
  
    const start = new Date(savedYear.startDate);
    const end = new Date(savedYear.endDate);
  
    return incomeList.some(i => {
      if (i.studentId !== studentId) return false;
      if (i.feeId !== feeId) return false;
  
      const paymentDate = new Date(i.date);
      return paymentDate >= start && paymentDate <= end;
    });
  };
  const isTermAlreadyPaid = async (studentId, feeId, termType) => {
    if (!savedYear?.id) return false;  // 🔥 prevent crash
    const q = query(
      incomesRef,
      where("studentId", "==", studentId),
      where("feeId", "==", feeId),
      where("paymentType", "==", termType),
      where("academicYearId", "==", savedYear.id)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };
  /* ---------- INCOME: OLD ADMISSION ---------- */
  const selectOldClass = cls=>{
    setOldClass(cls);
    setOldStudent(""); setOldParent("");
    setOldTotal(getClassTotal(cls));
  };

  const selectOldStudent = id=>{
    setOldStudent(id);
    const s = students.find(x=>x.id===id);
    if(s) setOldParent(s.parentName||"");
  };

  const saveOldAdmission = async () => {

    
    const stu = students.find(s => s.id === oldStudent);
    if (!stu || !oldPayType || !entryDate) return alert("Fill all fields");
  
    const fee = selectedFees[0];
    if (oldPayType.startsWith("term")) {

      const alreadyPaid = await isTermAlreadyPaid(
        stu.id,
        fee.id,
        oldPayType
      );
    
      if (alreadyPaid) {
        alert("This term already paid for this academic year");
        return;
      }
    }
   
    
    if (!fee) return alert("Select a fee");
    
    const total = fee.amount;

    // 👇 get correct payable balance (includes discount)
    const balance = getFeeBalance(stu.id, fee);
    
    // 🚫 BLOCK if balance already 0
    if (balance <= 0) {
      alert("This fee is already fully paid for this student");
      return;
    }
    
    const paidSoFar = getFeePaid(stu.id, fee.id);
    
    
  
    let discount = 0;
    if (paidSoFar === 0 && oldPayType === "full") {
      discount = total * ((fee.discount || 0) / 100);
    }
    
    const payable = total - discount;

    const balanceBefore = payable - paidSoFar;

    let final = 0;
    // ===== MONTHLY PAYMENT =====
if (oldPayType === "monthly") {

  const existingPlan = getMonthlyPlan(stu.id, fee.id);

  // FIRST MONTH
  if (!existingPlan) {

    if (!oldPayAmount) {
      alert("Enter first month amount");
      return;
    }

    const monthlyAmount = Number(oldPayAmount);

    if (monthlyAmount <= 0) {
      alert("Invalid amount");
      return;
    }

    const monthsTotal = Math.ceil(total / monthlyAmount);

    final = monthlyAmount;

    var monthsPaid = 1;
    var monthsPending = monthsTotal - 1;
  }

  // NEXT MONTHS
  else {

    if (existingPlan.monthsPending <= 0) {
      alert("All months already paid");
      return;
    }

    final = existingPlan.monthlyAmount;

    var monthsTotal = existingPlan.monthsTotal;
    var monthsPaid = existingPlan.monthsPaid + 1;
    var monthsPending = existingPlan.monthsPending - 1;
  }
}

    const termPaidCount = getTermPaidCount(stu.id, fee.id);
    const fixedTermAmount = Math.ceil(payable / 3);

    if (oldPayType.startsWith("term")) {
      if (termPaidCount >= 3) {
        alert("All 3 terms already paid");
        return;
      }
    
      // 🔥 Term 3 → manual
      if (oldPayType === "term3") {
        if (!oldPayAmount) {
          alert("Enter Term 3 amount");
          return;
        }
        final = Number(oldPayAmount);
      } 
      else {
        final = fixedTermAmount;
      }
    }
    else if (oldPayType === "full") {
    
      final = balanceBefore;
    
    } else {
    
      if (!oldPayAmount) return alert("Enter amount");
      final = Number(oldPayAmount);
    }
    
  
    if (final > balanceBefore) {
      return alert("Cannot pay more than balance");
    }
   
    
    const balanceAfter = balanceBefore - final;    // 👈 correct
  
    await addDoc(incomesRef, {
      studentId: stu.id,
      studentName: stu.studentName,
      className: stu.class,
      isNew: false,

      feeId: selectedFees[0]?.id || null,
      feeType: selectedFees[0].feeType, 
feeName: selectedFees[0]?.name || "",
feeAmount: selectedFees[0]?.amount || 0,
      totalFees: total,
      discountApplied: discount,
      payableAmount: payable,
      paidAmount: final,
      balanceBefore,
      balanceAfter,
      paymentType: oldPayType,
      paymentMode:paymentMode,
      paymentStage: paidSoFar === 0 ? "Admission" : "Term",
      date: entryDate,
      createdAt: new Date()
    });
    await addDoc(historyRef,{
      entryType: "income",
      action: "ADD",
      module: "FEES",
      name: stu.studentName + " (" + stu.class + ")",
      amount: Number(final),
      date: entryDate,
      createdAt: new Date()
    });
    
  setSelectedFees([]); 
    setOldClass("");
    setOldStudent("");
    setOldParent("");
    setOldPayType("");
    setOldPayAmount("");
    setOldTotal(0);
    setPaymentType("");
setPaymentSearch("");
setShowPaymentDD(false);
  };
  const selectedDate = entryDate;   // 👈 whatever date user selected
  const { todayIncome, todayExpense, todayProfit } = useMemo(() => {
    const income = incomeList
      .filter(i => i.date === entryDate)
      .reduce((t, i) => t + Number(i.paidAmount || 0), 0);
  
    const expense = expenseList
      .filter(e => e.date === entryDate)
      .reduce((t, e) => t + Number(e.amount || 0), 0);
  
    return {
      todayIncome: income,
      todayExpense: expense,
      todayProfit: income - expense
    };
  }, [incomeList, expenseList, entryDate]);
  const saveExpense = useCallback(async ()=>{
    if(!exName||!exAmt||!entryDate) return alert("Fill expense");
    await addDoc(expensesRef,{
      type: expenseMode,
      name:exName,
      amount:Number(exAmt),
      date:entryDate,
      createdAt:new Date()
    });
    await addDoc(historyRef,{
      entryType: "expense",
      action:"ADD",
      module:"EXPENSE",
      name: exName,
      amount:Number(exAmt),
      date:entryDate,
      createdAt:new Date()
    });
    
    setExName(""); setExAmt("");
  },[exName, exAmt, entryDate]);
  const saveCompetitionIncome = async () => {
    if (
      !competitionClass ||
      !competitionStudent ||
      !competitionName ||
      !competitionAmount ||
      !entryDate
    ) {
      alert("Fill all competition fields");
      return;
    }
  
    // 1️⃣ Income
    await addDoc(incomesRef, {
      incomeType: "competition",
      className: competitionClass,
      studentName: competitionStudent,
      competitionName,
      paidAmount: Number(competitionAmount),
      paymentMode:paymentMode, 
      date: entryDate,
      createdAt: new Date()
    });
  
    // 2️⃣ History
    await addDoc(historyRef, {
      entryType: "income",
      action: "ADD",
      module: "COMPETITION",
      name: competitionName,
      amount: Number(competitionAmount),
      date: entryDate,
      createdAt: new Date()
    });
  
    // 3️⃣ Inventory (🔥 THIS WAS MISSING)
    const competitionsRef = collection(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      "Competition"
    );
  
    const isNewCompetition = !competitionList.some(
      c =>
        c.name &&
        c.name.toLowerCase() === competitionName.toLowerCase()
    );
  
    if (isNewCompetition) {
      await addDoc(competitionsRef, {
        name: competitionName,
        amount: Number(competitionAmount),
        createdAt: new Date()
      });
    }
  
    setCompetitionClass("");
    setCompetitionStudent("");
    setCompetitionName("");
    setCompetitionAmount("");
  };
  
/* ---------- EXPENSE: SALARY ---------- */
const saveSalary = async () => {

  if (!salaryRole || !salaryPosition || !selName || !manualSalary || !entryDate) {
    alert("Select category, position, name & date");
    return;
  }

  await addDoc(expensesRef, {
    type: "salary",
    role: salaryRole,
    position: salaryPosition,
    name: selName,
    amount: Number(manualSalary),
    paymentMode:paymentMode,
    date: entryDate,
    createdAt: new Date()
  });
  await addDoc(historyRef,{
    entryType: "expense",
    action:"ADD",
    module:"SALARY",
    name: selName,
    amount:Number(manualSalary),
    date:entryDate,
    createdAt:new Date()
  });
  
  // 🔄 RESET
  setSalaryRole("");
  setSalaryPosition("");
  setSelName("");
  setManualSalary("");
};

  
  
// how much paid for a specific fee
const getFeePaid = (studentId, feeId) =>
  incomeList
    .filter(i => i.studentId === studentId && i.feeId === feeId)
    .reduce((t, i) => t + Number(i.paidAmount || 0), 0);
    const getFeeBalance = (studentId, fee) => {

      if (!fee) return 0;
    
      const payments = incomeList.filter(i => {
    
        if (fee.feeType === "Tuition") {
          return i.studentId === studentId &&
                 (i.feeType === "Tuition" || i.feeName?.includes("Tuition"));
        }
    
        return i.studentId === studentId && i.feeId === fee.id;
    
      });
    
      if (!payments.length) return fee.amount;
    
      const paid = payments.reduce(
        (t,p)=> t + Number(p.paidAmount || 0),
        0
      );
    
      const payable = payments[0].payableAmount || fee.amount;
    
      return Math.max(0, payable - paid);
    };
const saveStudentMiscExpense = async () => {

  if (!miscName || !expenseSubName || !exAmt || !entryDate) {
    alert("Fill all fields");
    return;
  }

  await addDoc(expensesRef, {
    type: "student_misc",
    miscName: miscName,        // Competition / Sports Day
    name: expenseSubName,      // Decoration / Prize
    amount: Number(exAmt),
    className: competitionClass, 
    paymentMode:paymentMode,   // 🔥 add this  // or selected class
    date: entryDate,
    createdAt: new Date()
  });
  await addDoc(historyRef,{
    entryType: "expense",
    action:"ADD",
    module:"STUDENT_MISC",
    name: miscName + " - " + expenseSubName,
    amount:Number(exAmt),
    date:entryDate,
    createdAt:new Date()
  });
  
  setMiscName("");
  setExpenseSubName("");
  setExAmt("");
};

  /* ---------- FEE MASTER ---------- */
  const saveFee = async ()=>{
    if(!feeClass||!feeName||!feeAmount||!entryDate) return alert("Fill fields");

    await addDoc(feesRef,{
      className:feeClass,
      name:feeName,
      amount:Number(feeAmount),
      date:entryDate,
      createdAt:new Date()
    });

   
  };

  const totalIncome = incomeList.reduce((t,x)=>t+(x.paidAmount||0),0);
  const totalExpense= expenseList.reduce((t,x)=>t+(x.amount||0),0);
  const profit = totalIncome-totalExpense;
const getTermPaidCount = (studentId, feeId) =>

  incomeList.filter(
    i =>
      i.studentId === studentId &&
      i.feeId === feeId &&
      i.paymentStage === "Term"
  ).length;

  const getTermAmountUI = (studentId, fee) => {

    if (!fee) return 0;
  
    const total =
      fee.amount -
      fee.amount * ((fee.discount || 0) / 100);   // 🔥 discount applied
  
    const paid = getFeePaid(studentId, fee);
    const balance = total - paid;
  
    const termPaid = getTermPaidCount(studentId, fee.id);
  
    const oneTerm = Math.ceil(total / 3);
  
    if (termPaid === 0) return oneTerm;     // Term 1
    if (termPaid === 1) return oneTerm;     // Term 2
    return balance;                         // Term 3 (final remaining)
  };
  const getMonthlyPlan = (studentId, feeId) =>
  incomeList.find(
    i =>
      i.studentId === studentId &&
      i.feeId === feeId &&
      i.paymentType === "monthly" &&
      i.monthsTotal
  );
  const getNewTermAmount = (fee) => {
    if (!fee) return 0;
  
    const discount = fee.discount || fee.discountApplied || 0;
  
    const total =
      fee.amount -
      fee.amount * (discount / 100);
  
    return Math.round(total / 3);
  };
  useEffect(() => {
    if (!oldPayType.startsWith("term") || !selectedFees[0] || !oldStudent) return;
  
    const fee = selectedFees[0];
    const termAmt = getTermAmountUI(oldStudent, fee);
  
    setOldPayAmount(termAmt);
  }, [oldPayType, oldStudent, selectedFees]);
  
  useEffect(() => {
    if (!newPayType.startsWith("term") || !selectedFees[0]) return;
  
    const fee = selectedFees[0];
  
    const termAmt = Math.ceil(fee.amount / 3);
    setNewPayAmount(termAmt);
  
  }, [newPayType, selectedFees]);

  useEffect(() => {
    setTeacherSearch("");
    setStaffSearch("");
    setSelName("");
    setManualSalary("");
    setShowTeacherDropdown(false);
    setShowStaffDropdown(false);
  }, [salaryRole, salaryPosition]);
  
  
  useEffect(() => {
    if (isOfficeStaff) {
      setEntryType("income");   
      setIncomeMode("source"); 
    }
  }, [isOfficeStaff]);

  useEffect(() => {
    if (!adminUid) return;
  
    const yearRef = doc(
      db,
      "users",
      adminUid,
      "AcademicYear",
      "currentYear"
    );
  
    const unsubYear = onSnapshot(yearRef, snap => {
      if (snap.exists()) {
        setSavedYear({
          id: snap.id,
          ...snap.data()
        });
      }
    });
  
    return () => unsubYear();
  }, [adminUid]);
  const deleteEntry = async (row) => {
    if (!window.confirm("Delete this entry?")) return;
  
    let collectionName = "";
    let entryType = "";
  
    if (row.type === "income") {
      collectionName = "Income";
      entryType = "income";
    } 
    else if (row.type === "expense") {
      collectionName = "Expenses";
      entryType = "expense";
    } 
    else {
      return;
    }
  
    const docRef = doc(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      collectionName,
      row.id
    );
  
    const snap = await getDoc(docRef);
  
    if (!snap.exists()) {
      alert("Document not found");
      return;
    }
  
    const originalData = snap.data();
  
    await deleteDoc(docRef);
  
    await addDoc(historyRef, {
      entryType,
      action: "DELETE",
      module: collectionName,
      originalData: {
        id: row.id,   // 🔥 MUST ADD THIS
        ...originalData
      },
      name: originalData.studentName || originalData.name || "",
      amount: originalData.paidAmount || originalData.amount || 0,
      date: originalData.date || new Date(),
      createdAt: new Date()
    });
  
    alert("Deleted successfully ✅");
  };
  return (
    <>
    {activePage && activePage.startsWith("bill_") ? (
      <BillPage
        adminUid={adminUid}
        billStudentId={activePage.split("_")[1]}
        billDate={activePage.split("_")[2]}
        setActivePage={setActivePage}
      />
    ) : (
      <>
    
<h2 className="page-title">Accounts Dashboard</h2>
{!isOfficeStaff && (
  <TodaySummary
    todayIncome={todayIncome}
    todayExpense={todayExpense}
    todayProfit={todayProfit}
  />
)}
<div 
  className="section-card pop entries-card"
  style={{ marginTop: "40px" }}   // 👈 gap
>

  <h3 className="section-title">Entries</h3>
  <div className="entries-box">


        {/* ⭐ GLOBAL DATE */}
        <input
          type="date"
          value={entryDate}
          onChange={e=>setEntryDate(e.target.value)}
          style={{marginBottom:12}}
        />

        {/* ===== CHOOSE : Income / Expense ===== */}
<div className="popup-select">
  <div
    className="popup-input"
    onClick={() => setShowEntryType(!showEntryType)}
  >
    {entryType === "income"
      ? "Income"
      : entryType === "expense"
      ? "Expense"
      : "Choose"}
    <span>▾</span>
  </div>

  {showEntryType && (
    <div className="popup-menu">
      <div
        onClick={() => {
          setEntryType("income");
          setShowEntryType(false);
        }}
      >
        Income
      </div>

      <div
        onClick={() => {
          setEntryType("expense");
          setShowEntryType(false);
        }}
      >
        Expense
      </div>
      
    </div>
  )}
</div>



       {/* ================= INCOME ================= */}
       {entryType === "income" && (
  <IncomeSection
  adminUid={adminUid}   // 🔥 THIS LINE ADD
    incomeMode={incomeMode}
    openDropdown={openDropdown}
    setOpenDropdown={setOpenDropdown}
    studentMode={studentMode}
    incomeType={incomeType}
    showIncomeType={showIncomeType}
    setShowIncomeType={setShowIncomeType}
    setIncomeType={setIncomeType}
    setIncomeMode={setIncomeMode}
    setStudentMode={setStudentMode}
    showStudentType={showStudentType}
    setShowStudentType={setShowStudentType}

    saveSourceIncome={saveSourceIncome}
    saveNewAdmission={saveNewAdmission}
    saveOldAdmission={saveOldAdmission}
    saveCompetitionIncome={saveCompetitionIncome}
    safeRequirePremium={safeRequirePremium}

    srcName={srcName}
    setSrcName={setSrcName}
    srcAmt={srcAmt}
    setSrcAmt={setSrcAmt}
    sourceSearch={sourceSearch}
    setSourceSearch={setSourceSearch}
    sourceList={sourceList}
    showSourceDD={showSourceDD}
    setShowSourceDD={setShowSourceDD}

    newName={newName}
    setNewName={setNewName}
    newParent={newParent}
    setNewParent={setNewParent}
    newClass={newClass}
    setNewClass={setNewClass}
    newClassSearch={newClassSearch}
    setNewClassSearch={setNewClassSearch}
    showNewClassDropdown={showNewClassDropdown}
    setShowNewClassDropdown={setShowNewClassDropdown}
    

    selectedFees={selectedFees}
    setSelectedFees={setSelectedFees}
    showFeesDropdown={showFeesDropdown}
    setShowFeesDropdown={setShowFeesDropdown}

    paymentType={paymentType}
    setPaymentType={setPaymentType}
    paymentSearch={paymentSearch}
    setPaymentSearch={setPaymentSearch}
    showPaymentDD={showPaymentDD}
    setShowPaymentDD={setShowPaymentDD}
    filteredPaymentTypes={filteredPaymentTypes}

    newPayType={newPayType}
    setNewPayType={setNewPayType}
    newPayAmount={newPayAmount}
    setNewPayAmount={setNewPayAmount}
    discount={discount}
    isFullPayment={isFullPayment}

    oldClass={oldClass}
    setOldClass={setOldClass}
    oldStudent={oldStudent}
    setOldStudent={setOldStudent}
    oldParent={oldParent}
    setOldParent={setOldParent}
    oldPayType={oldPayType}
    setOldTotal={setOldTotal}
    setOldPayType={setOldPayType}
    oldPayAmount={oldPayAmount}
    setOldPayAmount={setOldPayAmount}
    selectedStudentName={selectedStudentName}
    setSelectedStudentName={setSelectedStudentName}
    studentSearch={studentSearch}
    setStudentSearch={setStudentSearch}
    filteredStudents={filteredStudents}

    competitionClass={competitionClass}
    setCompetitionClass={setCompetitionClass}
    competitionStudent={competitionStudent}
    setCompetitionStudent={setCompetitionStudent}
    competitionName={competitionName}
    setCompetitionName={setCompetitionName}
    competitionAmount={competitionAmount}
    setCompetitionAmount={setCompetitionAmount}
    competitionList={competitionList}
    competitionSearch={competitionSearch}
    setCompetitionSearch={setCompetitionSearch}
    showCompetitionDropdown={showCompetitionDropdown}
    setShowCompetitionDropdown={setShowCompetitionDropdown}
    showClassDropdown={showClassDropdown}
  setShowClassDropdown={setShowClassDropdown}
  showStudentDropdown={showStudentDropdown}
  setShowStudentDropdown={setShowStudentDropdown}
    classes={classes}
    students={students}
      paymentMode={paymentMode}
      setPaymentMode={setPaymentMode}
      showPaymentMode={showPaymentMode}
      setShowPaymentMode={setShowPaymentMode}
    getClassTotal={getClassTotal}
    getClassFees={getClassFees}
    getFeePaid={getFeePaid}
    getFeeBalance={getFeeBalance}
    getTermAmountUI={getTermAmountUI}
    getNewTermAmount={getNewTermAmount}
  />
)}
{entryType === "expense" && (
<ExpenseSection
  expenseMode={expenseMode}
  setExpenseMode={setExpenseMode}
  showExpenseType={showExpenseType}
  setShowExpenseType={setShowExpenseType}

  salaryRole={salaryRole}
  setSalaryRole={setSalaryRole}
  salaryPosition={salaryPosition}
  setSalaryPosition={setSalaryPosition}
  categorySearch={categorySearch}
  setCategorySearch={setCategorySearch}
  showSalaryCategory={showSalaryCategory}
  setShowSalaryCategory={setShowSalaryCategory}
  positionSearch={positionSearch}
  setPositionSearch={setPositionSearch}
  showSalaryPositionDD={showSalaryPositionDD}
  setShowSalaryPositionDD={setShowSalaryPositionDD}

  selName={selName}
  setSelName={setSelName}
  manualSalary={manualSalary}
  setManualSalary={setManualSalary}

  teacherSearch={teacherSearch}
  setTeacherSearch={setTeacherSearch}
  showTeacherDropdown={showTeacherDropdown}
  setShowTeacherDropdown={setShowTeacherDropdown}
  filteredTeachers={filteredTeachers}

  staffSearch={staffSearch}
  setStaffSearch={setStaffSearch}
  showStaffDropdown={showStaffDropdown}
  setShowStaffDropdown={setShowStaffDropdown}
  filteredNonTeachingStaff={filteredNonTeachingStaff}

  filteredCategories={filteredCategories}
  filteredPositions={filteredPositions}

  getSalaryFromInventory={getSalaryFromInventory}

  saveSalary={saveSalary}
  safeRequirePremium={safeRequirePremium}

  exName={exName}
  setExName={setExName}
  exAmt={exAmt}
  setExAmt={setExAmt}
  expenseSearch={expenseSearch}
  setExpenseSearch={setExpenseSearch}
  showExpenseDD={showExpenseDD}
  setShowExpenseDD={setShowExpenseDD}
  expenseListMaster={expenseListMaster}
  expenseMasterRef={expenseMasterRef}
  saveExpense={saveExpense}

  miscName={miscName}
  setMiscName={setMiscName}
  miscSearch={miscSearch}
  setMiscSearch={setMiscSearch}
  showMiscDropdown={showMiscDropdown}
  setShowMiscDropdown={setShowMiscDropdown}
  expenseSubName={expenseSubName}
  setExpenseSubName={setExpenseSubName}
  expenseNameSearch={expenseNameSearch}
  setExpenseNameSearch={setExpenseNameSearch}
  showExpenseNameDD={showExpenseNameDD}
  setShowExpenseNameDD={setShowExpenseNameDD}
  expenseNames={expenseNames}
  miscNames={miscNames}
  saveStudentMiscExpense={saveStudentMiscExpense}

  paymentMode={paymentMode}
setPaymentMode={setPaymentMode}
showPaymentMode={showPaymentMode}
setShowPaymentMode={setShowPaymentMode}
/>
)}
        {entryType==="fees" && (
          <div className="form-grid">
            <select value={feeClass} onChange={e => setFeeClass(e.target.value)}>
    <option value="">Class</option>

    {classes.map(c => (
      <option key={c} value={c}>
        {c}
      </option>
    ))}
  </select>

            <input placeholder="Fee Name" value={feeName} onChange={e=>setFeeName(e.target.value)} />
            <input type="number" placeholder="Amount" value={feeAmount} onChange={e=>setFeeAmount(e.target.value)} />
            <button onClick={() => safeRequirePremium(saveFee, "income")}>

Save Fee</button>
          </div>
        )} 

      </div>
      <EntriesTable
  incomeList={incomeList}
  expenseList={expenseList}
  entryDate={entryDate}
  isOfficeStaff={isOfficeStaff}
  deleteEntry={deleteEntry}
  setActivePage={setActivePage}
  currentPageIndex={currentPageIndex}
  totalPages={totalPages}
  prevPage={prevPage}
  nextPage={nextPage}
  getVisiblePages={getVisiblePages}
  goToPage={goToPage}

/>
        </div>
        </>
    )}
    {activePage === "balancePayment" && (
  <BalancePaymentPage
    adminUid={adminUid}
    setActivePage={setActivePage}
  />
)}  </>
  );
}
