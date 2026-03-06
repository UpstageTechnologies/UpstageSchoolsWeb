import React, { useState } from "react";

import Admin from "../features/dashboard/Admin";
import Teacher from "../features/dashboard/Teacher";
import Parent from "../features/dashboard/Parent";
import OfficeStaff from "../features/dashboard/OfficeStaff";
import Student from "../features/dashboard/Student";

const accountOptions = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Parent", value: "parent" },
  { label: "Office Staff", value: "staff" },
  { label: "Student", value: "student" }
];

function CreateAccountSection() {

  const [showForm, setShowForm] = useState(false);
  const [accountType, setAccountType] = useState("");

  const renderForm = () => {
    switch (accountType) {
      case "admin":
        return <Admin formOnly />;
      case "teacher":
        return <Teacher formOnly />;
      case "parent":
        return <Parent formOnly />;
      case "staff":
        return <OfficeStaff formOnly />;
      case "student":
        return <Student formOnly />;
      default:
        return null;
    }
  };

  return (
    <div className="section-card entries-card">

      {/* CREATE ACCOUNT BUTTON */}
      <button
        className="primary-btn glow"
        onClick={() => setShowForm(prev => !prev)}
      >
        Create Account
      </button>

      {showForm && (
        <div className="entry-box">

          {/* ACCOUNT TYPE SELECT */}
          <div className="entry-row">

            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="">Select Account</option>

              {accountOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}

            </select>

          </div>

          {/* FORM RENDER */}
          {renderForm()}

        </div>
      )}

    </div>
  );
}

export default CreateAccountSection;