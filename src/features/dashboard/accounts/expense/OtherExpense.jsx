import React from "react";
import { addDoc } from "firebase/firestore";
export default function OtherExpense({
  exName,
  setExName,
  exAmt,
  setExAmt,
  expenseSearch,
  setExpenseSearch,
  showExpenseDD,
  setShowExpenseDD,
  expenseListMaster,
  expenseMasterRef,
  saveExpense,
  safeRequirePremium,
  paymentMode,
setPaymentMode,
showPaymentMode,
setShowPaymentMode
}) {
  return (
    <div className="entry-row">
      <div className="student-dropdown">
  <input
    placeholder="Expense Name"
    value={exName || expenseSearch}
    onChange={e => {
      setExpenseSearch(e.target.value);
      setExName("");
      setShowExpenseDD(true);
    }}
    onFocus={() => setShowExpenseDD(true)}
  />

  {showExpenseDD && (
    <div className="student-dropdown-list">

      {expenseListMaster
        .filter(e =>
          e.name?.toLowerCase().includes(expenseSearch.toLowerCase())
        )
        .map(e => (
          <div
            key={e.id}
            className="student-option"
            onClick={() => {
              setExName(e.name);
              setExpenseSearch("");
              setShowExpenseDD(false);
            }}
          >
            {e.name}
          </div>
        ))}

      {expenseSearch && (
        <div
          className="student-option"
          style={{ color: "#2563eb" }}
          onClick={async () => {
            const exists = expenseListMaster.some(
              e =>
                e.name &&
                e.name.toLowerCase() === expenseSearch.toLowerCase()
            );
          
            if (!exists) {
              await addDoc(expenseMasterRef, {
                name: expenseSearch,
                createdAt: new Date()
              });
            }
          
            setExName(expenseSearch);
            setExpenseSearch("");
            setShowExpenseDD(false);
          }}
        >
          ➕ Add "{expenseSearch}"
        </div>
      )}

    </div>
  )}
</div>
      <input type="number" placeholder="Amount" value={exAmt} onChange={e=>setExAmt(e.target.value)} /><div className="student-dropdown">

<input
  placeholder="Payment Mode"
  value={paymentMode}
  readOnly
  onClick={() => setShowPaymentMode(!showPaymentMode)}
/>

{showPaymentMode && (
  <div className="student-dropdown-list">

    <div
      className="student-option"
      onClick={()=>{
        setPaymentMode("Cash");
        setShowPaymentMode(false);
      }}
    >
      Cash
    </div>

    <div
      className="student-option"
      onClick={()=>{
        setPaymentMode("Account");
        setShowPaymentMode(false);
      }}
    >
      Account
    </div>

  </div>
)}

</div>
      <button className="save-btn" onClick={() => safeRequirePremium(saveExpense,"expense")}>
        Save
      </button>
    </div>
  );
}

