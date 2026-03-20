import React, { useState , useEffect} from "react";

import Admin from "../features/dashboard/Admin";
import Teacher from "../features/dashboard/Teacher";
import Parent from "../features/dashboard/Parent";
import OfficeStaff from "../features/dashboard/OfficeStaff";
import Student from "../features/dashboard/Student";
import "../features/dashboard_styles/History.css"
import { FaFilter } from "react-icons/fa";
const accountOptions = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Parent", value: "parent" },
  { label: "Office Staff", value: "staff" },
  { label: "Student", value: "student" }
];function CreateAccountSection({
  editData,
  setEditData,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  sortField,              // 🔥 ADD THIS
  setSortField,          // 🔥 ADD
  setSortDirection       // 🔥 ADD
}) {
  useEffect(()=>{
    const close=()=>setShowDropdown(false);
    window.addEventListener("click",close);
    return()=>window.removeEventListener("click",close);
  },[]);
  ;

  const [showDropdown,setShowDropdown] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [showFilterList,setShowFilterList] = useState(false)
const [filterType, setFilterType] = useState("");
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFilterList(false);
    };
  
    window.addEventListener("click", handleClickOutside);
  
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);
  useEffect(() => {
    if (editData?.type) {
      setAccountType(editData.type);
      setActiveTab(editData.type); // 🔥 SYNC TAB
    }
  }, [editData]);
  const renderForm = () => {
    switch (accountType) {
      case "admin":
  return (
    <Admin
      formOnly
      editData={editData}
      
      onEdit={(data) => {
        setEditData({
          ...data,
          type: "admin"
        });
      }}
    />
  );
        case "teacher":
          return (
            <Teacher
              formOnly
              editData={editData}
              requirePremium={requirePremium}
              onEdit={(data) => {
                setEditData(data);
                setAccountType("teacher");
              }}
            />
          );
        case "parent":
  return (
    <Parent
      formOnly
      editData={editData}
      requirePremium={requirePremium}
      setEditData={setEditData}
      onEdit={(data) => {
        setEditData(data);      // 🔥 set data
        setAccountType("parent"); // 🔥 open form
      }}
    />
  );
  case "staff":
    return (
      <OfficeStaff
        formOnly
        editData={editData}
        requirePremium={requirePremium}
        onEdit={(data) => {
          setEditData(data);
          setAccountType("staff");
        }}
      />
    );
    case "student":
      return (
        <Student
          formOnly
          editData={editData}
          requirePremium={requirePremium}
          onEdit={(data) => {
            setEditData(data);
            setAccountType("student");
          }}
        />
      );
      default:
        return null;
    }
  };
  const renderTable = () => {
    switch (accountType) {
      case "admin":
  return (
    <Admin
      onEdit={(data) => {
        setEditData(data);
        setAccountType("admin");
      }}
    />
  );
      case "parent":
        return (
          <Parent
            onEdit={(data) => {
              setEditData(data);      // 🔥 set data
              setAccountType("parent"); // 🔥 open form
            }}
          />
        );
        case "staff":
  return (
    <OfficeStaff
      onEdit={(data) => {
        setEditData(data);
        setAccountType("staff");
      }}
    />
  );
  case "student":
  return (
    <Student
      onEdit={(data) => {
        setEditData(data);
        setAccountType("student");
      }}
    />
  );
  case "teacher":
  return (
    <Teacher
      onEdit={(data) => {
        setEditData(data);
        setAccountType("teacher");
      }}
    />
  );
      default:
        return null;
    }
  };
  const requirePremium = (fn) => {
    const isPremium = true; // 🔥 change logic later
  
    if (!isPremium) {
      alert("Upgrade to premium");
      return;
    }
  
    fn();
  };
  return (
    <div className="create-area">
<div className="history-controls">

<h2>Create Account</h2>

{/* WRAPPER ADD */}
<div className="search-wrapper" onClick={(e) => e.stopPropagation()}>
<input
  type="text"
  placeholder="Search here..."
  value={globalSearch}
  onChange={(e) => {
    const value = e.target.value;
    setGlobalSearch(value);
  
    if (value) {
      setShowFilterList(false); // typing → close
    } else {
      setShowFilterList(true);  // 🔥 emptyனா மீண்டும் open
    }
  }}
  onFocus={(e) => {
    e.stopPropagation();
    if (!globalSearch) {
      setShowFilterList(true);
    }
  }}
/>

  {showFilterList && (
   <div className="filter-list" onClick={(e) => e.stopPropagation()}>
   <label>Filter type <FaFilter /></label>
   <h4
  onClick={() => {
    setFilterType("name");
    setShowFilterList(false);

    if (sortField === "name") {
    
      setSortDirection(prev =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      // 🔥 first time click
      setSortField("name");
      setSortDirection("asc");
    }
  }}
>
  Name
</h4>
<h4
  onClick={() => {
    setFilterType("class");
    setShowFilterList(false);

    if (sortField === "class") {
      setSortDirection(prev =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField("class");
      setSortDirection("asc");
    }
  }}
>
  Class
</h4>
 </div>
  )}

</div>

</div>

      <div className="create-row">

        {/* CHOOSE DROPDOWN */}
        <div className="adminpopup-select">
        <div
  className="adminpopup-input"
  onClick={(e)=>{
    e.stopPropagation();

    // 🔥 if form open -> close it
    if(accountType){
      setAccountType("");
      setShowDropdown(false);
    }else{
      setShowDropdown(prev=>!prev);
    }
  }}
>
{accountType
  ? accountOptions.find(o=>o.value===accountType)?.label
  : "Choose"}
  <span>▼</span>
</div>

{showDropdown && (
  <div className="adminpopup-menu">

{accountOptions.map(option => (
  <div
    key={option.value}
    onClick={()=>{
      setAccountType(option.value);
      setActiveTab(option.value);   // 🔥 SYNC TAB
      setEditData(null);
      setShowDropdown(false);
    }}
  >
    {option.label}
  </div>
))}

  </div>
)}

</div>
        {accountType && renderForm()}

      </div>

    </div>
  );
}

export default CreateAccountSection;