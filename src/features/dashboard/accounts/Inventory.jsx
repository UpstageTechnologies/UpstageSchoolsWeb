import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot ,query,deleteDoc, doc, updateDoc ,getDoc} from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";
import "../../dashboard_styles/History.css"
import "../../dashboard_styles/IE.css";

import {  FaEdit, FaTrash} from "react-icons/fa";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
export default function Inventory({ adminUid, setActivePage, plan, showUpgrade }) {
  const [feesMaster, setFeesMaster] = useState([]);
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [showEntryType, setShowEntryType] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
const [staffMode, setStaffMode] = useState("");
const [officeStaffs, setOfficeStaffs] = useState([]);
const [staffCategories, setStaffCategories] = useState([]);
const [sortField, setSortField] = useState(null);
const [sortDirection, setSortDirection] = useState("asc");
const [newStaffName, setNewStaffName] = useState("");
const [newStaffPhone, setNewStaffPhone] = useState("");
const [showStaffType, setShowStaffType] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [competitionClassSearch, setCompetitionClassSearch] = useState("");
 
const [competitionList, setCompetitionList] = useState([]);
const [competitionSearch, setCompetitionSearch] = useState("");
const [showCompetitionDropdown, setShowCompetitionDropdown] = useState(false);

  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const [classes, setClasses] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
const [positionSearch, setPositionSearch] = useState("");
const [salaryCategory, setSalaryCategory] = useState("");
const [showCategory, setShowCategory] = useState(false);
const [showPosition, setShowPosition] = useState(false);
const [entrySearch, setEntrySearch] = useState("");
const [showEntryDropdown, setShowEntryDropdown] = useState(false);
const [incomeList, setIncomeList] = useState([]);
const [expenseList, setExpenseList] = useState([]);
const [feeType, setFeeType] = useState("");   // Tuition | Other
const [showFeeTypeDropdown, setShowFeeTypeDropdown] = useState(false);
const todayDate = new Date().toISOString().split("T")[0];
const feeTypeOptions = ["Tuition", "Other"];
const [selectedClass, setSelectedClass] = useState("all");
const [feesList, setFeesList] = useState([]);
const [editId, setEditId] = useState(null);
const [staffSearch, setStaffSearch] = useState("");
const [showStaffDropdown, setShowStaffDropdown] = useState(false);
const entryTypes = ["Fees", "Salary", "Competition"];
const [competitionName, setCompetitionName] = useState("");
const [competitionAmount, setCompetitionAmount] = useState("");
const [showCompetitionClassDD, setShowCompetitionClassDD] = useState(false);
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
      return sortDirection === "asc"
        ? aVal - bVal
        : bVal - aVal;
    }

    return sortDirection === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });
};
const handleSalarySubmit = () => {
  if (editId) {
    updateSalary();
  } else {
    saveFee();   // your salary save logic already inside saveFee()
  }
};
const historyRef = collection(
  db,
  "users",
  adminUid,
  "Account",
  "accounts",
  "History"
);

const filteredEntryTypes = entryTypes.filter(t =>
  t.toLowerCase().includes(entrySearch.toLowerCase())
);const [categories, setCategories] = useState([
  "Teaching Staff",
  "Non Teaching Staff"
]);

const [positions, setPositions] = useState({
  "Teaching Staff": ["Teacher"],
  "Non Teaching Staff": ["Helper", "ECA Staff"]
});
const filteredCategories = categories.filter(c =>
  c.toLowerCase().includes(categorySearch.toLowerCase()));
const filteredPositions = (positions[salaryCategory] || []).filter(p =>
  p.toLowerCase().includes(positionSearch.toLowerCase())
);
  const [entryType, setEntryType] = useState(""); // fees | salary
  const [activeSummary, setActiveSummary] = useState("fees");

  const [feeClass, setFeeClass] = useState("");
  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [discount, setDiscount] = useState("");
