import React from "react";
import "../dashboard_styles/SubDashboard.css";

const SubDashboard = () => {
  const type = localStorage.getItem("viewType");
  const name = localStorage.getItem("viewName");
  const id = localStorage.getItem("viewId");

  const titleMap = {
    admin: "Admin Dashboard",
    teacher: "Teacher Dashboard",
    parent: "Parent Dashboard",
    office_staff: "Office Staff Dashboard"
  };

  return (
    <div className="sub-wrapper">
      <div className="sub-container">

        {/* HEADER */}
        <div className="sub-header">
          <h1>{titleMap[type] || "Dashboard"}</h1>
          <div className="sub-profile">
  {localStorage.getItem("profilePhoto") ? (
    <img
      src={localStorage.getItem("profilePhoto")}
      alt="profile"
      className="profile-image"
    />
  ) : (
    <div className="avatar">
      {name?.charAt(0)}
    </div>
  )}

  <div>
    <div className="profile-name">{name}</div>
    <div className="profile-role">{type}</div>
  </div>
</div>

        </div>

        {/* TOP CARDS */}
        <div className="top-cards">
          <div className="card white">
            <h3>ID</h3>
            <p>{id}</p>
          </div>

          <div className="card green">
            <h2>5</h2>
            <span>Active Tasks</span>
          </div>

          <div className="card yellow">
            <h2>10</h2>
            <span>Pending Items</span>
          </div>

          <div className="card orange">
            <h2>3</h2>
            <span>Alerts</span>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-section">
          <h3>Overview</h3>

          <div className="table-row">
            <div className="row-name">
             {localStorage.getItem("profilePhoto") ? (
  <img
    src={localStorage.getItem("profilePhoto")}
    alt="mini"
    className="mini-image"
  />
) : (
  <div className="mini-avatar">
    {name?.charAt(0)}
  </div>
)}

              <span>{name}</span>
            </div>

            <div className="progress">
              <div className="progress-bar"></div>
            </div>

            <div className="badge green-badge">Good</div>
          </div>

          <div className="table-row">
            <div className="row-name">
              <div className="mini-avatar">A</div>
              <span>Sample Data</span>
            </div>

            <div className="progress yellow-progress">
              <div className="progress-bar"></div>
            </div>

            <div className="badge yellow-badge">Average</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubDashboard;
