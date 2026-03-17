import React, { useState ,useEffect } from "react";

import Admin from "./Admin";
import Teacher from "./Teacher";
import Parent from "./Parent";
import Student from "./Student";
import OfficeStaff from "./OfficeStaff";
import "../dashboard_styles/CreateAccountModal.css"

import CreateAccountModal from "../../components/CreateAccountModal";

export default function AccountCreation() {
 
  const [modalOpen, setModalOpen] = useState(false);
const [accountType, setAccountType] = useState("");
const [editData, setEditData] = useState(null);
const [activeTab,setActiveTab] = useState("admin")

return(
<div className="accountcreationtitle">

<h2>Account Creation</h2>

<div className="account-card">

<div className="accountcreationbuttons">

<button 
className={activeTab==="admin" ? "tab active" : "tab"}
onClick={()=>setActiveTab("admin")}
>
Admin
</button>

<button 
className={activeTab==="teacher" ? "tab active" : "tab"}
onClick={()=>setActiveTab("teacher")}
>
Teacher
</button>

<button 
className={activeTab==="parent" ? "tab active" : "tab"}
onClick={()=>setActiveTab("parent")}
>
Parent
</button>

<button 
className={activeTab==="student" ? "tab active" : "tab"}
onClick={()=>setActiveTab("student")}
>
Student
</button>

<button 
className={activeTab==="staff" ? "tab active" : "tab"}
onClick={()=>setActiveTab("staff")}
>
Office Staff
</button>

</div>

  {/* Card content */}
  <div className="account-card-body">
  <CreateAccountModal
  open={modalOpen}
  setOpen={setModalOpen}
  accountType={accountType}
  editData={editData}
  setEditData={setEditData}
  setActiveTab={setActiveTab}   // 🔥 ADD THIS
/>
{activeTab==="admin" && (
  <Admin
    onEdit={(data) => {
      setEditData({ ...data, type: "admin" });
      setAccountType("admin"); // 🔥 IMPORTANT
      setModalOpen(true);
    }}
  />
)}
    {activeTab==="teacher" && (
  <Teacher
    onEdit={(data) => {
      setEditData({ ...data, type: "teacher" });
      setAccountType("teacher"); // 🔥 IMPORTANT
      setModalOpen(true);        // 🔥 open modal
    }}
  />
)}
    {activeTab==="parent" && (
 <Parent
   onEdit={(data) => {
    setEditData({ ...data, type: "parent" });
     setAccountType("parent"); // 🔥 ADD THIS
     setModalOpen(true);
   }}
 />
)}
    {activeTab==="student" && (
  <Student
    onEdit={(data) => {
      setEditData({ ...data, type: "student" });
      setAccountType("student"); // 🔥 IMPORTANT
      setModalOpen(true);
    }}
  />
)}
    {activeTab==="staff" && (
  <OfficeStaff
    onEdit={(data) => {
     
      setEditData({ ...data, type: "staff" }); // 🔥 add type
      setAccountType("staff");   // 🔥 dropdown auto select
      setModalOpen(true);        // 🔥 open modal
    }}
  />
)}

  </div>

</div>

</div>
)

}