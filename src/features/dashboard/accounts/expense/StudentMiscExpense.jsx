import React from "react";

export default function StudentMiscExpense({
  miscName,
  setMiscName,
  miscSearch,
  setMiscSearch,
  showMiscDropdown,
  setShowMiscDropdown,

  expenseSubName,
  setExpenseSubName,
  expenseNameSearch,
  setExpenseNameSearch,
  showExpenseNameDD,
  setShowExpenseNameDD,

  expenseNames,
  miscNames,

  exAmt,
  setExAmt,

  saveStudentMiscExpense,
  safeRequirePremium
}) {
  return (
    
        <div className="entry-row">
      
          {/* 🔽 Miscellaneous Name */}
          <div className="student-dropdown">
            <input
              placeholder="Miscellaneous Name"
              value={miscName || miscSearch}
              onChange={e => {
                setMiscSearch(e.target.value);
                setMiscName("");
                setShowMiscDropdown(true);
              }}
              onFocus={() => setShowMiscDropdown(true)}
            />
      
            {showMiscDropdown && (
              <div className="student-dropdown-list">
      
                {miscNames
                  .filter(n =>
                    n?.toLowerCase().includes(miscSearch.toLowerCase())
                  )
                  .map(name => (
                    <div
                      key={name}
                      className="student-option"
                      onClick={() => {
                        setMiscName(name);
                        setMiscSearch("");
                        setShowMiscDropdown(false);
                      }}
                    >
                      {name}
                    </div>
                  ))}
      
                {miscSearch && (
                  <div
                    className="student-option"
                    style={{ color: "#2563eb" }}
                    onClick={() => {
                      setMiscName(miscSearch);
                      setShowMiscDropdown(false);
                    }}
                  >
                    ➕ Add "{miscSearch}"
                  </div>
                )}
      
              </div>
            )}
          </div>
      
          <div className="student-dropdown">
        <input
          placeholder="Expense Name"
          value={expenseSubName || expenseNameSearch}
          onChange={e => {
            setExpenseNameSearch(e.target.value);
            setExpenseSubName("");
            setShowExpenseNameDD(true);
          }}
          onFocus={() => setShowExpenseNameDD(true)}
        />
      
        {showExpenseNameDD && (
          <div className="student-dropdown-list">
      
            {expenseNames
              .filter(n =>
                n?.toLowerCase().includes(expenseNameSearch.toLowerCase())
              )
              .map(name => (
                <div
                  key={name}
                  className="student-option"
                  onClick={() => {
                    setExpenseSubName(name);
                    setExpenseNameSearch("");
                    setShowExpenseNameDD(false);
                  }}
                >
                  {name}
                </div>
              ))}
      
            {expenseNameSearch && (
              <div
                className="student-option"
                style={{ color: "#2563eb" }}
                onClick={() => {
                  setExpenseSubName(expenseNameSearch);
                  setExpenseNameSearch("");
                  setShowExpenseNameDD(false);
                }}
              >
                ➕ Add "{expenseNameSearch}"
              </div>
            )}
      
          </div>
        )}
      </div>
      
      
          {/* 🔢 Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={exAmt}
            onChange={e => setExAmt(e.target.value)}
          />
      
          <button
            className="save-btn"
            onClick={() => safeRequirePremium(saveStudentMiscExpense, "expense")}
          >
            Save
          </button>
      
        </div>
    
  );
}