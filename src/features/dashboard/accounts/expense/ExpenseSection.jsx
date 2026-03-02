import React from "react";
import SalaryExpense from "./SalaryExpense";
import OtherExpense from "./OtherExpense";
import StudentMiscExpense from "./StudentMiscExpense";

export default function ExpenseSection({
  expenseMode,
  setExpenseMode,
  showExpenseType,
  setShowExpenseType,
  ...props
}) {
  return (
    <>
      {/* Expense Type Selector */}
      <div className="popup-select">
        <div
          className="popup-input"
          onClick={() => setShowExpenseType(!showExpenseType)}
        >
          {expenseMode || "Choose Expense"}
          <span>▾</span>
        </div>

        {showExpenseType && (
          <div className="popup-menu">
            <div onClick={() => { setExpenseMode("salary"); setShowExpenseType(false); }}>
              Salary
            </div>
            <div onClick={() => { setExpenseMode("others"); setShowExpenseType(false); }}>
              Others
            </div>
            <div onClick={() => { setExpenseMode("student_misc"); setShowExpenseType(false); }}>
              Student Miscellaneous
            </div>
          </div>
        )}
      </div>

      {expenseMode === "salary" && <SalaryExpense {...props} />}
      {expenseMode === "others" && <OtherExpense {...props} />}
      {expenseMode === "student_misc" && <StudentMiscExpense {...props} />}
    </>
  );
}