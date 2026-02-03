import { FaArrowLeft, FaSearch, FaSchool } from "react-icons/fa";
import QuickTile from "../QuickTile";

const Navbar = ({
  toggleSidebar,
  activePage,
  handleMenuClick,

  searchQuery,
  setSearchQuery,
  showQuickPanel,
  setShowQuickPanel,

  showSchoolName,
  setShowSchoolName,
  school,
  logo,

  globalResults,
  pageResults,
  peopleResults,

  closeSearch,
  highlightText,
  badgeColors,

  setGlobalResults,
  viewAs
}) => {

  return (
    <nav className="navbar">

{/* LEFT */}
<div className="nav-left">

  <div className="menu-toggle" onClick={toggleSidebar}>
    ☰
  </div>

  {activePage !== "home" && (
    <div
      className="mobile-back-btn"
      onClick={() => handleMenuClick("home")}
    >
      <FaArrowLeft />
    </div>
  )}

</div>

{/* SEARCH */}
<div className="nav-search">

  <FaSearch className="search-icon-left" />

  <input
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) =>
      setSearchQuery(e.target.value.toLowerCase())
    }
    onFocus={() => setShowQuickPanel(true)}
    onBlur={() =>
      setTimeout(() => setShowQuickPanel(false), 200)
    }
  />

{/* SCHOOL */}
<div
  className="search-school-icon"
  onClick={() => setShowSchoolName(prev => !prev)}
>

{showSchoolName && (
  <div className="school-name-popup">
    {school || "School Name"}
  </div>
)}

{logo ? <img src={logo} alt="school"/> : <FaSchool />}

</div>

{/* DROPDOWN */}
{(showQuickPanel || globalResults.length > 0) && (

<div className="search-dropdown">

<div className="search-header">
  <span className="search-back" onClick={closeSearch}>
    ←
  </span>
</div>

{/* QUICK */}
{searchQuery === "" && (
<>
<div className="quick-row">
  <QuickTile title="Calendar" page="calendar" onOpen={handleMenuClick}/>
  <QuickTile title="Applications" page="applications" onOpen={handleMenuClick}/>
  <QuickTile title="Accounts" page="accounts" onOpen={handleMenuClick}/>
  <QuickTile title="Timetable" page="timetable" onOpen={handleMenuClick}/>
  <QuickTile title="Approvals" page="approvals" onOpen={handleMenuClick}/>
  <QuickTile title="Courses" page="courses" onOpen={handleMenuClick}/>
</div>

<div className="quick-title">Account Creation</div>

<div className="quick-row">
  <QuickTile title="Admin" page="admin" color="#f08080" onOpen={handleMenuClick}/>
  <QuickTile title="Teacher" page="teacher" color="#add8e6" onOpen={handleMenuClick}/>
  <QuickTile title="Student" page="student" color="#90ee90" onOpen={handleMenuClick}/>
  <QuickTile title="Parent" page="parent" color="rgb(240,170,240)" onOpen={handleMenuClick}/>
  <QuickTile title="Staff" page="office_staff" color="#ffa07a" onOpen={handleMenuClick}/>
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
    onOpen={handleMenuClick}
  />
))}
</div>
</>
)}

{/* PEOPLE */}
{peopleResults.map((item,i)=>(
<div
 key={i}
 className="search-item"
 onClick={()=>{
   if(item.type==="teacher")
     localStorage.setItem("selectedTeacherId",item.id);

   if(item.type==="student")
     localStorage.setItem("selectedStudentId",item.id);

   if(item.type==="parent") 
     localStorage.setItem("selectedParentId",item.id);

   if(item.type==="admin")
     localStorage.setItem("selectedAdminId",item.id);

   if(item.type==="office_staff")
     localStorage.setItem("selectedOfficeStaffId",item.id);

   handleMenuClick(item.type);
   setSearchQuery("");
   setGlobalResults([]);
 }}
>

<span>{highlightText(item.label,searchQuery)}</span>

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

{searchQuery !== "" &&
 pageResults.length===0 &&
 peopleResults.length===0 && (
   <div className="no-search-results">
     ❌ No search results found
   </div>
 )}

</div>
)}

</div>

{/* EXIT PARENT VIEW */}
{viewAs==="parent" && (
<button
 onClick={()=>{
   localStorage.removeItem("viewAs");
   localStorage.removeItem("viewParentId");
   localStorage.removeItem("parentName");
   window.location.reload();
 }}
>
 Exit Parent View
</button>
)}

</nav>
  );
};

export default Navbar;
