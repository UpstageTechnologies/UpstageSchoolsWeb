import React, { useEffect, useState } from "react";
  import { auth } from "../../services/firebase";
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "../../services/firebase";
  import { useNavigate } from "react-router-dom";
  import "../dashboard_styles/Dashboard.css";
  import { collection, getDocs } from "firebase/firestore"; 
  import Approvals from "./Approvals";
  import Courses from "./Courses";
  import Profile from "./Profile";
  import Settings from "./accounts/Settings";
  import { FaSearch } from "react-icons/fa";
  import { buildGlobalSearchResults } from "../../utils/globalSearch";
  import {
    FaUserCircle,FaArrowLeft,
    FaUserGraduate,
    FaHome,
    FaCog,FaUserCheck,
    FaSignOutAlt,
    FaChevronDown,FaBookOpen,FaSchool,
    FaChevronUp,FaCalendarAlt,FaClipboardCheck,FaWpforms,FaMoneyBillWave
  } from "react-icons/fa";
  import schoolLogo from "../../assets/sch.jpg";
  import Admin from "./Admin";
  import OfficeStaff from "./OfficeStaff";
  import { onSnapshot } from "firebase/firestore";
  import StudentDetails from "./StudentDetails";
  import AdminTimetable from "./AdminTimetable";
  import TeacherTimetable from "./TeacherTimetable";
  import BackConfirm from "../../components/BackConfirm";
  import Attendance from "./Attendance";
  import ShowTodaysAbsent from "./ShowTodaysAbsent";
  import TeacherAttendance from "./TeacherAttendance";
  import ShowTodaysTeacherAbsent from "./ShowTodaysTeacherAbsent";
  import Home from "./Home";
  import ApplicationList from "./ApplicationList";
  
import FeesPage from "./accounts/FeesPage";

import ProfitPage from "./accounts/ProfitPage";
import Inventory from "./accounts/Inventory";
import ExpensesPage from "./accounts/ExpensesPage";
import UpgradePopup from "../../components/UpgradePopup";
import TeacherHome from "./TeacherHome";
import ParentHome from "./ParentHome";
import SchoolCalendar from "../../components/SchoolCalendar";
import { lazy, Suspense } from "react";

const Teacher = lazy(() => import("./Teacher"));
const Parent = lazy(() => import("./Parent"));
const Student = lazy(() => import("./Student"));
const isMobile = () => window.innerWidth <= 768;
const QuickTile = ({ title, page, onOpen ,color}) => {
  return (
    <div
      className="quick-tile"
      onClick={() => onOpen(page)}
    >
   <div className="tile-icon" style={{ background: color }}>

        {title.charAt(0).toUpperCase()}
      </div>
      <span>{title}</span>
    </div>
  );
};

  const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [school, setSchool] = useState("");
    const [plan, setPlan] = useState("basic");
    const [planExpiry, setPlanExpiry] = useState(null);
    const [upgradeDisabled, setUpgradeDisabled] = useState(false);
    const [sidebarState, setSidebarState] = useState("open"); 
    const [showSchoolName, setShowSchoolName] = useState(false);
    const [showQuickPanel, setShowQuickPanel] = useState(false);
        const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("home");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [homeStats, setHomeStats] = useState(null);
    const [logo, setLogo] = useState(""); 
    const [adminsList, setAdminsList] = useState([]);
const [officeStaffList, setOfficeStaffList] = useState([]);
    const [accountsSubMenuOpen, setAccountsSubMenuOpen] = useState(false);
    const [teachersList, setTeachersList] = useState([]);
const [studentsList, setStudentsList] = useState([]);
const [parentsList, setParentsList] = useState([]);
const [globalResults, setGlobalResults] = useState([]);
const pageResults = globalResults.filter(r => r.type === "page");
const peopleResults = globalResults.filter(r => r.type !== "page");
const badgeColors = {
  teacher: "#add8e6",      // blue
  student: "#90ee90",      // green
  parent: "rgb(240, 170, 240)",       // purple
  admin: "#f08080",        // red
  office_staff: "#ffa07a", // orange
  page: "#64748b"
};
const highlightText = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{
          background: "#fde68a",
          color: "#000",
          padding: "0 2px",
          borderRadius: 3,
          fontWeight: "bold"
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={i} style={{ fontWeight: 500 }}>
        {part}
      </span>
    )
  );
};

//useEffect(() => {
  //if (isMobile()) {
    //setSidebarState("open");
  //}
