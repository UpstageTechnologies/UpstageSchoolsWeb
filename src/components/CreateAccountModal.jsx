import React, { useState , useEffect} from "react";

import Admin from "../features/dashboard/Admin";
import Teacher from "../features/dashboard/Teacher";
import Parent from "../features/dashboard/Parent";
import OfficeStaff from "../features/dashboard/OfficeStaff";
import Student from "../features/dashboard/Student";
import "../features/dashboard_styles/History.css"
const accountOptions = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Parent", value: "parent" },
  { label: "Office Staff", value: "staff" },
  { label: "Student", value: "student" }
];function CreateAccountSection({ editData, setEditData, setActiveTab ,globalSearch,setGlobalSearch}) {
  useEffect(()=>{
    const close=()=>setShowDropdown(false);
    window.addEventListener("click",close);
    return()=>window.removeEventListener("click",close);
  },[]);
  ;
  
  const [showDropdown,setShowDropdown] = useState(false);
  const [accountType, setAccountType] = useState("");
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

{/* LEFT SIDE */}
<h2>Create Account</h2>

{/* RIGHT SIDE SEARCH */}
<input
  type="text"
  placeholder="Search here..."
  value={globalSearch}
  onChange={(e) => setGlobalSearch(e.target.value)}
/>

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

        {/* FORM SIDE */}
        {accountType && renderForm()}

      </div>

    </div>
  );
}

export default CreateAccountSection;