const [discountSearch, setDiscountSearch] = useState("");
const [showDiscountDropdown, setShowDiscountDropdown] = useState(false);
const [discountOptions, setDiscountOptions] = useState([ "0","5", "10","15", "20"]);
  const [salaryPosition, setSalaryPosition] = useState("");
  const feesRef = collection(db, "users", adminUid, "Account", "accounts", "FeesMaster");
  const teachersRef = collection(db, "users", adminUid, "teachers");
  useEffect(() => {
    if (!adminUid) return;
    const incomeRef = collection(db, "users", adminUid, "Account", "accounts", "Income");
    const expenseRef = collection(db, "users", adminUid, "Account", "accounts", "Expenses");
    const unsubIncome = onSnapshot(query(incomeRef), snap => {
      setIncomeList(snap.docs.map(d => d.data()));
    });
    const unsubExpense = onSnapshot(query(expenseRef), snap => {
      setExpenseList(snap.docs.map(d => d.data()));
    });
  
    const unsubFees = onSnapshot(query(feesRef), snap => {
      setFeesList(snap.docs.map(d => d.data()));
    });
  
    return () => {
      unsubIncome();
      unsubExpense();
      unsubFees();
    };
  }, [adminUid]);
  useEffect(() => {
    if (!adminUid) return;
  
    const ref = collection(db, "users", adminUid, "office_staffs");
  
    return onSnapshot(ref, snap => {
      setOfficeStaffs(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );      
    });
  
  }, [adminUid]);
  useEffect(() => {
    if (!adminUid) return;

    const unsub1 = onSnapshot(feesRef, snap => {
      setFeesMaster(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFeesLoaded(true);
    });

    const unsub2 = onSnapshot(teachersRef, snap => {
      setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [adminUid]);

  const filteredTeachers = teachers
  .filter(t => t.category === "Teaching Staff")
  .filter(t =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  );const saveCompetition = async () => {

    if (!competitionName.trim()) {
      alert("Enter competition name");
      return;
    }
  
    if (!competitionAmount || Number(competitionAmount) <= 0) {
      alert("Enter valid amount");
      return;
    }
  
    // prevent duplicate name
    const exists = competitionList.some(
      c =>
        c.name?.trim().toLowerCase() ===
        competitionName.trim().toLowerCase()
    );
  
    if (exists) {
      alert("Competition already exists");
      return;
    }
  
    await addDoc(
      collection(db,"users",adminUid,"Account","accounts","Competition"),
      {
        name: competitionName.trim(),
        amount: Number(competitionAmount),
        className: selectedClass || "all",
        createdAt: new Date()
      }
    );
  
    setCompetitionName("");
    setCompetitionAmount("");
  };
  
  
  const saveFee = async () => {
    if (!entryType || !feeAmount || (entryType==="fees" && !feeType))
    return alert("Fill all fields");

    if (entryType === "fees") {
      const finalFeeName =
      feeType === "Tuition"
        ? `Tuition ${discount || 0}%`
        : feeName;
      if (!feeClass || !feeName) return alert("Select class & fee name");

      await addDoc(feesRef, {
        type: "fees",
        feeType: feeType, 
        className: String(feeClass).trim(),
        name: finalFeeName,
        amount: Number(feeAmount),
        discount: Number(discount || 0),
        createdAt: new Date()
      });   
      await addDoc(historyRef,{
        entryType: "inventory",
        action: "ADD",
        module:"FEES_MASTER",
        name: feeName,
        amount:Number(feeAmount),
        date: todayDate,
        createdAt:new Date()
      });
      
         
    }
 

    if (entryType === "salary") {

      // ✅ OLD STAF
      if (staffMode === "old") {
        if (!salaryCategory || !salaryPosition || !selectedTeacher)
          return alert("Select staff");
    
        await addDoc(feesRef, {
          type: "salary",
          category: salaryCategory,
          position: salaryPosition,
          teacherId: selectedTeacher.id,
          name: selectedTeacher.name,
          amount: Number(feeAmount),
          createdAt: new Date()
        });
        await addDoc(historyRef,{
          entryType: "inventory",
          action:"ADD",
          module:"SALARY_MASTER",
          name: selectedTeacher.name,
          amount:Number(feeAmount),
          date: todayDate,
          createdAt:new Date()
        });
        
      }if (staffMode === "new") {
        if (!salaryCategory || !salaryPosition)
          return alert("Select category & position");
      
        if (!newStaffName || !newStaffPhone)
          return alert("Enter staff details");
      
    // if Teaching Staff
if (salaryCategory === "Teaching Staff") {
  await addDoc(
    collection(db, "users", adminUid, "teachers"),
    {
      name: newStaffName,
      phone: newStaffPhone,
      category: "Teaching Staff",
      createdAt: new Date()
    }
  );
}

// if Non Teaching Staff
if (salaryCategory === "Non Teaching Staff") {
  await addDoc(
    collection(db, "users", adminUid, "office_staffs"),
    {
      name: newStaffName,
      phone: newStaffPhone,
      department: "Office",
      role: salaryPosition,   // Helper / ECA Staff
      staffId: "OFF" + Date.now(),
      createdAt: new Date()
    }
  );
}
await addDoc(feesRef,{
  type:"salary",
  category: salaryCategory,
  position: salaryPosition,
  name: newStaffName,
  amount:Number(feeAmount),
  createdAt:new Date()
});
await addDoc(historyRef,{
  entryType: "inventory",
  action:"ADD",
  module:"SALARY_MASTER",
  name: newStaffName,
  amount:Number(feeAmount),
  date: todayDate,
  createdAt:new Date()
});

      }
    }
    
    setEntryType("");
setFeeClass("");
setClassSearch("");
setFeeName("");
setFeeAmount("");
setFeeType("");
setSalaryCategory("");
setCategorySearch("");
setSalaryPosition("");
setPositionSearch("");
setSelectedTeacher(null);
setTeacherSearch("");
setStaffMode("");
setNewStaffName("");
setNewStaffPhone("");

  };
  const changeEntryType = (type) => {
    setEntryType(type);
  
    setShowCategory(false);
    setShowPosition(false);
    setShowTeacherDropdown(false);
    setShowClassDropdown(false);
    setShowEntryDropdown(false);
  
    setCategorySearch("");
    setPositionSearch("");
    setTeacherSearch("");
    setClassSearch("");
    setEntrySearch("");
  };
  const feesData = feesMaster.filter(i => i.type === "fees");
  const salaryData = feesMaster.filter(i => i.type === "salary");
  const filteredCompetitionClasses = classes.filter(cls =>
    cls.toLowerCase().includes(
      competitionClassSearch.toLowerCase()
    )
  );
  const deleteFee = async (id) => {
    if (!window.confirm("Delete this item?")) return;
  
    const docRef = doc(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      "FeesMaster",
      id
    );
  
    // 🔥 Step 1: get original data
    const snap = await getDoc(docRef);
  
    if (!snap.exists()) {
      alert("Document not found");
      return;
    }
  
    const originalData = snap.data();
  
    // 🔥 Step 2: delete
    await deleteDoc(docRef);
  
    // 🔥 Step 3: save full backup
    await addDoc(historyRef, {
      entryType: "inventory",
      action: "DELETE",
      module: "FEES_MASTER",
      originalId: id,
      originalData: originalData,   // 🔥 IMPORTANT
      date: todayDate,
      createdAt: new Date()
    });
  };
  
  const startEdit = (item) => {
    setEditId(item.id);
    setFeeClass(item.className || "");
    setClassSearch("");      // 👈 this line important
    setFeeName(item.name || "");
    setFeeAmount(item.amount || "");
    setEntryType(item.type);
  };
  
  
  const classOrder = [
    "PreKG","LKG","UKG",
    "1","2","3","4","5","6","7","8","9","10","11","12"
  ];
  const filteredClasses = classes
  .sort((a, b) => classOrder.indexOf(a) - classOrder.indexOf(b))
  .filter(c =>
    c.toLowerCase().includes(classSearch.toLowerCase())
  );
  const sortedFees = [...feesData].sort(
    (a, b) =>
      classOrder.indexOf(a.className) -
      classOrder.indexOf(b.className)
  );
  
  const updateFee = async () => {
    if (!editId) return;
  
    if (!feeClass || !feeName || !feeAmount) {
      return alert("Fill all fields");
    }
  
    try {
      await updateDoc(
        doc(db, "users", adminUid, "Account", "accounts", "FeesMaster", editId),
        {
          className: String(feeClass).trim(),
          name: feeName,
          amount: Number(feeAmount),
          updatedAt: new Date()
        }
      );
  
      // reset form after update
      setEditId(null);
      setFeeClass("");
      setFeeName("");
      setFeeAmount("");
      setEntryType("");
  
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };
  const editSalary = (item) => {
    setEditId(item.id);
    setEntryType("salary");
  
    setSalaryCategory(item.category || "");
    setSalaryPosition(item.position || "");
    setFeeAmount(item.amount || "");
  
    setSelectedTeacher({
      id: item.teacherId,
      name: item.name
    });
  };
  const updateSalary = async () => {
    if (!editId) return;
  
    if (!salaryCategory || !salaryPosition || !selectedTeacher || !feeAmount) {
      return alert("Fill all salary fields");
    }
  
    try {
      await updateDoc(
        doc(db, "users", adminUid, "Account", "accounts", "FeesMaster", editId),
        {
          type: "salary",
          category: salaryCategory,
          position: salaryPosition,
          teacherId: selectedTeacher.id,
          name: selectedTeacher.name,
          amount: Number(feeAmount),
          updatedAt: new Date()
        }
      );
      resetSalaryForm();
    } catch (err) {
      console.error(err);
      alert("Salary update failed");
    }
  };
  const deleteCompetition = async (item) => {
    if (!window.confirm("Delete competition?")) return;
  
    const originalData = { ...item };
  
    await deleteDoc(
      doc(
        db,
        "users",
        adminUid,
        "Account",
        "accounts",
        "Competition",
        item.id
      )
    );
  
    await addDoc(historyRef, {
      entryType: "inventory",
      action: "DELETE",
      module: "COMPETITION",
      originalId: item.id,
      originalData: originalData,
      date: todayDate,
      createdAt: new Date()
    });
  };
  const deleteSalary = async (id) => {
    if (!window.confirm("Delete this salary entry?")) return;
  
    const docRef = doc(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      "FeesMaster",
      id
    );
  
    const snap = await getDoc(docRef);
  
    if (!snap.exists()) {
      alert("Not found");
      return;
    }
  
    const originalData = snap.data();
  
    await deleteDoc(docRef);
  
    await addDoc(historyRef, {
      entryType: "inventory",
      action: "DELETE",
      module: "SALARY_MASTER",
      originalId: id,
      originalData: originalData,
      date: todayDate,
      createdAt: new Date()
    });
  };
  const resetSalaryForm = () => {
    setEditId(null);
    setEntryType("");
  
    setSalaryCategory("");
    setSalaryPosition("");
    setSelectedTeacher(null);
    setFeeAmount("");
  
    setCategorySearch("");
    setPositionSearch("");
    setTeacherSearch("");
  };
  useEffect(() => {
    console.log("Teachers list:", teachers);
  }, [teachers]);
  
  useEffect(() => {
    console.log("salaryCategory:", salaryCategory);
    console.log("salaryPosition:", salaryPosition);
    console.log("teachers:", teachers);
  }, [salaryCategory, salaryPosition, teachers]);
  
  useEffect(() => {
    setSelectedTeacher(null);
    setTeacherSearch("");
    setStaffSearch("");
    setShowTeacherDropdown(false);
    setShowStaffDropdown(false);
  }, [salaryCategory, salaryPosition]);
  useEffect(() => {
    if (!adminUid) return;
  
    const ref = collection(db, "users", adminUid, "Classes");
  
    return onSnapshot(ref, snap => {
      setClasses(snap.docs.map(d => d.data().name));
    });
  
  }, [adminUid]);  
  const filteredNonTeachingStaff = officeStaffs
  .filter(s => s.role === salaryPosition)
  .filter(s =>
    s.name?.toLowerCase().includes(staffSearch.toLowerCase())
  );
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
  const filteredCompetitions = competitionList.filter(
    c =>
      c.name &&
      c.name.toLowerCase().includes(competitionSearch.toLowerCase())
  );
  
  return (
    <div className="accounts-wrapper fade-in">
      <h2 className="page-title">Inventory</h2>
      <div className="section-card entries-card">
        <h3 className="section-title">Add Item</h3>

        <div className="entries-box">


  <div className="student-dropdown">
    <input
      placeholder="Select Type"
      value={
        entryType
          ? entryType.charAt(0).toUpperCase() + entryType.slice(1)
          : entrySearch
       }

      onChange={e => {
        setEntrySearch(e.target.value);
        setEntryType("");
        setShowEntryDropdown(true);
      }}
      onFocus={() => setShowEntryDropdown(true)}
    />

    {showEntryDropdown && (
      <div className="student-dropdown-list">
        {filteredEntryTypes.map(type => (
          <div
            key={type}
            className="student-option"
            onClick={() => {
              changeEntryType(type.toLowerCase());
              setEntrySearch("");
              setShowEntryDropdown(false);
            }}
          >
            {type}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
{entryType === "fees" && (
  <div className="fees-grid">

    <div className="student-dropdown">
      <input
        placeholder="Select Class"
        value={feeClass || classSearch}
        onChange={e=>{
          setClassSearch(e.target.value);
          setFeeClass("");
          setShowClassDropdown(true);
        }}
        onFocus={()=>setShowClassDropdown(true)}
      />
      {showClassDropdown && (
        <div className="student-dropdown-list">
          {filteredClasses.map(cls=>(
            <div key={cls} className="student-option"
              onClick={()=>{
                setFeeClass(cls);
                setClassSearch("");
                setShowClassDropdown(false);
              }}>
              Class {cls}
            </div>
          ))}
        </div>
      )}
    </div>
    {/* Fee Type Dropdown */}
<div className="student-dropdown">
  <input
    placeholder="Select Fee Type"
    value={feeType}
    readOnly
    onClick={() => setShowFeeTypeDropdown(true)}
  />

  {showFeeTypeDropdown && (
    <div className="student-dropdown-list">
      {feeTypeOptions.map(type => (
        <div
          key={type}
          className="student-option"
          onClick={() => {
            setFeeType(type);
            setShowFeeTypeDropdown(false);
          
            if (type === "Tuition") {
              setFeeName("Tuition");   // auto fill
            } else {
              setFeeName("");          // allow user typing
            }
          }}
          
        >
          {type}
        </div>
      ))}
    </div>
  )}
</div>

{feeType !== "Tuition" && (
  <div className="student-dropdown">
    <input
      placeholder="Fee Name"
      value={feeName}
      onChange={e=>setFeeName(e.target.value)}
    />
  </div>
)}

<div className="student-dropdown">
  <input
    placeholder="Discount %"
    value={discount || discountSearch}
    onChange={e=>{
      setDiscountSearch(e.target.value);
      setDiscount("");
      setShowDiscountDropdown(true);
    }}
    onFocus={()=>setShowDiscountDropdown(true)}
  />

  {showDiscountDropdown && (
    <div className="student-dropdown-list">

      {discountOptions
        .filter(d =>
          d.includes(discountSearch)
        )
        .map(d => (
          <div
            key={d}
            className="student-option"
            onClick={()=>{
              setDiscount(d);
              setDiscountSearch("");
              setShowDiscountDropdown(false);
            }}
          >
            {d} %
          </div>
        ))}

      {discountSearch && (
        <div
          className="student-option"
          style={{color:"#2140df"}}
          onClick={()=>{
            setDiscountOptions([...discountOptions, discountSearch]);
            setDiscount(discountSearch);
            setDiscountSearch("");
            setShowDiscountDropdown(false);
          }}
        >
          ➕ Add "{discountSearch}%"
        </div>
      )}
    </div>
  )}
</div>
    <input
      type="number"
      placeholder="Amount"
      value={feeAmount}
      onChange={e=>setFeeAmount(e.target.value)}
    />

<button className="save-btn" onClick={editId ? updateFee : saveFee}>
  {editId ? "Update" : "Save"}
</button>


  </div>
)}{entryType === "competition" && (

  <div className="fees-grid">
{/* ===== CLASS DROPDOWN (FEES STYLE) ===== */}
<div className="student-dropdown" style={{ flex:1 }}>
  <input
    placeholder="All Class"
    value={
      selectedClass === "all"
        ? competitionClassSearch
        : selectedClass
    }
    onChange={e => {
      setCompetitionClassSearch(e.target.value);
      setSelectedClass("all");
      setShowCompetitionClassDD(true);
    }}
    onFocus={() => setShowCompetitionClassDD(true)}
  />

  {showCompetitionClassDD && (
    <div className="student-dropdown-list">

      {/* All Classes */}
      <div
        className="student-option"
        onClick={() => {
          setSelectedClass("all");
          setCompetitionClassSearch("");
          setShowCompetitionClassDD(false);
        }}
      >
        All Classes
      </div>

      {/* Class List */}
      {filteredCompetitionClasses.map(cls => (
        <div
          key={cls}
          className="student-option"
          onClick={() => {
            setSelectedClass(cls);
            setCompetitionClassSearch("");
            setShowCompetitionClassDD(false);
          }}
        >
          Class {cls}
        </div>
      ))}

    </div>
  )}
</div>
<div className="student-dropdown" style={{ flex: 2 }}>
  <input
    placeholder="Competition Name"
    value={competitionName}
    onChange={e => {
      setCompetitionName(e.target.value);
      setCompetitionSearch(e.target.value);
      setShowCompetitionDropdown(true);
    }}
    onFocus={() => setShowCompetitionDropdown(true)}
  />

  {showCompetitionDropdown && (
    <div className="student-dropdown-list">

{filteredCompetitions.map(c => (
  <div
    key={c.id}
    className="student-option"
    onClick={() => {
      setCompetitionName(c.name);
      setCompetitionAmount(c.amount);
      setShowCompetitionDropdown(false);
    }}
  >
    {c.name} – ₹{c.amount}
  </div>
))}


      {/* ➕ Add new competition */}
      {competitionSearch &&
  !competitionList.some(
    c => c.name.toLowerCase() === competitionSearch.toLowerCase()
  ) && (
    <div  
      className="student-option"
      style={{ color: "#2563eb" }}
      onClick={() => {
        setCompetitionName(competitionSearch.trim());
        setCompetitionAmount("");
        setShowCompetitionDropdown(false);
      }}
      
    >
      ➕ Add "{competitionSearch}"
    </div>
)}

    </div>
  )}
</div>

{/* ===== AMOUNT ===== */}
<input
  style={{ flex:1 }}
  type="number"
  placeholder="Amount"
  value={competitionAmount}
  onChange={e => setCompetitionAmount(e.target.value)}
/>

<button className="save-btn" onClick={saveCompetition}>
  Save
</button>

</div>
)}


{entryType === "salary" && (
  
  <div className="salary-grid">
    {/* Staff Type */}
<div className="student-dropdown">
  <input
    placeholder="Staff Type"
    value={
      staffMode === "new"
        ? "New Staff"
        : staffMode === "old"
        ? "Old Staff"
        : ""
    }
    readOnly
    onClick={() => setShowStaffType(true)}
  />

  {showStaffType && (
    <div className="student-dropdown-list">
      <div
        className="student-option"
        onClick={() => {
          setStaffMode("new");
          setShowStaffType(false);
        }}
      >
        New Staff
      </div>

      <div
        className="student-option"
        onClick={() => {
          setStaffMode("old");
          setShowStaffType(false);
        }}
      >
        Old Staff
      </div>
    </div>
  )}
</div>
{/* ✅ NEW STAFF INPUTS */}
{staffMode === "new" && (
  <>
    {staffMode === "new" && (
  <>
    {/* 🔽 Staff Name Dropdown */}
    <div className="student-dropdown">

      <input
        placeholder="Staff Name"
        value={newStaffName || staffSearch}
        onChange={e => {
          setStaffSearch(e.target.value);
          setNewStaffName("");
          setShowStaffDropdown(true);
        }}
        onFocus={() => setShowStaffDropdown(true)}
      />

      {showStaffDropdown && (
        <div className="student-dropdown-list">
          {/* ➕ Add New Staff */}
          {staffSearch &&
            !(salaryCategory === "Teaching Staff"
              ? teachers
              : officeStaffs
            ).some(
              s =>
                s.name?.toLowerCase() ===
                staffSearch.toLowerCase()
            ) && (
              <div
                className="student-option"
                style={{ color: "#2563eb", fontWeight: 600 }}
                onClick={() => {
                  setNewStaffName(staffSearch.trim());
                  setStaffSearch("");
                  setShowStaffDropdown(false);
                }}
              >
                ➕ Add "{staffSearch}"
              </div>
            )}
        </div>
      )}
    </div>
  </>
)}
    <input
      placeholder="Phone Number"
      value={newStaffPhone}
      onChange={e => setNewStaffPhone(e.target.value)}
    />
  </>
)}
    <div className="student-dropdown">
      <input
        placeholder="Select Category"
        value={salaryCategory || categorySearch}
        onChange={e=>{
          setCategorySearch(e.target.value);
          setSalaryCategory("");
          setShowCategory(true);
        }}
        onFocus={()=>setShowCategory(true)}
      />
     {showCategory && (
  <div className="student-dropdown-list">

    {filteredCategories.map(cat => (
      <div
        key={cat}
        className="student-option"
        onClick={()=>{
          setSalaryCategory(cat);
          setCategorySearch("");
          setShowCategory(false);
          
        }}
      >
        {cat}
      </div>
    ))}


  </div>
)}

    </div>

    {/* Position */}
    <div className="student-dropdown">
      <input
        placeholder="Select Position"
        value={salaryPosition || positionSearch}
        onChange={e=>{
          setPositionSearch(e.target.value);
          setSalaryPosition("");
          setShowPosition(true);
        }}
        onFocus={()=>setShowPosition(true)}
      />
     {showPosition && (
  <div className="student-dropdown-list">

    {filteredPositions.map(pos => (
      <div
        key={pos}
        className="student-option"
        onClick={()=>{
          setSalaryPosition(pos);
          setPositionSearch("");
          setShowPosition(false);
        }}
      >
        {pos}
      </div>
    ))}

    {positionSearch && (
      <div
        className="student-option"
        style={{color:"#2140df"}}
        onClick={()=>{
          setPositions({
            ...positions,
            [salaryCategory]: [
              ...(positions[salaryCategory] || []),
              positionSearch
            ]
          });

          setSalaryPosition(positionSearch);
          setPositionSearch("");
          setShowPosition(false);
        }}
      >
        ➕ Add "{positionSearch}"
      </div>
    )}

  </div>
)}
    </div>
    {staffMode === "old" &&
 salaryCategory?.trim() === "Teaching Staff" &&
 salaryPosition?.trim() === "Teacher" && (


  <div className="student-dropdown">
    <input
      placeholder="Teacher"
      value={selectedTeacher?.name || teacherSearch}
      onChange={e=>{
        setTeacherSearch(e.target.value);

  setSelectedTeacher(null);   // 👈 ADD THIS
        setShowTeacherDropdown(true);
      }}
      onFocus={()=>setShowTeacherDropdown(true)}
    />

    {showTeacherDropdown && (
      <div className="student-dropdown-list">
        {filteredTeachers.map(t => (
          <div
            key={t.id}
            className="student-option"
            onClick={() => {
              setSelectedTeacher(t);
              setTeacherSearch("");
              setShowTeacherDropdown(false);
            }}
          >
            {t.name}
          </div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="student-option muted">
            No teachers found
          </div>
        )}
      </div>
    )}
  </div>
)}
{staffMode === "old" &&
 salaryCategory === "Non Teaching Staff" &&
 salaryPosition && (

  <div className="student-dropdown">
    <input placeholder="Select Name" value={selectedTeacher?.name || staffSearch} onChange={e => {
      setStaffSearch(e.target.value); setSelectedTeacher(null); setShowStaffDropdown(true);
    }} onFocus={() => setShowStaffDropdown(true)} />

    {showStaffDropdown && (
      <div className="student-dropdown-list">
        {filteredNonTeachingStaff.map(staff => (
          <div key={staff.id} className="student-option" onClick={() => {
            setSelectedTeacher({ id: staff.id, name: staff.name });
            setStaffSearch(""); setShowStaffDropdown(false);
          }}>
            {staff.name}
          </div>
        ))}

        {filteredNonTeachingStaff.length === 0 && (
          <div className="student-option muted">No staff found</div>
        )}
      </div>
    )}
  </div>
)}

    {/* Amount */}
    <input
      type="number"
      placeholder="Amount"
      value={feeAmount}
      onChange={e=>setFeeAmount(e.target.value)}
    />

    
    {/* ===== Row 3 ===== */}
    <button className="save-btn" onClick={handleSalarySubmit}>
  {editId ? "Update Salary" : "Save Salary"}
</button>

  </div>
)}


      </div>
      <div className="history-filters">

<button
  className={
    activeSummary === "fees"
      ? "tab-btn active"
      : "tab-btn"
  }
  onClick={() => setActiveSummary("fees")}
>
  Fees Summary
</button>

<button
  className={
    activeSummary === "salary"
      ? "tab-btn active"
      : "tab-btn"
  }
  onClick={() => setActiveSummary("salary")}
>
  Salary Summary
</button>

<button
    className={
      activeSummary === "competition"
        ? "tab-btn active"
        : "tab-btn"
    }
    onClick={() => setActiveSummary("competition")}
  >
    Competition Summary
  </button>

</div>


      {activeSummary === "fees" && (
        <div className="section-card pop">
        <table className="history-table">
          <thead><tr><th onClick={()=>handleSort("className")}>Class{sortField==="className" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th onClick={()=>handleSort("name")}>Fee{sortField==="name" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th onClick={()=>handleSort("amount")}>Amount{sortField==="amount" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th>Discount</th>
<th>Action</th></tr></thead>
         <tbody>
         {getSortedData(sortedFees).map(i => (
  <tr key={i.id}>
    <td data-label="ClassName">{i.className}</td>
    <td data-label="Name">{i.name}</td>
    <td data-label="Amount">₹{i.amount}</td>
    <td data-label="Discount">{i.discount || 0}%</td>
    <td className="action-cell">

  {/* Desktop buttons */}
  <button className="edit-btn undo-btn" onClick={() => startEdit(i)}>
    <FaEdit />
    <span className="label">Edit</span>
  </button>

  <button className="delete-btn undo-btn" onClick={() => deleteFee(i)}>
    <FaTrash />
    <span className="label">Delete</span>
  </button>

  {/* Mobile 3 dots */}
  <button
    className="menu-dots"
    onClick={() =>
      setOpenMenuId(openMenuId === i.id ? null : i.id)
    }
  >
    ⋮
  </button>

  {openMenuId === i.id && (
    <div className="menu-popup">
      <button onClick={() => startEdit(i)}>
        <FaEdit /> Edit
      </button>

      <button onClick={() => deleteFee(i)}>
        <FaTrash /> Delete
      </button>
    </div>
  )}

</td>
  </tr>
))}

</tbody>

        </table>
        </div>
      )}

{activeSummary === "salary" && (
  <div className="section-card pop">
  <table className="history-table">
   <thead>
  <tr>
  <th onClick={()=>handleSort("name")}>Name{sortField==="name" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th onClick={()=>handleSort("amount")}>Amount{sortField==="amount" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th onClick={()=>handleSort("createdAt")}>Date{sortField==="date" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
    <th>Action</th>
  </tr>
</thead>

    <tbody>
    {getSortedData(salaryData).map(item => (
        <tr key={item.id}>
          <td data-label="Name">{item.name}</td>
          <td data-label="Amount">₹{item.amount}</td>
          <td data-label="Date">
            {item.createdAt?.toDate().toLocaleDateString()}
          </td>

          <td className="action-cell">

  {/* Desktop buttons */}
  <button
    className="edit-btn undo-btn"
    onClick={() => editSalary(item)}
  >
    <FaEdit /> 
    <span className="label">Edit</span>
  </button>

  <button
    className="delete-btn undo-btn"
    onClick={() => deleteSalary(item.id)}
  >
    <FaTrash /> 
    <span className="label">Delete</span>
  </button>

  {/* Mobile 3 dots */}
  <button
    className="menu-dots"
    onClick={() =>
      setOpenMenuId(openMenuId === item.id ? null : item.id)
    }
  >
    ⋮
  </button>

  {openMenuId === item.id && (
    <div className="menu-popup">
      <button onClick={() => editSalary(item)}>
        <FaEdit /> Edit
      </button>

      <button onClick={() => deleteSalary(item.id)}>
        <FaTrash /> Delete
      </button>
    </div>
  )}

</td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>
)}
{activeSummary === "competition" && (
  <div className="section-card pop">
  <table className="history-table">
    <thead>
      <tr>
      <th onClick={()=>handleSort("className")}>Class{sortField==="className" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th onClick={()=>handleSort("name")}>Name{sortField==="name" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
<th onClick={()=>handleSort("amount")}>Amount{sortField==="amount" &&
 (sortDirection==="asc"
   ? <FiChevronUp size={14}/>
   : <FiChevronDown size={14}/>
)}
</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
    {getSortedData(competitionList).map(c => (
        <tr key={c.id}>
          <td data-label="ClassName">{c.className}</td>
          <td data-label="Name">{c.name}</td>
          <td data-label="Amount">₹{c.amount}</td>
          <td className="action-cell">
        <button
          className="delete-btn"
          onClick={() => deleteCompetition(c)}
        >
          <FaTrash /> Delete
        </button>
      </td>
        </tr>
      ))}
      {competitionList.length === 0 && (
        <tr>
          <td colSpan="3" style={{ textAlign: "center", opacity: 0.6 }}>
            No competitions added
          </td>
        </tr>
      )}
    </tbody>
  </table>
  </div>
)} </div>
  );
}
