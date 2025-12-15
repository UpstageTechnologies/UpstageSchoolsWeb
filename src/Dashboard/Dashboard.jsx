import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  FaUserCircle,
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import schoolLogo from "./school-logo.png";
import Teacher from "./Teacher";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState("");
  const [plan, setPlan] = useState("basic");
  const [planExpiry, setPlanExpiry] = useState(null);

  const [menuOpen, setMenuOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const navigate = useNavigate();

  const goToUpgrade = () => navigate("/payment");

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  /* 🔹 Format Firestore Timestamp */
  const formatDate = (timestamp) => {
    if (!timestamp) return "No Expiry";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* 🔹 Auth + Firestore fetch */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(currentUser);

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        setSchool(userData.school || "");
        setPlan(userData.plan || "basic");
        setPlanExpiry(userData.planExpiry || null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <div className={`sidebar ${menuOpen ? "sidebar-open" : "sidebar-close"}`}>
        <ul>
          <li onClick={() => setActivePage("home")}>
            <FaHome /> Home
          </li>

          <li onClick={goToUpgrade}>
            <FaSignOutAlt /> Upgrade
          </li>

          {/*  PLAN INFO */}
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



          {(plan === "premium" || plan === "lifetime") && (
            <>
              <li onClick={toggleAccountMenu} className="account-main">
                <FaUserCircle /> Account Creation
                {accountMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </li>

              {accountMenuOpen && (
                <ul className="account-submenu">
                  <li
                    onClick={() => {
                      setActivePage("teacher");
                      setAccountMenuOpen(false);
                    }}
                  >
                    Teacher
                  </li>

                  <li onClick={() => navigate("/account")}>Parent</li>
                  <li onClick={() => navigate("/account")}>Student</li>
                </ul>
              )}
            </>
          )}

          <li>
            <FaCog /> Settings
          </li>

          <li onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      {/* ================= MAIN ================= */}
      <div className="main-content">
        <nav className="navbar">
          <div className="nav-left">
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </div>
            <img
              src={schoolLogo}
              alt="School Logo"
              className="nav-school-logo"
            />
            <span className="nav-school-name">
              {school || "School Name"}
            </span>
          </div>

          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="username">
              {user?.displayName || user?.email.split("@")[0]}
            </span>
          </div>
        </nav>

        <div className="dashboard-content">
          {activePage === "home" && <h2>Welcome Dashboard</h2>}
          {activePage === "teacher" && user && (
            <Teacher adminUid={user.uid} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
