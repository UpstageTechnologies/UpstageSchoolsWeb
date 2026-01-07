import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import { useNavigate } from "react-router-dom";


export default function ProfitPage({ adminUid, setActivePage }) {

  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  const [entryType, setEntryType] = useState("");

  // ⭐ GLOBAL ENTRY DATE
  const [entryDate, setEntryDate] = useState("");

  // INCOME
  const [incomeMode, setIncomeMode] = useState("");
  const [studentMode, setStudentMode] = useState("");

  // source
  const [srcName, setSrcName] = useState("");
  const [srcAmt, setSrcAmt] = useState("");

  // students / fees
  const [students, setStudents] = useState([]);
  const [feesMaster, setFeesMaster] = useState([]);

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newPayType, setNewPayType] = useState("");
  const [newPayAmount, setNewPayAmount] = useState("");
  const [newTotal, setNewTotal] = useState(0);

  const [oldClass, setOldClass] = useState("");
  const [oldStudent, setOldStudent] = useState("");
  const [oldParent, setOldParent] = useState("");
  const [oldTotal, setOldTotal] = useState(0);
  const [oldPayType, setOldPayType] = useState("");
  const [oldPayAmount, setOldPayAmount] = useState("");

  // EXPENSE
  const [expenseMode, setExpenseMode] = useState("");

  // salary
  const [salaryRole, setSalaryRole] = useState("");          // office | working
  const [salaryPosition, setSalaryPosition] = useState("");  // Principal / Teacher …
  const [selName, setSelName] = useState("");                // typed person name
  const [manualSalary, setManualSalary] = useState("");

  // other expense
  const [exName, setExName] = useState("");
  const [exAmt, setExAmt] = useState("");

  // FEE MASTER
  const [feeClass, setFeeClass] = useState("");
  const [feeName, setFeeName] = useState("");
  
  const [feeAmount, setFeeAmount] = useState("");

  const incomesRef  = collection(db,"users",adminUid,"Account","accounts","Income");
  const expensesRef = collection(db,"users",adminUid,"Account","accounts","Expenses");
  const studentsRef = collection(db,"users",adminUid,"Account","accounts","Students");
  const feesRef     = collection(db,"users",adminUid,"Account","accounts","FeesMaster");

  useEffect(()=>{

    if(!adminUid) return;

    onSnapshot(incomesRef, s=>setIncomeList(s.docs.map(d=>({id:d.id,...d.data()}))));
    onSnapshot(expensesRef,s=>setExpenseList(s.docs.map(d=>({id:d.id,...d.data()}))));
    onSnapshot(studentsRef,s=>setStudents(s.docs.map(d=>({id:d.id,...d.data()}))));
    onSnapshot(feesRef,   s=>setFeesMaster(s.docs.map(d=>({id:d.id,...d.data()}))));
  },[adminUid]);

  const getClassTotal = cls =>
    feesMaster.filter(f=>f.className===cls).reduce((t,f)=>t+(f.amount||0),0);

  /* ---------- INCOME: SOURCE ---------- */
  const saveSourceIncome = async ()=>{
    if(!srcName||!srcAmt||!entryDate) return alert("Fill all source fields");

    await addDoc(incomesRef,{
      source:true,
      studentName:srcName,
      paidAmount:Number(srcAmt),
      date:entryDate,
      createdAt:new Date()
    });

    setSrcName(""); setSrcAmt("");
  };

  /* ---------- INCOME: NEW ADMISSION ---------- */
  const saveNewAdmission = async ()=>{
    if(!newName||!newParent||!newClass||!newPayType||!entryDate)
      return alert("Fill all fields");

    const total = getClassTotal(newClass);
    setNewTotal(total);

    let final = 0;
    if(newPayType==="full") final = total - total*0.05;
    else{
      if(!newPayAmount) return alert("Enter partial amount");
      final = Number(newPayAmount);
    }

    const st = await addDoc(studentsRef,{
      name:newName,parentName:newParent,className:newClass,createdAt:new Date()
    });

    await addDoc(incomesRef,{
      studentId:st.id,
      studentName:newName,
      parentName:newParent,
      className:newClass,
      totalFees:total,
      type:newPayType,
      paidAmount:final,
      date:entryDate,
      createdAt:new Date()
    });

    setNewName("");setNewParent("");setNewClass("");
    setNewPayType("");setNewPayAmount("");setNewTotal(0);
  };

  /* ---------- INCOME: OLD ADMISSION ---------- */
  const selectOldClass = cls=>{
    setOldClass(cls);
    setOldStudent(""); setOldParent("");
    setOldTotal(getClassTotal(cls));
  };

  const selectOldStudent = id=>{
    setOldStudent(id);
    const s = students.find(x=>x.id===id);
    if(s) setOldParent(s.parentName||"");
  };

  const saveOldAdmission = async ()=>{
    const stu = students.find(s=>s.id===oldStudent);
    if(!stu||!oldPayType||!entryDate) return alert("Fill all fields");

    let final = 0;
    if(oldPayType==="full") final = oldTotal-oldTotal*0.05;
    else{
      if(!oldPayAmount) return alert("Enter partial amount");
      final = Number(oldPayAmount);
    }

    await addDoc(incomesRef,{
      studentId:stu.id,
      studentName:stu.name,
      parentName:stu.parentName,
      className:stu.className,
      totalFees:oldTotal,
      type:oldPayType,
      paidAmount:final,
      date:entryDate,
      createdAt:new Date()
    });

    setOldClass("");setOldStudent("");setOldParent("");
    setOldPayType("");setOldPayAmount("");setOldTotal(0);
  };

  /* ---------- EXPENSE: OTHERS ---------- */
  const navigate = useNavigate();

  const saveExpense = async ()=>{
    if(!exName||!exAmt||!entryDate) return alert("Fill expense");

    await addDoc(expensesRef,{
      type:"other",
      name:exName,
      amount:Number(exAmt),
      date:entryDate,
      createdAt:new Date()
    });

    setExName(""); setExAmt("");
  };

  /* ---------- EXPENSE: SALARY ---------- */
  const saveSalary = async ()=>{
    if(!salaryRole||!salaryPosition||!selName||!manualSalary||!entryDate)
      return alert("Fill all salary fields");

    await addDoc(expensesRef,{
      type:"salary",
      role:salaryRole,
      position:salaryPosition,
      name:selName,
      amount:Number(manualSalary),
      date:entryDate,
      createdAt:new Date()
    });

    setSalaryRole("");setSalaryPosition("");setSelName("");setManualSalary("");
  };

  /* ---------- FEE MASTER ---------- */
  const saveFee = async ()=>{
    if(!feeClass||!feeName||!feeAmount||!entryDate) return alert("Fill fields");

    await addDoc(feesRef,{
      className:feeClass,
      name:feeName,
      amount:Number(feeAmount),
      date:entryDate,
      createdAt:new Date()
    });

    setFeeClass("");setFeeName("");setFeeAmount("");
  };

  const totalIncome = incomeList.reduce((t,x)=>t+(x.paidAmount||0),0);
  const totalExpense= expenseList.reduce((t,x)=>t+(x.amount||0),0);
  const profit = totalIncome-totalExpense;

  return (
    
    <div className="accounts-wrapper fade-in">
      
      <div className="accounts-wrapper fade-in">

  <div className="stats-grid">

    <div className="info-card1">
      <div className="label">Total Income</div>
      <div className="value">₹{totalIncome}</div>
    </div>

    <div className="info-card2">
      <div className="label">Total Expenses</div>
      <div className="value">₹{totalExpense}</div>
    </div>

    <div className="info-card3">
      <div className="label">Profit</div>
      <div
        className="value"
        style={{ color: profit >= 0 ? "green" : "red" }}
      >
        ₹{profit}
      </div>
    </div>

  </div>

</div>



      <div className="section-card pop entries-card">
  <h3 className="section-title">Entries</h3>


        {/* ⭐ GLOBAL DATE */}
        <input
          type="date"
          value={entryDate}
          onChange={e=>setEntryDate(e.target.value)}
          style={{marginBottom:12}}
        />

        <select value={entryType} onChange={e=>setEntryType(e.target.value)}>
          <option value="">Choose</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="fees">Set Fees</option>
        </select>

        {/* ================= INCOME ================= */}
        {entryType==="income" && (
          <>
            <div style={{marginTop:10}}>
              <select value={incomeMode} onChange={e=>setIncomeMode(e.target.value)}>
                <option value="">Select</option>
                <option value="source">Source</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* SOURCE */}
            {incomeMode==="source" && (
              <div className="form-grid">
                <input placeholder="Source name" value={srcName} onChange={e=>setSrcName(e.target.value)} />
                <input type="number" placeholder="Amount" value={srcAmt} onChange={e=>setSrcAmt(e.target.value)} />
                <button className="primary-btn glow" onClick={saveSourceIncome}>Save</button>
              </div>
            )}

            {/* STUDENT */}
            {incomeMode==="student" && (
              <>
                <select value={studentMode} onChange={e=>setStudentMode(e.target.value)} style={{marginTop:10}}>
                  <option value="">Select</option>
                  <option value="new">New Admission</option>
                  <option value="old">Old Admission</option>
                </select>

                {/* NEW */}
                {studentMode==="new" && (
                  <div className="form-grid">
                  
                    <input placeholder="Student Name" value={newName} onChange={e=>setNewName(e.target.value)} />
                    <input placeholder="Parent Name" value={newParent} onChange={e=>setNewParent(e.target.value)} />
                  
                    <select value={newClass} onChange={e=>{setNewClass(e.target.value);setNewTotal(getClassTotal(e.target.value));}}>
                      <option value="">Class</option>
                      {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  
                    <input readOnly value={newTotal?`Total ₹${newTotal}`:""} />

                    <select value={newPayType} onChange={e=>setNewPayType(e.target.value)}>
                      <option value="">Payment Type</option>
                      <option value="full">Full (5% OFF)</option>
                      <option value="partial">Partial</option>
                    </select>

                    {newPayType==="full" &&
                      <input readOnly value={`Payable ₹${(newTotal-newTotal*0.05).toFixed(0)}`} />}

                    {newPayType==="partial" &&
                      <input type="number" placeholder="Enter Amount" value={newPayAmount} onChange={e=>setNewPayAmount(e.target.value)} />}

                    <button className="primary-btn glow" onClick={saveNewAdmission}>Save</button>
                  </div>
                )}

                {/* OLD */}
                {studentMode==="old" && (
                  <div className="form-grid">
                    
                    <select value={oldClass} onChange={e=>selectOldClass(e.target.value)}>
                      <option value="">Class</option>
                      {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map(c=><option key={c}>{c}</option>)}
                    </select>

                    <select value={oldStudent} onChange={e=>selectOldStudent(e.target.value)}>
                      <option value="">Student</option>
                      {students.filter(s=>s.className===oldClass).map(s=>(
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    <input readOnly value={oldParent?`Parent: ${oldParent}`:""} />
                    <input readOnly value={oldTotal?`Total ₹${oldTotal}`:""} />
                    <select value={oldPayType} onChange={e=>setOldPayType(e.target.value)}>
                      <option value="">Payment Type</option>
                      <option value="full">Full (5% OFF)</option>
                      <option value="partial">Partial</option>
                    </select>

                    {oldPayType==="full" &&
                      <input readOnly value={`Payable ₹${(oldTotal-oldTotal*0.05).toFixed(0)}`} />}

                    {oldPayType==="partial" &&
                      <input type="number" placeholder="Enter Amount" value={oldPayAmount} onChange={e=>setOldPayAmount(e.target.value)} />}

                    <button className="primary-btn glow" onClick={saveOldAdmission}>Save</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ================= EXPENSE ================= */}
        {entryType==="expense" && (
          <>
            <select style={{marginTop:10}} value={expenseMode} onChange={e=>setExpenseMode(e.target.value)}>
              <option value="">Choose Expense</option>
              <option value="salary">Salary</option>
              <option value="others">Others</option>
            </select>

            {/* SALARY */}
            {expenseMode==="salary" && (
              <>
                <select
                  style={{marginTop:10}}
                  value={salaryRole}
                  onChange={e=>{setSalaryRole(e.target.value);setSalaryPosition("");setSelName("");}}
                >
                  <option value="">Select Category</option>
                  <option value="office">Office Staff</option>
                  <option value="working">Working Staff</option>
                </select>

                <div className="form-grid">

                  {/* position dropdown */}
                  <select
                    value={salaryPosition}
                    onChange={e=>setSalaryPosition(e.target.value)}
                  >
                    <option value="">Select Position</option>

                    {salaryRole==="office" && (
                      <>
                        <option value="Principal">Principal</option>
                        <option value="Clerk">Clerk</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Office Assistant">Office Assistant</option>
                      </>
                    )}

                    {salaryRole==="working" && (
                      <>
                        <option value="Teacher">Teacher</option>
                        <option value="Driver">Driver</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Watchman">Watchman</option>
                        <option value="Helper">Helper</option>
                      </>
                    )}
                  </select>

                  {/* name typing */}
                  <input
                    placeholder="Person Name"
                    value={selName}
                    onChange={e=>setSelName(e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Salary"
                    value={manualSalary}
                    onChange={e=>setManualSalary(e.target.value)}
                  />

                  <button className="primary-btn glow" onClick={saveSalary}>Save Salary</button>
                </div>
              </>
            )}

            {/* OTHERS */}
            {expenseMode==="others" && (
              <div className="form-grid">
                <input placeholder="Expense name" value={exName} onChange={e=>setExName(e.target.value)} />
                <input type="number" placeholder="Amount" value={exAmt} onChange={e=>setExAmt(e.target.value)} />
                <button className="primary-btn glow" onClick={saveExpense}>Save Expense</button>
              </div>
            )}
          </>
        )}

        {/* SET FEES */}
        {entryType==="fees" && (
          <div className="form-grid">
            <select value={feeClass} onChange={e=>setFeeClass(e.target.value)}>
              <option value="">Class</option>
              {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
                .map(c=><option key={c}>{c}</option>)}
            </select>

            <input placeholder="Fee Name" value={feeName} onChange={e=>setFeeName(e.target.value)} />
            <input type="number" placeholder="Amount" value={feeAmount} onChange={e=>setFeeAmount(e.target.value)} />
            <button className="primary-btn glow" onClick={saveFee}>Save Fee</button>
          </div>
        )}

      </div>

        <div className="nice-table-wrapper">
          <table className="nice-table">
            <thead><tr><th>Name / Source</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
  {(() => {

    // 1️⃣ MERGE BOTH LISTS
    const all = [
      ...incomeList.map(i => ({
        id: i.id,
        date: i.date,
        source: i.studentName || i.name || "Income",
        type: "Income",
        amount: i.paidAmount || 0
      })),

      ...expenseList.map(e => ({
        id: e.id,
        date: e.date,
        source: e.name,
        type: "Expense",
        amount: e.amount || 0
      }))
    ];

    // 2️⃣ SORT BY DATE
    all.sort((a,b) => (a.date > b.date ? -1 : 1));

    // 3️⃣ GROUP + DISPLAY
    let lastDate = null;

    return all.map(row => (
      <React.Fragment key={row.id}>

        {/* DATE HEADING */}
        {lastDate !== row.date && (
          <>
            <tr className="date-heading">
              <td data-label="Date"colSpan={4} style={{fontWeight:"bold", background:"#f3f3f3"}}>
                {lastDate = row.date}
              </td>
            </tr>
            
          </>
        )}

        {/* ROW */}
        <tr>
          <td data-label="Name/Source">{row.source}</td>
          <td data-label="Type">{row.type}</td>
          <td data-label="Amount">₹{row.amount}</td>
         
        </tr>

      </React.Fragment>
    ));

  })()}
</tbody>

          </table>
        </div>
      </div>
  );
}
