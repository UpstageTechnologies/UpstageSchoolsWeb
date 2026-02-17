import React, { useEffect, useState , lazy ,Suspense } from "react";
import { useCallback, useMemo } from "react";
  import { auth } from "../../services/firebase";
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "../../services/firebase";
  import { useNavigate } from "react-router-dom";
  import "../dashboard_styles/Dashboard.css";
  import { collection, getDocs , onSnapshot} from "firebase/firestore"; 
  import { FaSearch } from "react-icons/fa";
  import { buildGlobalSearchResults } from "../../utils/globalSearch";
  import Navbar from "../../components/Navbar";
  import UpgradePopup from "../../components/UpgradePopup";
  import BackConfirm from "../../components/BackConfirm";
  import {
    FaUserCircle,FaArrowLeft,
    FaUserGraduate,
    FaHome,
    FaCog,FaUserCheck,
    FaSignOutAlt,
    FaChevronDown,FaBookOpen,FaSchool,
    FaChevronUp,FaCalendarAlt,FaClipboardCheck,FaWpforms,FaMoneyBillWave
  } from "react-icons/fa";
  import { ROLE_ACCESS } from "../../config/roleAccess";
  const Admin = lazy(() => import("./Admin"));
  const OfficeStaff = lazy(() => import("./OfficeStaff"));
  const StudentDetails = lazy(() => import("./StudentDetails"));
const AdminTimetable = lazy(() => import("./AdminTimetable"));
const TeacherTimetable = lazy(() => import("./TeacherTimetable"));
const TeacherHome = lazy(() => import("./TeacherHome"));
const ParentHome = lazy(() => import("./ParentHome"));
  const Attendance = lazy(() => import("./Attendance"));
  const ShowTodaysAbsent = lazy(() => import("./ShowTodaysAbsent"));
const TeacherAttendance = lazy(() => import("./TeacherAttendance"));
const ShowTodaysTeacherAbsent = lazy(() => import("./ShowTodaysTeacherAbsent"));
const Approvals = lazy(() => import("./Approvals"));
const Courses = lazy(() => import("./Courses"));
const Home = lazy(() => import("./Home"));
  const ApplicationList = lazy(() => import("./ApplicationList"));
  const HistoryPage = lazy(() => import("./accounts/HistoryPage"));
  const FeesPage = lazy(() => import("./accounts/FeesPage"));
  const ProfitPage = lazy(() => import("./accounts/ProfitPage"));
  const Inventory = lazy(() => import("./accounts/Inventory"));
const ExpensesPage = lazy(() => import("./accounts/ExpensesPage"));
const Profile = lazy(() => import("./Profile"));
const Settings = lazy(() => import("./accounts/Settings"));
const SchoolCalendar = lazy(() => import("../../components/SchoolCalendar"));
const CoursePlanner = lazy(() => import("./CoursePlanner"));
const Timetable = lazy(() => import("./Timetable"));
const Teacher = lazy(() => import("./Teacher"));
const Parent = lazy(() => import("./Parent"));
const Student = lazy(() => import("./Student"));
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
        const [accountPopupOpen, setAccountPopupOpen] = useState(false);
     
    const [activePage, setActivePage] = useState("home");
    const [pageHistory, setPageHistory] = useState(["home"]);
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

const badgeColors = {teacher: "#add8e6", student: "#90ee90",      // green
  parent: "rgb(240, 170, 240)",       // purple
  admin: "#f08080",        // red
  office_staff: "#ffa07a", // orange
  page: "#64748b"
};
const highlightText = useCallback((text, query) => {

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
},[]);


