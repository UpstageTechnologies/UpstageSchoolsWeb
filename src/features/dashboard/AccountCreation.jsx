import React, { useState } from "react";

import Admin from "./Admin";
import Teacher from "./Teacher";
import Parent from "./Parent";
import Student from "./Student";
import OfficeStaff from "./OfficeStaff";
import "../dashboard_styles/History.css"

import CreateAccountModal from "../../components/CreateAccountModal";

export default function AccountCreation() {

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

    <CreateAccountModal />

    {activeTab==="admin" && <Admin/>}
    {activeTab==="teacher" && <Teacher/>}
    {activeTab==="parent" && <Parent/>}
    {activeTab==="student" && <Student/>}
    {activeTab==="staff" && <OfficeStaff/>}

  </div>

</div>

</div>
)

}