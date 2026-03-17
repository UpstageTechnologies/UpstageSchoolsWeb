import React from "react";
import FloatingInput from "../../../../components/FloatingInput";
export default function SalaryExpense({
  salaryRole,
  setSalaryRole,
  salaryPosition,
  setSalaryPosition,
  categorySearch,
  setCategorySearch,
  showSalaryCategory,
  setShowSalaryCategory,
  positionSearch,
  setPositionSearch,
  showSalaryPositionDD,
  setShowSalaryPositionDD,
  filteredCategories,
  filteredPositions,
  filteredTeachers,
  filteredNonTeachingStaff,
  teacherSearch,
  setTeacherSearch,
  staffSearch,
  setStaffSearch,
  showTeacherDropdown,
  setShowTeacherDropdown,
  showStaffDropdown,
  setShowStaffDropdown,
  selName,
  setSelName,
  manualSalary,
  setManualSalary,
  getSalaryFromInventory,
  saveSalary,
  safeRequirePremium,
  paymentMode,
setPaymentMode,
showPaymentMode,
setShowPaymentMode
}) 
{
  const [focused, setFocused] = useState(null);
  return (
    <>
     <div className="entry-row">
<div className="student-dropdown">
  <input
    placeholder="Select Category"
    value={salaryRole || categorySearch}
    onChange={e=>{
      setCategorySearch(e.target.value);
      setSalaryRole("");
      setShowSalaryCategory(true);
    }}
    onFocus={()=>setShowSalaryCategory(true)}
  />
  {showSalaryCategory && (
    <div className="student-dropdown-list">
      {filteredCategories.map(cat => (
        <div
          key={cat}
          className="student-option"
          onClick={()=>{
            setSalaryRole(cat);
            setCategorySearch("");
            setShowSalaryCategory(false);
            setSalaryPosition("");      // reset position
            setPositionSearch("");
          }}
        >
          {cat}
        </div>
      ))}
    </div>
  )}
</div>
      <div className="student-dropdown">
  <input
    placeholder="Select Position"
    value={salaryPosition || positionSearch}
    onChange={e => {
      setPositionSearch(e.target.value);
      setSalaryPosition("");
      setShowSalaryPositionDD(true);
    }}
    onFocus={() => salaryRole && setShowSalaryPositionDD(true)}
    disabled={!salaryRole}
  />

  {showSalaryPositionDD && (
    <div className="student-dropdown-list">
      {filteredPositions.map(pos => (
        <div
          key={pos}
          className="student-option"
          onClick={() => {
            setSalaryPosition(pos);
            setPositionSearch("");
            setShowSalaryPositionDD(false);
          }}
        >
          {pos}
        </div>
      ))}

      {filteredPositions.length === 0 && (
        <div className="student-option muted">
          No positions found
        </div>
      )}
    </div>
  )}
</div>
{salaryRole === "Teaching Staff" &&
 salaryPosition === "Teacher" && (

    <div className="student-dropdown">
      <input
        placeholder="Select Teacher"
        value={selName || teacherSearch}
        onChange={e => {
          setTeacherSearch(e.target.value);
          setSelName("");
          setShowTeacherDropdown(true);
        }}
        onFocus={() => setShowTeacherDropdown(true)}
      />

      {showTeacherDropdown && (
        <div className="student-dropdown-list">
          {filteredTeachers.map(t => (
            <div
              key={t.id}
              className="student-option"
              onClick={() => {
                setSelName(t.name);
                setTeacherSearch("");
                setShowTeacherDropdown(false);
                const salaryItem = getSalaryFromInventory(
                  salaryRole,
                  salaryPosition,
                  t.name
                );

                setManualSalary(salaryItem ? salaryItem.amount : "");
              }}
            >
              <strong>{t.name}</strong>
              <span>{t.teacherId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
)}
{salaryRole === "Non Teaching Staff" &&
 salaryPosition && (

    <div className="student-dropdown">
      <input
        placeholder="Select Name"
        value={selName || staffSearch}
        onChange={e => {
          setStaffSearch(e.target.value);
          setSelName("");
          setShowStaffDropdown(true);
        }}
        onFocus={() => setShowStaffDropdown(true)}
      />

      {showStaffDropdown && (
        <div className="student-dropdown-list">
          {filteredNonTeachingStaff.map(staff => (
            <div
              key={staff.id}
              className="student-option"
              onClick={() => {
                setSelName(staff.name);
                setStaffSearch("");
                setShowStaffDropdown(false);

                const salaryItem = getSalaryFromInventory(
                  salaryRole,
                  salaryPosition,
                  staff.name
                );

                setManualSalary(salaryItem ? salaryItem.amount : "");
              }}
            >
              {staff.name}
            </div>
          ))}
        </div>
      )}
    </div>
)}
      <input
  type="number"
  placeholder="Salary"
  value={manualSalary}
  onChange={e => setManualSalary(e.target.value)}
  readOnly
/><div className="student-dropdown">

<input
  placeholder="Payment Mode"
  value={paymentMode || ""}
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

    </div>

    {/* Save row */}
    <div className="entry-row">
      <button
        className="save-btn"
        
        onClick={() => safeRequirePremium(saveSalary, "expense")}
      >
        Save
      </button>
    </div>
  
    </>
  );
}