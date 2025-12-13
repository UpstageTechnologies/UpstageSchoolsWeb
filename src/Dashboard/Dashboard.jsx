import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaUserCircle, FaHome, FaCog, FaSignOutAlt } from "react-icons/fa";
import schoolLogo from "./school-logo.png";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState("");
  const [menuOpen, setMenuOpen] = useState(true); // start open
  const navigate = useNavigate();

  const goToUpgrade = () => {
    navigate("/payment");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSchool(userData.school || "");
        }
      } else {
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/logout");
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className={`sidebar ${menuOpen ? "sidebar-open" : "sidebar-close"}`}>
        <ul>
          <li><FaHome /> Home</li>
          <li onClick={goToUpgrade}><FaSignOutAlt /> Upgrade</li>
          <li><FaCog /> Settings</li>
          <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* NAVBAR */}
        <nav className="navbar">
  {/* LEFT: Hamburger + School */}
  <div className="nav-left">
    <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
      ☰
    </div>
    <img src={schoolLogo} alt="School Logo" className="nav-school-logo" />
    <span className="nav-school-name">{school || "School Name"}</span>
  </div>

  {/* RIGHT: User */}
  <div className="user-info">
    <FaUserCircle className="user-icon" />
    <span className="username">
      {user?.displayName || user?.email.split("@")[0]}
    </span>
  </div>
</nav>


      
        <div className="dashboard-content">
          {/* Your content goes here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