const closeSearch = () => {
  setShowSearch(false);
};useEffect(() => {
  const loadAll = async () => {
    const adminUid =
      localStorage.getItem("adminUid") || auth.currentUser?.uid;

    if (!adminUid) return;

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
}, []);   // 🔥 empty dependency



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
    const roleAccess = useMemo(() => {
      return ROLE_ACCESS[role] || { pages: [], people: [] };
    }, [role]);
    const pageResults = useMemo(() => {
      return globalResults.filter(
        r =>
          r.type === "page" &&
          roleAccess.pages.includes(r.value)
      );
    }, [globalResults, roleAccess]);
    const peopleResults = useMemo(() => {
      return globalResults.filter(
        r =>
          r.type !== "page" &&
          roleAccess.people.includes(r.type)
      );
    }, [globalResults, roleAccess]);
    
    
    const formatDate = (timestamp) => {
      if (!timestamp) return "No Expiry";
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };
    const requirePremium = useCallback((callback) => {
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
    
      callback();
    }, [plan, trialAccess, trialExpiresAt]);
    
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
const handleMenuClick = useCallback((page) => {
  setPageHistory(prev => {
    if (prev[prev.length - 1] === page) return prev;
    return [...prev, page];
  });
  setActivePage(page);
}, []);



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
        handleMenuClick("teacher-dashboard");
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
    };useEffect(() => {
      if (role === "office_staff") {
        setActivePage("accounts");
        setPageHistory(["home", "accounts"]);
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
        expenseList: "expenses"
        
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
          setPageHistory(["home", "teacher-home"]);
        }
      
        if (role === "parent") {
          setActivePage("parent-home");
          setPageHistory(["home", "parent-home"]);
        }
      }, [role]);
      
      const adminUid = localStorage.getItem("adminUid");

   
    return (
      <>
     

      <BackConfirm />
      <div style={{background:"#F2F4F7"}} className={`dashboard-container ${accountPopupOpen ? "popup-open" : ""}`}>
      <div className={`sidebar sidebar-${sidebarState}`}>
{/* ===== SIDEBAR PROFILE ===== */}
<div
  className="sidebar-profile">
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
        (role === "master"  && 
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
   
        <Navbar
  toggleSidebar={toggleSidebar}
  activePage={activePage}
  setPageHistory={setPageHistory}
  setActivePage={setActivePage}

  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}

  showQuickPanel={showQuickPanel}
  setShowQuickPanel={setShowQuickPanel}
  accountPopupOpen={accountPopupOpen}
  setAccountPopupOpen={setAccountPopupOpen}
  globalResults={globalResults}
  closeSearch={closeSearch}

  school={school}
  logo={logo}
  showSchoolName={showSchoolName}
  setShowSchoolName={setShowSchoolName}

  handleMenuClick={handleMenuClick}

  pageResults={pageResults}
  peopleResults={peopleResults}
  highlightText={highlightText}
  badgeColors={badgeColors}
  viewAs={viewAs}
/>
{accountPopupOpen && (
  <div
    className="profile-modal-overlay"
    onClick={() => setAccountPopupOpen(false)}
  >
    <div
      className="profile-modal"
      onClick={(e) => e.stopPropagation()}
    >

      {/* 🔹 SCHOOL NAME */}
      <div className="popup-school-name">
        {school || localStorage.getItem("schoolName") || "School Name"}
      </div>

      {/* 🔹 ROLE */}
      <div className="popup-role">
        {(role || localStorage.getItem("role") || "USER").toUpperCase()}
      </div>

      {/* 🔹 USER NAME (NEW) */}
      <div className="popup-user-name">
        {localStorage.getItem("adminName") ||
         localStorage.getItem("teacherName") ||
         localStorage.getItem("parentName") ||
         "User"}
      </div>

      <div className="popup-divider" />

      {/* buttons */}
      <button
        className="popup-btn"
        onClick={() => {
          handleMenuClick("profile");
          setAccountPopupOpen(false);
        }}
      >
        👤 Profile
      </button>

      <button
        className="popup-btn"
        onClick={() => {
          handleMenuClick("settings");
          setAccountPopupOpen(false);
        }}
      >
        ⚙ Settings
      </button>

      <button
        className="popup-btn logout"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/logout";
        }}
      >
        🚪 Logout
      </button>

    </div>
  </div>
)}
          <div style={{background:"#F2F4F7"}}className="dashboard-content">
            <Suspense fallback={
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    fontSize: 18,
    fontWeight: 500
  }}>
    Loading page...
  </div>
}>
{activePage === "calendar" && (
  <div className="calendar-fullpage">
    <SchoolCalendar
      adminUid={adminUid}
      role={role}
    />
  </div>
)}
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
{activePage === "history" && (
  <HistoryPage
    adminUid={adminUid}
    setActivePage={setActivePage}
    globalSearch={searchQuery}
  />
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
            {isAdminOrSubAdmin && activePage === "teacher" && (
              <Teacher adminUid={adminUid} globalSearch={searchQuery} requirePremium={requirePremium} />)}
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
    <UpgradePopup onClose={() => handleMenuClick("home")}    />
  )
)}
{/* COURSES PAGE */}
{isAdminOrSubAdmin && activePage === "courses" && (
  <Courses handleMenuClick={handleMenuClick} />
)}

{/* COURSE PLANNER PAGE */}
{isAdminOrSubAdmin && activePage.startsWith("course-planner-") && (
  <CoursePlanner
    classId={activePage.replace("course-planner-", "")}
  />
)}
{/* TIMETABLE PLANNER PAGE */}
{isAdminOrSubAdmin && activePage.startsWith("timetable-planner-") && (
  <Timetable
    classId={activePage.replace("timetable-planner-", "")}
  />
)}

           {(role === "teacher" || viewAs === "teacher") &&
  activePage === "teacher-attendance" && (
    <TeacherAttendance teacherId={viewTeacherId} />
)}
{isAdminOrSubAdmin && activePage === "teacher-absents" && (
  isPremium ? (
    <ShowTodaysTeacherAbsent adminUid={adminUid} setActivePage={setActivePage} />
  ) : (
    <UpgradePopup onClose={() => handleMenuClick("home")}    />
  )
)}{role === "master" && activePage === "applications" && (
              <ApplicationList requirePremium={requirePremium} />
              )}
              {activePage === "profile" && (
    <Profile />
  )}
  {activePage === "settings" && (
  <Settings adminUid={adminUid} />
)}</Suspense></div>
        </div>
        {showUpgrade && !upgradeDisabled && (
  <UpgradePopup
    onClose={() => setShowUpgrade(false)}
    onUpgrade={() => navigate("/payment")}
  />
)}</div> </>
    );};
  export default Dashboard;