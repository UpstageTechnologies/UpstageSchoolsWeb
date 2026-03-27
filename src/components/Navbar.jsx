import React from "react";
import {
  FaSearch,
  FaArrowLeft,
  FaSchool,
  FaClock,
  FaBars,
  FaRegBell
} from "react-icons/fa";
import "../features/dashboard_styles/navbar.css";
import { ROLE_ACCESS } from "../config/roleAccess";
import { useRef, useEffect , useState } from "react";
import { onSnapshot , collection  } from "firebase/firestore";
import { db } from "../services/firebase";
import CombinedPage from "../features/dashboard/CombinedPage";


const PARENT_PAGE = {
  profit: "accounts",
  income: "accounts",
  expenses: "accounts",
  inventory: "accounts",
  expenseList: "accounts",

  accounts: "home",

  calendar: "home",
  applications: "home",
  timetable: "home",
  attendance: "home",
  courses: "home",
  approvals: "home",
  profile: "home",
  settings: "home"
};
const Navbar = ({
  toggleSidebar,
  activePage,
  setPageHistory,
  setActivePage,

  searchQuery,
  setSearchQuery,

  showQuickPanel,
  setShowQuickPanel,

  globalResults,
  closeSearch,

  school,
  logo,
  showSchoolName,
  setShowSchoolName,

  handleMenuClick,

  pageResults,
  peopleResults,
  highlightText,
  badgeColors,

  accountPopupOpen,
  setAccountPopupOpen,
  viewAs
}) => {
  const role =
  viewAs ??
  localStorage.getItem("viewAs") ??
  localStorage.getItem("role");
  const dropdownRef = useRef(null);
  const [allUsers, setAllUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    const adminUid = localStorage.getItem("adminUid");
    const unsub1 = onSnapshot(
      collection(db, "users", adminUid, "applications"),
      (snap) => {
        const pendingApps = snap.docs.filter(doc => {
          const d = doc.data();
          return !d.status || d.status === "pending";
        });
  
        setNotificationCount(prev => ({
          ...prev,
          applications: pendingApps.length
        }));
      }
    );
  
    // 🔹 Approvals (ONLY PENDING)
    const unsub2 = onSnapshot(
      collection(db, "users", adminUid, "approval_requests"),
      (snap) => {
        const pendingApprovals = snap.docs.filter(
          doc => {
            const data = doc.data();
            return !data.status || data.status === "pending";
          }
        );
  
        setNotificationCount(prev => ({
          ...prev,
          approvals: pendingApprovals.length
        }));
      }
    );
  
    return () => {
      unsub1();
      unsub2();
    };
  }, []);
  const totalCount =
  (notificationCount.applications || 0) +
  (notificationCount.approvals || 0);
const roleAccess = ROLE_ACCESS[role] || { pages: [] };
const searchInputRef = useRef(null);
const QUICK_TILES = [
  { type: "section", title: "Pages" },
  { title: "Home", page: "home" },
  { title: "Calendar", page: "calendar" },
  { title: "Applications", page: "applications" },
  { title: "Accounts", page: "accounts" },
  { title: "Fees", page: "fees" },
  { title: "Income", page: "income" },
  { title: "Expenses", page: "expenses" },
  { title: "Expense List", page: "expenseList" },
  { title: "Journal", page: "journal" },
  { title: "Timetable", page: "timetable" },
  { title: "Attendance", page: "attendance" },
  { title: "Courses", page: "courses" },
  { title: "Inventory", page: "inventory" },
  { title: "Approvals", page: "approvals" },
  { title: "Profile", page: "profile" },
  { title: "Settings", page: "settings" },
  { title: "Upgrade", page: "payment" },

  { type: "section", title: "Account Creation" },

  { title: "Admin", page: "admin", color: "#f08080" },
  { title: "Teacher", page: "teacher", color: "#add8e6" },
  { title: "Student", page: "student", color: "#90ee90" },
  { title: "Parent", page: "parent", color: "rgb(240,170,240)" },
  { title: "Staff", page: "office_staff", color: "#ffa07a" }
];

