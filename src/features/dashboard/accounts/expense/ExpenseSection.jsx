import React from "react";
import SalaryExpense from "./SalaryExpense";
import OtherExpense from "./OtherExpense";
import StudentMiscExpense from "./StudentMiscExpense";
import { useState } from "react";
export default function ExpenseSection({
  expenseMode,
  setExpenseMode,
  showExpenseType,
  setShowExpenseType,
  ...props
}) {

  const EXPENSE_TYPES = [
    { value:"salary", label:"Salary"},
    { value:"others", label:"Others"},
    { value:"student_misc", label:"Competition Misc"}
   ];

  return (
    <>
      {/* Expense Type Selector */}
      <div className="popup-select">
        <div
          className="popup-input"
          onClick={() => setShowExpenseType(!showExpenseType)}
        >
         {
  EXPENSE_TYPES.find(t => t.value === expenseMode)?.label
  || "Choose Expense"
}
          <span>▾</span>
        </div>

        {showExpenseType && (
          <div className="popup-menu">
            {EXPENSE_TYPES.map(type => (
  <div
    key={type.value}
    onClick={() => {
      setExpenseMode(type.value);
      setShowExpenseType(false);
    }}
  >
    {type.label}
  </div>
))}
          </div>
        )}
      </div>

      {expenseMode === "salary" && <SalaryExpense {...props} />}
      {expenseMode === "others" && <OtherExpense {...props} />}
      {expenseMode === "student_misc" && <StudentMiscExpense {...props} />}
    </>
  );
}