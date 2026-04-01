import React, { useState ,useEffect } from "react";

import Admin from "./Admin";
import Teacher from "./Teacher";
import Parent from "./Parent";
import Student from "./Student";
import OfficeStaff from "./OfficeStaff";
import "../dashboard_styles/CreateAccountModal.css"

import CreateAccountModal from "../../components/CreateAccountModal";

export default function AccountCreation({ setActivePage }) {
 
  const [modalOpen, setModalOpen] = useState(false);
const [accountType, setAccountType] = useState("");
const [editData, setEditData] = useState(null);
const [activeTab,setActiveTab] = useState("admin")
const [globalSearch,setGlobalSearch]=useState("");
const [sortField, setSortField] = useState("");
const [sortDirection, setSortDirection] = useState("asc");
const [showAccountGuide, setShowAccountGuide] = useState(true);
return(
<div className="accountcreationtitle">
<h2 className="page-title">Account creation</h2>
{showAccountGuide && (
  <div className="guide-banner">
    <p>
      Manage all your school accounts from here.

      You can create and manage Admin, Teacher, Parent,
      Student, and Office Staff accounts easily.

      • Add, edit, disable, or delete accounts  
      • Use search and filters to quickly find users  
      • View all account details in one place  

      Try exploring the options and click <strong>Finish</strong>.
    </p>
    <button
  className="finish-btn"
  onClick={() => {
    setShowAccountGuide(false);

    if (window.openIntroPopup) {
      window.openIntroPopup("planner"); // 🔥 NEXT FLOW
    }
  }}
>
  Finish →
</button>
  </div>
)}
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
  setActiveTab={setActiveTab}

  sortField={sortField}
  sortDirection={sortDirection}
  setSortField={setSortField}          // 🔥 ADD THIS
  setSortDirection={setSortDirection}   // 🔥 ADD THIS
  globalSearch={globalSearch}
  setGlobalSearch={setGlobalSearch}
/>
{activeTab==="admin" && (
  <Admin
  globalSearch={globalSearch}
  setActivePage={setActivePage}
  sortField={sortField}
  sortDirection={sortDirection}
    onEdit={(data) => {
      setEditData({ ...data, type: "admin" });
      setAccountType("admin"); // 🔥 IMPORTANT
      setModalOpen(true);
    }}
  />
)}
    {activeTab==="teacher" && (

  <Teacher
  globalSearch={globalSearch}
  sortField={sortField}
  sortDirection={sortDirection}
  setActivePage={setActivePage}
    onEdit={(data) => {
      setEditData({ ...data, type: "teacher" });
      setAccountType("teacher"); // 🔥 IMPORTANT
      setModalOpen(true);        // 🔥 open modal
    }}
  />
)}
    {activeTab==="parent" && (
 <Parent
 globalSearch={globalSearch}
 sortField={sortField}
 sortDirection={sortDirection}
 setActivePage={setActivePage}
   onEdit={(data) => {
    setEditData({ ...data, type: "parent" });
     setAccountType("parent"); // 🔥 ADD THIS
     setModalOpen(true);
   }}
 />
)}
    {activeTab==="student" && (
  <Student
  globalSearch={globalSearch}
  sortField={sortField}
  sortDirection={sortDirection}
  setActivePage={setActivePage}
    onEdit={(data) => {
      setEditData({ ...data, type: "student" });
      setAccountType("student"); // 🔥 IMPORTANT
      setModalOpen(true);
    }}
  />
)}
    {activeTab==="staff" && (
  <OfficeStaff
  globalSearch={globalSearch}
  sortField={sortField}
  sortDirection={sortDirection}
  setActivePage={setActivePage}
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