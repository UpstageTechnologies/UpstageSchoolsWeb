import React, { useState , useEffect} from "react";

import Admin from "../features/dashboard/Admin";
import Teacher from "../features/dashboard/Teacher";
import Parent from "../features/dashboard/Parent";
import OfficeStaff from "../features/dashboard/OfficeStaff";
import Student from "../features/dashboard/Student";

const accountOptions = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Parent", value: "parent" },
  { label: "Office Staff", value: "staff" },
  { label: "Student", value: "student" }
];

function CreateAccountSection() {
  useEffect(()=>{
    const close=()=>setShowDropdown(false);
    window.addEventListener("click",close);
    return()=>window.removeEventListener("click",close);
  },[]);
  const [accountType, setAccountType] = useState("");
  const [showDropdown,setShowDropdown] = useState(false);
  const renderForm = () => {
    switch (accountType) {
      case "admin":
        return <Admin formOnly />;
      case "teacher":
        return <Teacher formOnly />;
      case "parent":
        return <Parent formOnly />;
      case "staff":
        return <OfficeStaff formOnly />;
      case "student":
        return <Student formOnly />;
      default:
        return null;
    }
  };

  return (
    <div className="create-area">

      <h3>Create Account</h3>

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