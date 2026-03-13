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

<div className="">

<h2>Account Creation</h2>

{/* Tabs */}

<div className="history-filters">

<button onClick={()=>setActiveTab("admin")}>Admin</button>
<button onClick={()=>setActiveTab("teacher")}>Teacher</button>
<button onClick={()=>setActiveTab("parent")}>Parent</button>
<button onClick={()=>setActiveTab("student")}>Student</button>
<button onClick={()=>setActiveTab("staff")}>Office Staff</button>

</div>


{/* ⭐ Create Account Button (COMMON) */}

<CreateAccountModal />


{/* Tables */}

{activeTab==="admin" && <Admin/>}
{activeTab==="teacher" && <Teacher/>}
{activeTab==="parent" && <Parent/>}
{activeTab==="student" && <Student/>}
{activeTab==="staff" && <OfficeStaff/>}

</div>

)

}