const filteredQuickTiles = QUICK_TILES.filter(tile =>
  tile.type === "section" || roleAccess.pages.includes(tile.page)
);

  const QuickTile = ({ title, page, onOpen, color }) => {
    return (
      <div
        className="quick-tile"
        onClick={() => onOpen(page)}
      >
        <div
          className="tile-icon"
          style={{ background: color }}
        >
          {title.charAt(0).toUpperCase()}
        </div>
        <span>{title}</span>
      </div>
    );
  };
  useEffect(() => {
    const handleTouch = (e) => {
      const dropdown = dropdownRef.current;
  
      // 🔥 if scrolling → ignore
      if (isScrollingRef.current) return;
  
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target) &&
        (!dropdown || !dropdown.contains(e.target))
      ) {
        searchInputRef.current.blur();
        setShowQuickPanel(false);
      }
    };
  
    document.addEventListener("touchstart", handleTouch);
    document.addEventListener("mousedown", handleTouch);
  
    return () => {
      document.removeEventListener("touchstart", handleTouch);
      document.removeEventListener("mousedown", handleTouch);
    };
  }, []);
  const isScrollingRef = useRef(false);
  useEffect(() => {
    const dropdown = dropdownRef.current;
  
    if (!dropdown) return;
    const handleDropdownScroll = () => {
      isScrollingRef.current = true;
    
      searchInputRef.current?.blur();
    
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    };
  
    dropdown.addEventListener("scroll", handleDropdownScroll);
    dropdown.addEventListener("touchmove", handleDropdownScroll);
    dropdown.addEventListener("wheel", handleDropdownScroll);
  
    return () => {
      dropdown.removeEventListener("scroll", handleDropdownScroll);
      dropdown.removeEventListener("touchmove", handleDropdownScroll);
      dropdown.removeEventListener("wheel", handleDropdownScroll);
    };
  }, [showQuickPanel]);
 
  useEffect(() => {
    const onScroll = () => {
      searchInputRef.current?.blur();     // keyboard close
      setShowQuickPanel(false);           // dropdown close
    };
  
    window.addEventListener("scroll", onScroll);
  
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  

    return (
      <nav style={{margin:"0px"}}className="navbar">
      <div className="nav-left">
          
        <div className="mobile-back">
      <div className="menu-toggle mobile-back-btn" onClick={toggleSidebar}>
      <FaBars />
  </div>
  </div>
  {activePage !== "home" && (
  <div
  className="mobile-back-btn"
  onClick={() => {

    // Settings internal navigation
    if (activePage === "settings") {
      const settingsSection = window.settingsSectionState;
  
      if (settingsSection && settingsSection() !== "home") {
        window.resetSettingsSection();
        return;
      }
    }
  
    // If history available
    setPageHistory(prev => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop();
        const previous = newHistory[newHistory.length - 1];
  
        setActivePage(previous);
        return newHistory;
      }
  
      // Fallback parent navigation
      const parent = PARENT_PAGE[activePage] || "home";
      setActivePage(parent);
  
      return ["home", parent];
    });
  
  }}
  >
  <FaArrowLeft />
  </div>
  )}

    <div className="nav-search">
  <FaSearch className="search-icon-left" />
  <input 
  ref={searchInputRef}
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
  onFocus={() => setShowQuickPanel(true)}
  onBlur={(e) => {
    const dropdown = dropdownRef.current;
  
    // 👇 if focus inside dropdown → close panna koodathu
    if (dropdown && dropdown.contains(e.relatedTarget)) {
      return;
    }
  
    setTimeout(() => setShowQuickPanel(false), 200);
  }}
  />
<div
  className="search-notify-icon"
  onClick={() => {
    handleMenuClick("combined");
  }}
>
<div
  style={{ position: "relative", cursor: "pointer" }}
  onClick={() => handleMenuClick("combined")}
>
  <FaRegBell size={20} />

  {totalCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        background: "red",
        color: "#fff",
        borderRadius: "50%",
        padding: "2px 6px",
        fontSize: 10,
        fontWeight: "bold"
      }}
    >
      {totalCount}
    </span>
  )}
</div>
</div>
  <FaClock
    className="search-history-icon"
    onClick={() => {
      setActivePage("history");
      setSearchQuery("");
      setShowQuickPanel(false);
    }}
  />
  
<div
  className="search-school-icon"
  onClick={() => setAccountPopupOpen(prev => !prev)}
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
  onClick={(e) => {
    e.stopPropagation();
    setAccountPopupOpen(true);
  }}
/>

  ) : (
  <FaSchool />
  )}
    </div>
  {(showQuickPanel || globalResults.length > 0) && (
 <div className="search-dropdown" ref={dropdownRef}>
  <div className="search-header">
  <span className="search-back" onClick={closeSearch}>
  ←
  </span>
  <span className="search-title"></span>
  </div>
  {searchQuery === "" && (
  <div className="quick-row">
   {filteredQuickTiles.map((tile, index) => {
  if (tile.type === "section") {
    return (
      <div key={index} className="quick-title">
        {tile.title}
      </div>
    );
  }

  return (
    <QuickTile
      key={tile.page}
      title={tile.title}
      page={tile.page}
      color={tile.color}
      onOpen={handleMenuClick}
    />
  );
})}
  </div>
)}
{pageResults.length > 0 && (
  <>
    <div className="quick-title">Pages</div>
    <div className="quick-row">
      {pageResults.map((item, i) => (
        <QuickTile
          key={i}
          title={item.label}
          page={item.value}
          onOpen={(page) => {
            handleMenuClick(page);
            setSearchQuery("");
            setShowQuickPanel(false);
            searchInputRef.current?.blur();
          }}
        />
      ))}
    </div>
  </>
)}

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
          searchInputRef.current?.blur(); 
        }

        if (item.type === "student") {
          localStorage.setItem("selectedStudentId", item.id);
          handleMenuClick("student");
          searchInputRef.current?.blur(); 
        }

        if (item.type === "parent") {
          localStorage.setItem("selectedParentId", item.id);
          handleMenuClick("parent");
          searchInputRef.current?.blur(); 
        }

        if (item.type === "admin") {
          localStorage.setItem("selectedAdminId", item.id);
          handleMenuClick("admin");
          searchInputRef.current?.blur(); 
        }

        if (item.type === "office_staff") {
          localStorage.setItem("selectedOfficeStaffId", item.id);
          handleMenuClick("office_staff");
          searchInputRef.current?.blur(); 
        }
        setSearchQuery("");
        setShowQuickPanel(false);
        searchInputRef.current?.blur();
        
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

</>)}
{searchQuery !== "" &&
pageResults.length === 0 &&
peopleResults.length === 0 && (
<div className="no-search-results">
   No search results found
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
  );
};

export default Navbar;
