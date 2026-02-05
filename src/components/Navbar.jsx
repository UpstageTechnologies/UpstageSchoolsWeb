import React from "react";
import {
  FaSearch,
  FaArrowLeft,
  FaSchool,
  FaClock,
  FaBars
} from "react-icons/fa";
import "../features/dashboard_styles/navbar.css";


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

  viewAs
}) => {
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
  

    return (
      <nav className="navbar">
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
  setPageHistory(prev => {
  if (prev.length <= 1) return prev;

  const newHistory = [...prev];
  newHistory.pop();              // remove current
  const previous = newHistory[newHistory.length - 1];

  setActivePage(previous);
  return newHistory;
  });
  }}
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
  <div className="search-header">
  <span className="search-back" onClick={closeSearch}>
  ←
  </span>
  <span className="search-title"></span>
  </div>
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
  </div>   </>
  )}
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

</>)}
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
  );
};

export default Navbar;
