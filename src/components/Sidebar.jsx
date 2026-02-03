import {
    FaUserCircle,
    FaHome,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronUp,
    FaUserGraduate,
    FaUserCheck,
    FaClipboardCheck,
    FaBookOpen,
    FaWpforms,
    FaSignOutAlt
  } from "react-icons/fa";
  
  const Sidebar = ({
    sidebarState,
    role,
    activePage,
    handleMenuClick,
    plan,
    planExpiry,
    accountMenuOpen,
    setAccountMenuOpen,
    userMenuOpen,
    setUserMenuOpen,
    handleLogout,
    isOfficeStaff,
    viewAs,
    trialAccess,
    trialExpiresAt,
    formatDate
  }) => {
  
    return (
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
    );
  };
  export default Sidebar;
  