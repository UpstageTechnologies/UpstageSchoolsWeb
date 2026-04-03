import React, { useState } from "react";
import ApplicationList from "./ApplicationList";
import Approvals from "./Approvals";
import "../../components/IntroPopup.css";
const CombinedPage = ({ requirePremium, notificationCount }) => {
  const [activeTab, setActiveTab] = useState("applications");
  const isSkipped = localStorage.getItem("skipAppGuide") === "true";
  const [showGuide, setShowGuide] = useState(!isSkipped);

  const appCount = notificationCount?.applications || 0;
  const approvalCount = notificationCount?.approvals || 0;

  return (
    <div style={{ padding: 20 }}>
      
      {/* 🔥 Heading */}
      <h2 style={{ textAlign: "center", marginBottom: 10 }}>
        Applications & Approvals
      </h2>
      {showGuide && (
  <div className="guide-banner">
    <p>
      Manage all your school applications and approvals here.

      Applications from students, teachers, and staff will appear in the Applications tab.

      Admin can review and approve requests in the Approvals tab.

      Then click <strong>Finish</strong> to continue.
    </p>

    <button
      className="finish-btn"
      onClick={() => {
        setShowGuide(false);
        localStorage.setItem("skipAppGuide", "true");

        window.setActivePageDirect &&
          window.setActivePageDirect("home");
      }}
    >
      Finish →
    </button>
  </div>
)}
      {/* 🔘 Toggle Wrapper */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#e5e7eb",
            borderRadius: 30,
            padding: 5,
            width: 320,
          }}
        >
          {/* 🟦 Applications */}
          <div
            onClick={() => setActiveTab("applications")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 0",
              borderRadius: 25,
              cursor: "pointer",
              background:
                activeTab === "applications" ? "#3b82f6" : "transparent",
              color: activeTab === "applications" ? "#fff" : "#000",
              fontWeight: 600,
              transition: "0.2s",
            }}
          >
            Applications

            {appCount > 0 && (
              <span
                style={{
                  background:
                    activeTab === "applications" ? "#fff" : "#ef4444",
                  color:
                    activeTab === "applications" ? "#3b82f6" : "#fff",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {appCount}
              </span>
            )}
          </div>
          <div
            onClick={() => setActiveTab("approvals")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 0",
              borderRadius: 25,
              cursor: "pointer",
              background:
                activeTab === "approvals" ? "#3b82f6" : "transparent",
              color: activeTab === "approvals" ? "#fff" : "#000",
              fontWeight: 600,
              transition: "0.2s",
            }}
          >
            Approvals

            {approvalCount > 0 && (
              <span
                style={{
                  background:
                    activeTab === "approvals" ? "#fff" : "#ef4444",
                  color:
                    activeTab === "approvals" ? "#3b82f6" : "#fff",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {approvalCount}
              </span>
            )}
          </div>
        </div>
      </div>
      <div>
        {activeTab === "applications" && (
          <ApplicationList requirePremium={requirePremium} />
        )}

        {activeTab === "approvals" && (
          <Approvals requirePremium={requirePremium} />
        )}
      </div>
    </div>
  );
};

export default CombinedPage;