//}, []);
useEffect(() => {
  const adminUid =
    localStorage.getItem("adminUid") || auth.currentUser?.uid;

  if (!adminUid) return;
  const loadAll = async () => {
    const tSnap = await getDocs(collection(db, "users", adminUid, "teachers"));
    const sSnap = await getDocs(collection(db, "users", adminUid, "students"));
    const pSnap = await getDocs(collection(db, "users", adminUid, "parents"));
    const aSnap = await getDocs(collection(db, "users", adminUid, "admins"));
    const oSnap = await getDocs(collection(db, "users", adminUid, "office_staffs"));

    setTeachersList(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setStudentsList(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setParentsList(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setAdminsList(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setOfficeStaffList(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  loadAll();
}, []);

    const [showUpgrade, setShowUpgrade] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [trialAccess, setTrialAccess] = useState(false);
const [trialExpiresAt, setTrialExpiresAt] = useState(null);
useEffect(() => {
  if (!searchQuery) {
    setGlobalResults([]);
    return;
  }

  const results = buildGlobalSearchResults({
    query: searchQuery,
    teachers: teachersList,
    students: studentsList,
    parents: parentsList,
    admins: adminsList,
    officeStaffs: officeStaffList,
    searchMap
  });

  setGlobalResults(results);
}, [
  searchQuery,
  teachersList,
  studentsList,
  parentsList,
  adminsList,
  officeStaffList
]);

useEffect(() => {
  console.log("Teachers:", teachersList);
  console.log("Students:", studentsList);
  console.log("Parents:", parentsList);
}, [teachersList, studentsList, parentsList]);
    const isPremium = plan === "premium" || plan === "lifetime"; 

    const navigate = useNavigate();

    const isAdminOrSubAdmin = role === "master" || role === "admin";
    const isOfficeStaff = role === "office_staff"; 
    const formatDate = (timestamp) => {
      if (!timestamp) return "No Expiry";
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };

    const requirePremium = (callback) => {
      const now = new Date();
    
      const hasPremiumAccess =
        plan === "premium" ||
        plan === "lifetime" ||
        (
          plan === "basic" &&
          trialAccess === true &&
          trialExpiresAt &&
          trialExpiresAt.toDate() > now
        );
    
      if (!hasPremiumAccess) {
        setShowUpgrade(true);
        return;
      }
    
      callback(); // ✅ allow action
    };
    useEffect(() => {
      const off = () => setUpgradeDisabled(true);
      const on = () => setUpgradeDisabled(false);
    
      window.addEventListener("disable-upgrade-popup", off);
      window.addEventListener("enable-upgrade-popup", on);
    
      return () => {
        window.removeEventListener("disable-upgrade-popup", off);
        window.removeEventListener("enable-upgrade-popup", on);
      };
    }, []);
    
    useEffect(() => {
      const storedRole = localStorage.getItem("role");

      // 🔐 TEACHER / PARENT /  ADMIN
      if (
        storedRole === "teacher" ||
        storedRole === "parent" ||
        storedRole === "admin" ||
        storedRole === "office_staff" 
      ) 
       {
        setRole(storedRole);
        setUser({
          displayName:
            localStorage.getItem("staffName") ||
            localStorage.getItem("adminName") ||
            localStorage.getItem("teacherName") ||
            localStorage.getItem("parentName") ||
            "User",
          email: localStorage.getItem("email") || ""
        });
        
        return;
      }

      const isPremium = plan === "premium" || plan === "lifetime";

const requirePremium = (page) => {
  if (!isPremium) {
    navigate("/payment");
    return false;
  }
  setActivePage(page);
  return true;
};

      // 🔐 MASTER ADMIN
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          navigate("/login", { replace: true });
          return;
        }

        setUser(currentUser);

        const adminSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (!adminSnap.exists()) {
          navigate("/login");
          return;
        }
        const data = adminSnap.data();

        setRole("master");
        
        // ⭐ read school name + logo
        setSchool(data.schoolName || "School Name");
        localStorage.setItem("schoolName", data.schoolName || "");
        
        // ⭐ optional — future use
        localStorage.setItem("schoolLogo", data.schoolLogo || "");
        
        setPlan((data.plan || "basic").toLowerCase());
        setTrialAccess(data.trialAccess === true);
setTrialExpiresAt(data.trialExpiresAt || null);


        localStorage.setItem("plan", (data.plan || "basic").toLowerCase());


        setPlanExpiry(data.planExpiry || null);
        
        localStorage.setItem("adminName", data.username || "Admin");
        

        localStorage.setItem("adminName", data.username || "Admin");
      });

      return () => unsubscribe && unsubscribe();
    }, [navigate]);
    useEffect(() => {
      if(showSchoolName){
        const t = setTimeout(() => setShowSchoolName(false), 3000);
        return () => clearTimeout(t);
      }
    }, [showSchoolName]);
    

useEffect(() => {
  const masterUid =
    localStorage.getItem("adminUid") || auth.currentUser?.uid;

  if (!masterUid) return;

  const ref = doc(db, "users", masterUid);

  const unsub = onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const d = snap.data();

      setLogo(d.schoolLogo || "");
      setSchool(d.schoolName || "School");

      localStorage.setItem("schoolLogo", d.schoolLogo || "");
      localStorage.setItem("schoolName", d.schoolName || "");
    }
  });

  return () => unsub();
}, []);
const handleMenuClick = (page) => {
  setActivePage(page);
};



    useEffect(() => {
      const handler = () => {
        setSchool(localStorage.getItem("schoolName") || "School");
        setLogo(localStorage.getItem("schoolLogo") || "");
      };
    
      window.addEventListener("profile-updated", handler);
    
      return () => window.removeEventListener("profile-updated", handler);
    }, []);

    useEffect(() => {
      async function loadSchool() {
    

        
        // ⭐ ALWAYS read from localStorage first
        const masterUid =
          localStorage.getItem("adminUid") || auth.currentUser?.uid;
    
        if (!masterUid) return;
    
        const snap = await getDoc(doc(db, "users", masterUid));
    
        if (snap.exists()) {
          const d = snap.data();
    
          const name = d.schoolName || d.school || "School";
          const logo = d.schoolLogo || "";
    
          setSchool(name);
    
          // ⭐ store once for everyone
          localStorage.setItem("schoolName", name);
          localStorage.setItem("schoolLogo", logo);
        }
      }
    
      loadSchool();
    }, [role]);

    useEffect(() => {
  const handler = () => {
    setActivePage("teacher-dashboard");
  };

  window.addEventListener("open-teacher-dashboard", handler);

  return () =>
    window.removeEventListener("open-teacher-dashboard", handler);
}, []);
    const handleLogout = async () => {
      const confirmLogout = window.confirm("Do you want to logout?");
      if (!confirmLogout) return; // ❌ NO → stay same page
    
      localStorage.clear();
      await signOut(auth);
      navigate("/logout", { replace: true }); // ✅ YES → home page
    };
    
    useEffect(() => {
      if (role === "office_staff") {
        setActivePage("accounts"); // 🔥 direct profit page
      }
    }, [role]);
    
    const toggleSidebar = () => {
      setSidebarState(prev => {
        if (prev === "open") return "close";
        if (prev === "close") return "hidden";
        return "open";
      });
    };
    
    const params = new URLSearchParams(window.location.search);
    const viewAs = params.get("viewAs");        // admin | teacher | parent
    const viewAdminId = params.get("viewAdminId");
    const viewTeacherId = params.get("viewTeacherId");
    const viewParentId = params.get("viewParentId");
    
    const effectiveRole = viewAs || localStorage.getItem("role");

    const effectiveAdminId =
      viewAs === "admin" ? viewAdminId : localStorage.getItem("adminId");
    
    const effectiveTeacherId =
      viewAs === "teacher" ? viewTeacherId : localStorage.getItem("teacherDocId");
    
    const effectiveParentId =
      viewAs === "parent" ? viewParentId : localStorage.getItem("parentDocId");
      const searchMap = {
        home: "home",
        accounts: "accounts",
        fees: "fees",
        expenses: "expenses",
        journal: "profit",
        teacher: "teacher",
        student: "student",
        parent: "parent",
        timetable: "timetable",
        attendance: "attendance",
        courses: "courses",
        inventory: "inventory",
        approvals: "approvals",
        applications: "applications",
        calendar: "calendar",
        profile: "profile",
        settings: "settings",
        admin:"admin",
       upgrade: "payment",
        income: "income",       
  expenses: "expenses", 
        
      };
      
      useEffect(() => {
        if (
          plan === "basic" &&
          trialAccess === true &&
          trialExpiresAt &&
          trialExpiresAt.toDate() <= new Date()
        ) {
          // 1️⃣ show popup
          setShowUpgrade(true);
      
          // 2️⃣ optional alert (once)
          alert("⏰ Trial expired. Please upgrade.");
      
          // 3️⃣ stop trial
          setTrialAccess(false);
        }
      }, [plan, trialAccess, trialExpiresAt]);
      
      
      useEffect(() => {
        if (role === "teacher") {
          setActivePage("teacher-home");
        }
        if (role === "parent") {
          setActivePage("parent-home");
        }
      }, [role]);
    const adminUid = user?.uid || localStorage.getItem("adminUid");
   
    return (
      <>
     

      <BackConfirm />
      <div className="dashboard-container">
      <div className={`sidebar sidebar-${sidebarState}`}>
{/* ===== SIDEBAR PROFILE ===== */}
<div
  className="sidebar-profile"
  onClick={() => setUserMenuOpen(true)}
>
  {localStorage.getItem("profilePhoto") ? (
    <img
      src={localStorage.getItem("profilePhoto")}
      className="sidebar-avatar"
    />
  ) : (
    <FaUserCircle size={42} />
  )}

  {sidebarState === "open" && (
    <div className="sidebar-username">
      {localStorage.getItem("adminName") ||
       localStorage.getItem("teacherName") ||
       localStorage.getItem("parentName") ||
       "User"}
    </div>
  )}
</div>
{/* ===== PROFILE POPUP ===== */}
{userMenuOpen && (
  <div
    className="profile-modal-overlay"
    onClick={() => setUserMenuOpen(false)}
  >
    <div
      className="profile-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Account</h3>

      <button
        onClick={() => {
          handleMenuClick("profile");
          setUserMenuOpen(false);
        }}
      >
        👤 Profile
      </button>

      <button
        onClick={() => {
          handleMenuClick("settings");
          setUserMenuOpen(false);
        }}
      >
        ⚙ Settings
      </button>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>
    </div>
  </div>
)}
<ul>
          
  {isOfficeStaff && (
    <li className={activePage === "accounts" ? "active" : ""} onClick={() => handleMenuClick("accounts")}>
      <FaMoneyBillWave /> Accounts
    </li>
  )}
  {!isOfficeStaff && (
    <>
<li
  className={activePage === "home" ? "active" : ""}
  onClick={() => {
    if (role === "teacher") {
      handleMenuClick("teacher-home");
    } else if (role === "parent") {
      handleMenuClick("parent-home");
    } else
    handleMenuClick("home");
  
  }}
>
  <FaHome /> Home
</li>
{role === "master" && (
        <li className={activePage === "payment" ? "active" : ""}onClick={() => navigate("/payment")}>
          <FaSignOutAlt /> Upgrade
        </li>
      )}

      {role === "master" && (
        <li className={`plan-info ${plan}`}>
          <div className="plan-row">
            Plan: <strong>{plan.toUpperCase()}</strong>
          </div>
          {plan !== "basic" && (
            <div className="plan-row">
              Expiry: <strong>{formatDate(planExpiry)}</strong>
            </div>
          )}
        </li>
      )}

      {(
        (role === "master" &&
          (plan === "premium" || plan === "lifetime" || plan === "basic")) ||
        role === "admin"
      ) && (
        <>
          <li 
            className="account-main"
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          >
            <FaUserCircle /> Account Creation
            {accountMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
          </li>

          {accountMenuOpen && (
            <ul className="account-submenu">
              {role === "master" && (
                <li onClick={() => { handleMenuClick("admin"); setAccountMenuOpen(false); }} className={activePage === "admin" ? "active" : ""}>
                  Admin
                </li>
              )}
              <li onClick={() => { handleMenuClick("teacher"); setAccountMenuOpen(false); }}className={activePage === "teacher" ? "active" : ""}>
                Teachers
              </li>
              <li onClick={() => { handleMenuClick("parent"); setAccountMenuOpen(false); }}className={activePage === "parent" ? "active" : ""}>
                Parent
              </li>
              <li onClick={() => { handleMenuClick("student"); setAccountMenuOpen(false); }}className={activePage === "student" ? "active" : ""}>
                Student
              </li>
              <li onClick={() => { handleMenuClick("office_staff"); setAccountMenuOpen(false); }}className={activePage === "office_staff" ? "active" : ""}>
                Non Teachers
              </li>
            </ul>
          )}

          <li className={activePage === "accounts" ? "active" : ""} onClick={() => handleMenuClick("accounts")}>
            <FaMoneyBillWave /> Accounts
          </li>

          <li className={activePage === "timetable" ? "active" : ""}onClick={() => handleMenuClick("timetable")}>
            <FaCalendarAlt /> Timetable
          </li>

          {role === "admin" && (
            <li className={activePage === "attendance" ? "active" : ""} onClick={() => handleMenuClick("attendance")}>
              <FaUserCheck /> Teacher Attendance
            </li>
          )}
        </>
      )}
                {(role === "teacher" || role === "parent" || viewAs === "parent") && (

              <>
              <li className={activePage === "studentDetails" ? "active" : ""}onClick={() => handleMenuClick("studentDetails")}>
                <FaUserGraduate /> Student Details
              </li>
              <li className={activePage === "teacher-timetable" ? "active" : ""} onClick={() => handleMenuClick("teacher-timetable")}>
              <FaCalendarAlt/> Teacher Timetable
            </li>
            <li className={activePage === "teacher-attendance" ? "active" : ""}onClick={() => handleMenuClick("teacher-attendance")}>
            <FaUserCheck/>Students Attendance
            </li>
            </>
            )}
            {viewAs === "teacher" && (
  <button
    onClick={() => {
      localStorage.removeItem("viewAs");
      localStorage.removeItem("viewTeacherId");
      localStorage.removeItem("teacherName");
      window.location.reload();
    }}
    style={{
      background: "#2563eb",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: 6,
      border: "none",
      marginRight: 10,
      cursor: "pointer"
    }}
  >
    Exit Teacher View
  </button>
)}
      {role === "master" && (
        <li className={activePage === "approvals" ? "active" : ""} onClick={() => handleMenuClick("approvals")}>
          <FaClipboardCheck /> Approvals
        </li>
      )}

      <li className={activePage === "courses" ? "active" : ""}onClick={() => handleMenuClick("courses")}>
        <FaBookOpen /> Courses
      </li>

      {role === "master" && (
        <li className={activePage === "applications" ? "active" : ""}onClick={() => handleMenuClick("applications")}>
          <FaWpforms /> Applications
        </li>
      )}

<li
  className={`calendar-btn ${activePage === "calendar" ? "active" : ""}`}
  onClick={() => handleMenuClick("calendar")}
>
  <FaCalendarAlt className="calendar-icon" />

  {/* 🔹 Text only when sidebar open */}
  {sidebarState === "open" && (
    <span className="calendar-text">Calendar</span>
  )}
</li>
{sidebarState === "open" && trialAccess && trialExpiresAt && (
  <div
    style={{
      background: "#fef3c7",
      color: "#92400e",
      padding: "6px 10px",      // ⬅ smaller padding
      borderRadius: 6,          // ⬅ slightly smaller radius
      marginBottom: 8,
      fontSize: 12,             // ⬅ smaller text
      lineHeight: "16px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginTop: 12,  
      
    }}
  >
    🎁
    <span>
      Trial till{" "}
      {trialExpiresAt.toDate().toLocaleDateString()}
    </span>
  </div>
)}
    </>
  )}
</ul>
        </div>
        <div className="main-content">
       
<div className="menu-box" onClick={toggleSidebar}>
  ☰
</div>
          <nav className="navbar">
            <div className="nav-left">
            {activePage !== "home" && (
    <div
      className="menu-toggle"
      onClick={() => handleMenuClick("home")}
    >
      <FaArrowLeft />
    </div>
  )}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
</div>
<div className="nav-search">
  <FaSearch className="search-icon-left" />
  <input
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
  onFocus={() => setShowQuickPanel(true)}
  onBlur={() => {
    setTimeout(() => setShowQuickPanel(false), 200);
  }}
/>

<div
  className="search-school-icon"
  onClick={() => setShowSchoolName(prev => !prev)}
>
{showSchoolName && (
  <div className="school-name-popup">
    {school || localStorage.getItem("schoolName") || "School Name"}
  </div>
)}

    {(logo || localStorage.getItem("schoolLogo")) ? (
      <img
        src={logo || localStorage.getItem("schoolLogo")}
        alt="school"
      />
    ) : (
      <FaSchool />
    )}
  </div>
  {(showQuickPanel || globalResults.length > 0) && (
  <div className="search-dropdown">

    {/* QUICK ICONS */}
    {searchQuery === "" && (
      <>
        <div className="quick-row">
        <QuickTile title="Calendar" page="calendar" onOpen={handleMenuClick} />
<QuickTile title="Applications" page="applications" onOpen={handleMenuClick} />
<QuickTile title="Accounts" page="accounts" onOpen={handleMenuClick} />
<QuickTile title="Timetable" page="timetable" onOpen={handleMenuClick} />
<QuickTile title="Approvals" page="approvals" onOpen={handleMenuClick} />
<QuickTile title="Courses" page="courses" onOpen={handleMenuClick} />

        </div>

        <div className="quick-title">Account Creation</div>

        <div className="quick-row">
  <QuickTile title="Admin" page="admin" color="#f08080" onOpen={handleMenuClick} />
  <QuickTile title="Teacher" page="teacher" color="#add8e6" onOpen={handleMenuClick} />
  <QuickTile title="Student" page="student" color="#90ee90" onOpen={handleMenuClick} />
  <QuickTile title="Parent" page="parent" color="rgb(240,170,240)" onOpen={handleMenuClick} />
  <QuickTile title="Staff" page="office_staff" color="#ffa07a" onOpen={handleMenuClick} />
</div>  

      </>
    )}
    

    {/* PAGES */}
    {pageResults.length > 0 && (
      <>
        <div className="quick-title">Pages</div>
        <div className="quick-row">
          {pageResults.map((item,i)=>(
            <QuickTile
              key={i}
              title={item.label}
              page={item.value}
            />
          ))}
        </div>
      </>
    )}

    {/* PEOPLE */}
    {peopleResults.length > 0 && (
      <>
        <div className="quick-title">People</div>

        {peopleResults.map((item,i)=>(
          <div
            key={i}
            className="search-item"
            onClick={() => {

              if (item.type === "teacher") {
                localStorage.setItem("selectedTeacherId", item.id);
                handleMenuClick("teacher");
              }

              if (item.type === "student") {
                localStorage.setItem("selectedStudentId", item.id);
                handleMenuClick("student");
              }

              if (item.type === "parent") {
                localStorage.setItem("selectedParentId", item.id);
                handleMenuClick("parent");
              }

              if (item.type === "admin") {
                localStorage.setItem("selectedAdminId", item.id);
                handleMenuClick("admin");
              }

              if (item.type === "office_staff") {
                localStorage.setItem("selectedOfficeStaffId", item.id);
                handleMenuClick("office_staff");
              }

              setSearchQuery("");
              setGlobalResults([]);
            }}
          >
            <span>{highlightText(item.label, searchQuery)}</span>

            <span
              style={{
                background: badgeColors[item.type],
                color:"#fff",
                padding:"2px 8px",
                borderRadius:10,
                fontSize:11,
                fontWeight:600
              }}
            >
              {item.type}
            </span>
          </div>
        ))}

      </>
      
    )}
{searchQuery !== "" &&
      pageResults.length === 0 &&
      peopleResults.length === 0 && (
        <div className="no-search-results">
          ❌ No search results found
        </div>
    )}
  </div>
)}


</div></div>
{viewAs === "parent" && (
  <button
    onClick={() => {
      localStorage.removeItem("viewAs");
      localStorage.removeItem("viewParentId");
      localStorage.removeItem("parentName");
      window.location.reload();
    }}
    style={{
      background: "#ef4444",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: 6,
      border: "none",
      marginRight: 10,
      cursor: "pointer"
    }}
  >
    Exit Parent View
  </button>
)}</nav>
          <div className="dashboard-content">

            {/* 📅 FULL PAGE CALENDAR */}
{activePage === "calendar" && (
  <div className="calendar-fullpage">
    <SchoolCalendar
      adminUid={adminUid}
      role={role}
    />
  </div>
)}

            {/* 👩‍🏫 TEACHER HOME */}
{role === "teacher" && activePage === "teacher-home" && (
  <TeacherHome
    adminUid={localStorage.getItem("adminUid")}
    teacherId={localStorage.getItem("teacherDocId")}
  />
)}
{role === "parent" && activePage === "parent-home" && (
  <ParentHome
    adminUid={localStorage.getItem("adminUid")}
    parentId={localStorage.getItem("parentDocId")}
  />
)}


{(role === "master" || role === "admin") && activePage === "home" &&(
  <Home
  adminUid={adminUid}
  handleMenuClick={handleMenuClick}
  plan={plan}
  viewAs={viewAs}
  viewAdminId={viewAdminId}
  viewTeacherId={viewTeacherId}
  viewParentId={viewParentId}
/>


)}
{isAdminOrSubAdmin && activePage === "fees" && (
  <FeesPage 
  adminUid={adminUid} 
  setActivePage={setActivePage}
  globalSearch={searchQuery}
/>

)}
{activePage === "income" && (
  <FeesPage adminUid={adminUid} mode="income" globalSearch={searchQuery} setActivePage={setActivePage}/>
)}

{activePage === "expenses" && (
  <FeesPage adminUid={adminUid} mode="expenses" globalSearch={searchQuery} setActivePage={setActivePage}/>
)}

{(isAdminOrSubAdmin || isOfficeStaff) && activePage === "accounts" && (
  <ExpensesPage
    adminUid={adminUid}
    setActivePage={setActivePage}
  />
)}
{(isAdminOrSubAdmin || isOfficeStaff) &&
 (activePage === "profit" || activePage.startsWith("bill_")) && (
<ProfitPage
  adminUid={adminUid}
  setActivePage={setActivePage}
  activePage={activePage}
  plan={plan}
  trialAccess={trialAccess}
  trialExpiresAt={trialExpiresAt}
  showUpgrade={() => setShowUpgrade(true)}
/>


)}


{isAdminOrSubAdmin && activePage === "inventory" && (
 <Inventory
 adminUid={adminUid}
 setActivePage={setActivePage}
 plan={plan}
 showUpgrade={() => setShowUpgrade(true)}
/>

)}


{/* rest of the pages go here… */}


    




            {isAdminOrSubAdmin && activePage === "teacher" && (
              <Teacher adminUid={adminUid} globalSearch={searchQuery} requirePremium={requirePremium} />
            )}

{(isAdminOrSubAdmin || viewAs === "parent") && activePage === "parent" && (
  <Parent adminUid={adminUid}  globalSearch={searchQuery} requirePremium={requirePremium} />
)}


            {isAdminOrSubAdmin && activePage === "student" && (
              <Student adminUid={adminUid} globalSearch={searchQuery} requirePremium={requirePremium} />
            )}
              {isAdminOrSubAdmin && activePage === "office_staff" && (
  <OfficeStaff adminUid={adminUid} globalSearch={searchQuery} requirePremium={requirePremium}/>
)}
            {(role === "teacher" || role === "parent") &&
              activePage === "studentDetails" && <StudentDetails />}

            {isAdminOrSubAdmin && activePage === "timetable" && (
              <AdminTimetable />
            )}

{(role === "master") && activePage === "admin" && (
  <Admin requirePremium={requirePremium} globalSearch={searchQuery}/>
)}


            {activePage === "approvals" && role === "master" && <Approvals requirePremium={requirePremium} />}
            {(role === "teacher" || viewAs === "teacher") &&
  activePage === "teacher-timetable" && (
    <TeacherTimetable teacherId={viewTeacherId} />
)}

            
          {isAdminOrSubAdmin && activePage === "attendance" && (
              <Attendance adminUid={adminUid} />
              )}
{isAdminOrSubAdmin && activePage === "todays-absent" && (
  isPremium ? (
    <ShowTodaysAbsent adminUid={adminUid} setActivePage={setActivePage} />
  ) : (
    <UpgradePopup onClose={() => setActivePage("home")} />
  )
)}


        {isAdminOrSubAdmin && activePage === "courses" && (
            <Courses />
            )}
           {(role === "teacher" || viewAs === "teacher") &&
  activePage === "teacher-attendance" && (
    <TeacherAttendance teacherId={viewTeacherId} />
)}
{isAdminOrSubAdmin && activePage === "teacher-absents" && (
  isPremium ? (
    <ShowTodaysTeacherAbsent adminUid={adminUid} setActivePage={setActivePage} />
  ) : (
    <UpgradePopup onClose={() => setActivePage("home")} />
  )
)}{role === "master" && activePage === "applications" && (
              <ApplicationList requirePremium={requirePremium} />
              )}
              {activePage === "profile" && (
    <Profile />
  )}
  {activePage === "settings" && (
  <Settings adminUid={adminUid} />
)}</div>
        </div>
        {showUpgrade && !upgradeDisabled && (
  <UpgradePopup
    onClose={() => setShowUpgrade(false)}
    onUpgrade={() => navigate("/payment")}
  />
)}
      </div>

     

      </>
    );
  };
  export default Dashboard;