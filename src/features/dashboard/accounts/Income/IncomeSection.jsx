    import React from "react";

    function IncomeSection(props) {

        const {
            incomeMode,
            studentMode,
            incomeType,
            showIncomeType,
            setShowIncomeType,
            setIncomeType,
            setIncomeMode,
            setStudentMode,
            showStudentType,
            setShowStudentType,
            saveSourceIncome,
            saveNewAdmission,
            saveOldAdmission,
            saveCompetitionIncome,
            safeRequirePremium,
        
            srcName,
            setSrcName,
            srcAmt,
            setSrcAmt,
            sourceSearch,
            setSourceSearch,
            sourceList,
            showSourceDD,
            setShowSourceDD,
        
            newName,
            setNewName,
            newParent,
            setNewParent,
            newClass,
            setNewClass,
            newClassSearch,
            setNewClassSearch,
            showNewClassDropdown,
            setShowNewClassDropdown,
        
            selectedFees,
            setSelectedFees,
            showFeesDropdown,
            setShowFeesDropdown,
        
            paymentType,
            setPaymentType,
            paymentSearch,
            setPaymentSearch,
            showPaymentDD,
            setShowPaymentDD,
            filteredPaymentTypes,
        
            newPayType,
            setNewPayType,
            newPayAmount,
            setNewPayAmount,
            discount,
            isFullPayment,
        
            oldClass,
            setOldClass,
            oldStudent,
            setOldStudent,
            oldParent,
            setOldParent,
            oldPayType,
            setOldTotal,
            setOldPayType,
            oldPayAmount,
            setOldPayAmount,
            selectedStudentName,
            setSelectedStudentName,
            studentSearch,
            setStudentSearch,
            filteredStudents,
        
            competitionClass,
            setCompetitionClass,
            competitionStudent,
            setCompetitionStudent,
            competitionName,
            setCompetitionName,
            competitionAmount,
            setCompetitionAmount,
            competitionList,
            competitionSearch,
            setCompetitionSearch,
            showCompetitionDropdown,
            setShowCompetitionDropdown,
            showClassDropdown,
setShowClassDropdown,
showStudentDropdown,
setShowStudentDropdown,

            classes,
            students,
        
            getClassTotal,
            getClassFees,
            getFeePaid,
            getFeeBalance,
            getTermAmountUI,
            getNewTermAmount,
          
            paymentMode,
            setPaymentMode,
            showPaymentMode,
            setShowPaymentMode,   
        } = props;

    return (
        <>
        {/* ===== TOP SELECT ROW ===== */}
        <div className="entry-row source">

            <div className="popup-select">
            <div
                className="popup-input"
                onClick={() => setShowIncomeType(!showIncomeType)}
            >
                {incomeType || "Select"}
                <span>▾</span>
            </div>

            {showIncomeType && (
                <div className="popup-menu">
                <div
                    onClick={() => {
                    setIncomeType("Source");
                    setIncomeMode("source");
                    setStudentMode("");
                    setShowIncomeType(false);
                    }}
                >
                    Source
                </div>

                <div
                    onClick={() => {
                    setIncomeType("Student");
                    setIncomeMode("student");
                    setShowIncomeType(false);
                    }}
                >
                    Student
                </div>

                <div
                    onClick={() => {
                    setIncomeType("Competition");
                    setIncomeMode("competition");
                    setShowIncomeType(false);
                    }}
                >
                    Competition
                </div>
                </div>
            )}
            </div>

            {incomeMode === "student" && (
            <div className="popup-select">
                <div
                className="popup-input"
                onClick={() => setShowStudentType(!showStudentType)}
                >
                {studentMode
                    ? studentMode === "new"
                    ? "New Admission"
                    : "Old Admission"
                    : "Type"}
                <span>▾</span>
                </div>

                {showStudentType && (
                <div className="popup-menu">
                    <div
                    onClick={() => {
                        setStudentMode("new");
                        setShowStudentType(false);
                    }}
                    >
                    New Admission
                    </div>

                    <div
                    onClick={() => {
                        setStudentMode("old");
                        setShowStudentType(false);
                    }}
                    >
                    Old Admission
                    </div>
                </div>
                )}
            </div>
            )}
        </div>

        {/* 🔥 NOW BELOW THIS – paste your SOURCE / NEW / OLD / COMPETITION blocks */}
            {incomeMode === "source" && (
        <div className="entry-row source">

    <div className="student-dropdown">
    <input
        placeholder="Source Name"
        value={srcName || sourceSearch}
        onChange={e => {
        setSourceSearch(e.target.value);
        setSrcName("");
        setShowSourceDD(true);
        }}
        onFocus={() => setShowSourceDD(true)}
    />

    {showSourceDD && (
        <div className="student-dropdown-list">

        {sourceList
            .filter(s =>
            s.name?.toLowerCase().includes(sourceSearch.toLowerCase())
            )
            .map(s => (
            <div
                key={s.id}
                className="student-option"
                onClick={() => {
                setSrcName(s.name);
                setSourceSearch("");
                setShowSourceDD(false);
                }}
            >
                {s.name}
            </div>
            ))}

        {sourceSearch && (
            <div
            className="student-option"
            style={{ color: "#2563eb" }}
            onClick={async () => {
                const exists = sourceList.some(
                s =>
                    (s.name || "").toLowerCase() === sourceSearch.toLowerCase()
                );
            
                if (!exists) {
                await addDoc(sourceMasterRef, {
                    name: sourceSearch,
                    createdAt: new Date()
                });
                }
            
                setSrcName(sourceSearch);
                setSourceSearch("");
                setShowSourceDD(false);
            }}
            >
            ➕ Add "{sourceSearch}"
            </div>
        )}

        </div>
    )}
    </div>
    <input
  type="number"
  placeholder="Amount"
  value={srcAmt}
  onChange={e => setSrcAmt(e.target.value)}
/>

{/* PAYMENT MODE */}
<div className="popup-select">
  <div
    className="popup-input"
    onClick={() => setShowPaymentMode(!showPaymentMode)}
  >
    {paymentMode || "Payment"}
    <span>▾</span>
  </div>

  {showPaymentMode && (
    <div className="popup-menu">
      <div onClick={()=>{
        setPaymentMode("Cash");
        setShowPaymentMode(false);
      }}>Cash</div>

      <div onClick={()=>{
        setPaymentMode("Account");
        setShowPaymentMode(false);
      }}>Account</div>
    </div>
  )}
</div>

            <button className="save-btn" onClick={() => safeRequirePremium(saveSourceIncome, "income")}>
            Save
            </button>
        </div>
        )}
        {incomeMode === "competition" && (
  <div className="entry-row source">

    {/* CLASS */}
    <div className="student-dropdown">
      <input
        placeholder="Select Class"
        value={competitionClass}
        readOnly
        onClick={() => setShowClassDropdown(true)}
      />

      {showClassDropdown && (
        <div className="student-dropdown-list">
          {classes.map(cls => (
            <div
              key={cls}
              className="student-option"
              onClick={() => {
                setCompetitionClass(cls);
                setShowClassDropdown(false);
                setShowStudentDropdown(true);
              }}
            >
              Class {cls}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* STUDENT */}
    <div className="student-dropdown">
      <input
        placeholder="Select Student"
        value={competitionStudent || studentSearch}
        onChange={e => {
          setStudentSearch(e.target.value);
          setCompetitionStudent("");
          setShowStudentDropdown(true);
        }}
        onFocus={() => setShowStudentDropdown(true)}
      />

      {showStudentDropdown && (
        <div className="student-dropdown-list">
          {students
            .filter(s =>
              s.class === competitionClass &&
              s.studentName
                ?.toLowerCase()
                .includes(studentSearch.toLowerCase())
            )
            .map(s => (
              <div
                key={s.id}
                className="student-option"
                onClick={() => {
                  setCompetitionStudent(s.studentName);
                  setStudentSearch("");
                  setShowStudentDropdown(false);
                }}
              >
                {s.studentName}
              </div>
            ))}
        </div>
      )}
    </div>
{/* COMPETITION NAME */}
<div className="student-dropdown">

  <input
    placeholder="Competition Name"
    value={competitionName || competitionSearch}
    onChange={e => {
      setCompetitionSearch(e.target.value);
      setCompetitionName("");
      setShowCompetitionDropdown(true);
    }}
    onFocus={() => setShowCompetitionDropdown(true)}
  />

  {showCompetitionDropdown && (
    <div className="student-dropdown-list">

{competitionList
  .filter(c =>
    c.name?.toLowerCase().includes(competitionSearch.toLowerCase())
  )
  .map(c => (
    <div
      key={c.id}
      className="student-option"
      onClick={() => {
        setCompetitionName(c.name);     // ✅ correct
        setCompetitionAmount(c.amount);
        setCompetitionSearch("");
        setShowCompetitionDropdown(false);
      }}
      
    >
      {c.name} – ₹{c.amount}
    </div>
  ))}


      {competitionSearch && (
        <div
          className="student-option"
          style={{ color: "#2563eb" }}
          onClick={() => {
            setCompetitionName(competitionSearch);
            setShowCompetitionDropdown(false);
          }}
        >
          ➕ Add "{competitionSearch}"
        </div>
      )}

    </div>
  )}

</div>


    {/* AMOUNT */}
    <input
      type="number"
      placeholder="Amount"
      value={competitionAmount}
      onChange={e => setCompetitionAmount(e.target.value)}
    />

    <button
      className="save-btn"
      onClick={() => safeRequirePremium(saveCompetitionIncome,"income")}
    >
      Save
    </button>

  </div>
)}
{/* ================= NEW STUDENT ================= */}
{incomeMode === "student" && studentMode === "new" && (
    <div className="entry-row source">
<div className="student-dropdown">

<input
  placeholder="Student Name"
  value={newName || studentSearch}
  onChange={e => {
    setStudentSearch(e.target.value);
    setNewName("");
    setShowStudentDropdown(true);
  }}
  onFocus={() => setShowStudentDropdown(true)}
/>

{showStudentDropdown && (
  <div className="student-dropdown-list">

    {/* Existing students */}
    

    {/* ➕ Add New Name */}
    {studentSearch &&
      !students.some(
        s =>
          s.studentName?.toLowerCase() ===
          studentSearch.toLowerCase()
      ) && (
        <div
          className="student-option"
          style={{ color: "#2563eb", fontWeight: 600 }}
          onClick={() => {
            setNewName(studentSearch);
            setStudentSearch("");
            setShowStudentDropdown(false);
          }}
        >
          ➕ Add "{studentSearch}"
        </div>
      )}

  </div>
)}

</div>

<input
  placeholder="Parent Name"
  value={newParent}
  onChange={e => setNewParent(e.target.value)}
/>{/* CLASS DROPDOWN (NEW ADMISSION) */}
<div className="student-dropdown">

  <input
    placeholder="Select Class"
    value={newClass || newClassSearch}
    onChange={e => {
      setNewClassSearch(e.target.value);
      setNewClass("");
      setShowNewClassDropdown(true);
    }}
    onFocus={() => setShowNewClassDropdown(true)}
  />

  {showNewClassDropdown && (
    <div className="student-dropdown-list">

      {classes
        .filter(c =>
          c.toLowerCase().includes(newClassSearch.toLowerCase())
        )
        .map(cls => (
          <div
            key={cls}
            className="student-option"
            onClick={() => {
              setNewClass(cls);
              setNewClassSearch("");
              setShowNewClassDropdown(false);
              setNewTotal(getClassTotal(cls));
            }}
          >
            Class {cls}
          </div>
        ))}

      {classes.length === 0 && (
        <div className="student-option muted">
          No classes found
        </div>
      )}

    </div>
  )}

</div>

        {/* ===== SELECT FEES FROM INVENTORY ===== */}
<div className="student-dropdown">
  <input
    placeholder="Select Fees"
    value={
      selectedFees.length
        ? selectedFees[0]?.name || ""
        : ""
    }
    readOnly
    onClick={()=>setShowFeesDropdown(!showFeesDropdown)}/>
  {showFeesDropdown && (
    <div className="student-dropdown-list">
      {getClassFees(newClass || oldClass).map(fee => {
        const already = selectedFees.some(x=>x.id===fee.id);
        return (
          <div
            key={fee.id}
            className="student-option"
            style={{background: already ? "#eef7ff" : ""}}
            onClick={()=>{
              setSelectedFees([fee]);     // only one selection
              setShowFeesDropdown(false); // auto close dropdown
            }}>
            {fee.name} — ₹{fee.amount}
          </div>
        );
      })}
    </div>
  )}
</div>
{selectedFees[0] && (
  <input readOnly value={`Fee Total ₹${selectedFees[0].amount}`} />
)} <div className="student-dropdown">
          
  <input
    placeholder="Select Payment Type"
    value={paymentType || paymentSearch}
    onChange={e => {
      setPaymentSearch(e.target.value);
      setPaymentType("");
      setShowPaymentDD(true);
    }}
    onFocus={() => setShowPaymentDD(true)}
  />

  {showPaymentDD && (
    <div className="student-dropdown-list">
      {filteredPaymentTypes.map(type => (
        <div
          key={type}
          className="student-option"
          onClick={() => {
            setPaymentType(type);
            const lower = type.toLowerCase().replace(" ", "");
            setNewPayType(lower);
          
            // 🔥 AUTO TERM AMOUNT
            if (lower.startsWith("term")) {
              const fee = selectedFees[0];
              if (fee) {
                setNewPayAmount(getNewTermAmount(fee));
              }
            }
          
            setPaymentSearch("");
            setShowPaymentDD(false);
          }}
          
          
        >
          {type}
        </div>
      ))}

      {filteredPaymentTypes.length === 0 && (
        <div className="student-option muted">No result</div>
      )}
    </div>
  )}
</div>

{isFullPayment && selectedFees[0] && (
  <input
    readOnly
    value={`Payable ₹${selectedFees[0].amount - discount}`}
  />
)}

{newPayType === "partial" && (
  <input
    type="number"
    placeholder="Enter Amount"
    value={newPayAmount}
    onChange={e => setNewPayAmount(e.target.value)}
  />
)}

{newPayType.startsWith("term") && (
  <input
    readOnly
    value={`Payable ₹${newPayAmount}`}
  />
)}
        <button className="save-btn" onClick={() => safeRequirePremium(saveNewAdmission, "income")}>
          Save
        </button>


      </div>
    )}
    {incomeMode === "student" && studentMode === "old" && (
  <div className="entry-row source">

   {/* CLASS DROPDOWN */}
<div className="student-dropdown">

<input
  placeholder="Select Class"
  value={oldClass}
  readOnly
  onClick={() => setShowClassDropdown(!showClassDropdown)}
/>

{showClassDropdown && (
  <div className="student-dropdown-list">
    {classes.map(cls => (
      <div
        key={cls}
        className="student-option"
        onClick={() => {
          setOldClass(cls);
          setShowClassDropdown(false);   // 🔥 close after select
          setShowStudentDropdown(true); // auto open student dropdown
        }}
      >
        Class {cls}
      </div>
    ))}
  </div>
)}
</div>


    {/* Student Search */}
    <div className="student-dropdown">
    <input
  placeholder="Select Student"
  value={selectedStudentName || studentSearch}
  onChange={e => {
    setStudentSearch(e.target.value);
    setSelectedStudentName("");
    setShowStudentDropdown(true);
  }}
  onFocus={() => setShowStudentDropdown(true)}
/>
{showStudentDropdown && (
  <div className="student-dropdown-list">

        {filteredStudents.length === 0 && (
          <div className="student-option muted">No students</div>
        )}

        {filteredStudents.map(s => (
          <div
            key={s.id}
            className="student-option"
            onClick={() => {
              setOldStudent(s.id);
              setSelectedStudentName(s.studentName);
              setOldParent(s.parentName || "");
              setStudentSearch("");
              setOldClass(s.class);
              setOldTotal(getClassTotal(s.class));   // 🔥 THIS LINE
              setShowStudentDropdown(false);
            }}            
          >
            <strong>{s.studentName}</strong>
            <span>Class {s.class}</span>
          </div>
        ))}
      
      </div>
)}
    </div>
    
    <input readOnly value={oldParent ? `Parent: ${oldParent}` :""} 
    placeholder="Parent Name"/>
    {/* ===== SELECT FEES FROM INVENTORY ===== */}
<div className="student-dropdown">
  <input
    placeholder="Select Fees"
    value={
      selectedFees.length
        ? selectedFees[0]?.name || ""

        : ""
    }
    readOnly
    onClick={()=>setShowFeesDropdown(!showFeesDropdown)}
  />

  {showFeesDropdown && (
    <div className="student-dropdown-list">
      {getClassFees(newClass || oldClass).map(fee => {
        const already = selectedFees.some(x=>x.id===fee.id);

        return (
          <div
            key={fee.id}
            className="student-option"
            style={{background: already ? "#eef7ff" : ""}}
            onClick={()=>{
              setSelectedFees([fee]);     // only one selection
              setShowFeesDropdown(false); // auto close dropdown
            }}
            
          >
            {fee.name} — ₹{fee.amount}
          </div>
        );
      })}
    </div>
  )}
</div>
{selectedFees[0] && (
  <input readOnly value={`Fee Total ₹${selectedFees[0].amount}`} />
)}
    <div className="student-dropdown">
  <input
    placeholder="Select Payment Type"
    value={paymentType || paymentSearch}
    onChange={e => {
      setPaymentSearch(e.target.value);
      setPaymentType("");
      setShowPaymentDD(true);
    }}
    onFocus={() => setShowPaymentDD(true)}
  />

  {showPaymentDD && (
    <div className="student-dropdown-list">
{["Full","Partial","Monthly","Term 1","Term 2","Term 3"]

  .filter(p =>
    p.toLowerCase().includes(paymentSearch.toLowerCase())
  )
  .map(type => (

        <div
          key={type}
          className="student-option"
          onClick={() => {
            const lower = type.toLowerCase().replace(" ", "");
          
            setPaymentType(type);
            setOldPayType(lower);
            setPaymentSearch("");
            setShowPaymentDD(false);
          }}
          
        >
          {type}
        </div>
      ))}
    </div>
  )}
</div>
{/* FULL PAYMENT */}
{oldPayType === "full" && oldStudent && selectedFees[0] && (
  <input
    readOnly
    value={`Payable ₹${
      getFeePaid(oldStudent, selectedFees[0].id) === 0
        ? Math.ceil(
          selectedFees[0].amount -
          selectedFees[0].amount *
            ((selectedFees[0].discount || 0) / 100)
        )
        
        : getFeeBalance(oldStudent, selectedFees[0])
    }`}
  />
)}

{/* TERM 1 & TERM 2 → READONLY */}
{(oldPayType === "term1" || oldPayType === "term2") &&
  oldStudent &&
  selectedFees[0] && (
    <input
      readOnly
      value={`Payable ₹${getTermAmountUI(oldStudent, selectedFees[0])}`}
    />
)}

{/* 🔥 TERM 3 → MANUAL INPUT */}
{oldPayType === "term3" && (
  <input
    type="number"
    placeholder="Enter Term 3 Amount"
    value={oldPayAmount}
    onChange={e => setOldPayAmount(e.target.value)}
  />
)}

{/* PARTIAL */}
{oldPayType === "partial" && (
  <input
    type="number"
    placeholder="Enter Amount"
    value={oldPayAmount}
    onChange={e => setOldPayAmount(e.target.value)}
  />
)}{oldPayType === "monthly" && (
  <input
    type="number"
    placeholder="Enter First Month Amount"
    value={oldPayAmount}
    onChange={e => setOldPayAmount(e.target.value)}
  />
)}
    <button className="save-btn" onClick={() => safeRequirePremium(saveOldAdmission, "income")}>
      Save
    </button>

    {oldStudent && selectedFees[0] && (
  <div className="balance-text">
    Balance ₹{getFeeBalance(oldStudent, selectedFees[0])}
  </div>
)}
  </div>
)}</>
);
}
export default React.memo(IncomeSection);