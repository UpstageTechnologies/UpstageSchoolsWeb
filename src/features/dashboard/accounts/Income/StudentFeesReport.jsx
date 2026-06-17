import React, { useMemo, useState } from "react";

export default function StudentFeesReport({
  students = [],
  feesMaster = [],
  incomeList = [],
}) {
    const [showFeesModal, setShowFeesModal] = useState(false);
const [selectedFees, setSelectedFees] = useState([]);
const [modalTitle, setModalTitle] = useState("");
const [expandedRows, setExpandedRows] = useState({});
const toggleRow = (key) => {
  setExpandedRows(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};
  const [search, setSearch] = useState("");

  const reportData = useMemo(() => {

    return students
      .filter(student => {

        if (!search.trim()) return true;

        const q = search.toLowerCase();

        return (
          student.studentName?.toLowerCase().includes(q) ||
          student.class?.toLowerCase().includes(q)
        );
      })
      .map(student => {

        const classFees = feesMaster.filter(
          fee =>
            fee.type === "fees" &&
            String(fee.className).trim() ===
              String(student.class).trim()
        );

        const paidFees = [];
        const pendingFees = [];

        let totalBalance = 0;

        classFees.forEach(fee => {

          const payments = incomeList.filter(
            i =>
              i.studentId === student.id &&
              (
                i.feeId === fee.id ||
                (
                  i.feeType === "Tuition" &&
                  fee.feeType === "Tuition"
                )
              )
          );

          const paidAmount = payments.reduce(
            (sum, p) => sum + Number(p.paidAmount || 0),
            0
          );

          const payable =
            fee.amount -
            (fee.amount * Number(fee.discount || 0)) / 100;

          const balance = Math.max(
            0,
            payable - paidAmount
          );

          if (paidAmount > 0) {
            paidFees.push(fee.name);
          }

          if (balance > 0) {
            pendingFees.push(fee.name);
          }

          totalBalance += balance;
        });

        return {
          studentName: student.studentName,
          className: student.class,
          paidFees,
          pendingFees,
          balance: totalBalance
        };
      });

  }, [students, feesMaster, incomeList, search]);

  return (
    <div className="section-card pop">

      <div className="history-controls">

        <h3 className="section-title">
          Student Fees Report
        </h3>

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="table-search"
        />

      </div>

      <table className="history-table">

        <thead>
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Fees Paid</th>
            <th>Pending Fees</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>

          {reportData.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{ textAlign: "center" }}
              >
                No Records
              </td>
            </tr>
          ) : (

            reportData.map((row, index) => (
<React.Fragment key={index}>
<tr>

                <td>{row.studentName}</td>

                <td>{row.className}</td>
<td style={{ whiteSpace: "normal", lineHeight: "1.6" }}>
  {(expandedRows[`paid-${index}`]
    ? row.paidFees
    : row.paidFees.slice(0, 3)
  ).map((fee, i) => (
    <div key={i}>• {fee}</div>
  ))}

  {row.paidFees.length > 3 && (
    <div
      style={{
        color: "#6d28d9",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: 6
      }}
      onClick={() => toggleRow(`paid-${index}`)}
    >
      {expandedRows[`paid-${index}`]
        ? "▲ Show Less"
        : `▼ +${row.paidFees.length - 3} More`}
    </div>
  )}
</td>
<td style={{ whiteSpace: "normal", lineHeight: "1.6" }}>
  {(expandedRows[`pending-${index}`]
    ? row.pendingFees
    : row.pendingFees.slice(0, 3)
  ).map((fee, i) => (
    <div key={i}>• {fee}</div>
  ))}

  {row.pendingFees.length > 3 && (
    <div
      style={{
        color: "red",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: 6
      }}
      onClick={() => toggleRow(`pending-${index}`)}
    >
      {expandedRows[`pending-${index}`]
        ? "▲ Show Less"
        : `▼ +${row.pendingFees.length - 3} More`}
    </div>
  )}
</td>

                <td
                  style={{
                    color:
                      row.balance > 0
                        ? "red"
                        : "green",
                    fontWeight: 600
                  }}
                >
                  ₹{row.balance}
                </td>

              </tr>
              
</React.Fragment>
            ))
          )}

        </tbody>

      </table>
      {showFeesModal && (
  <div className="fees-modal-overlay">
    <div className="fees-modal">

      <div className="fees-modal-header">
        <h3>{modalTitle}</h3>

        <button
          onClick={() =>
            setShowFeesModal(false)
          }
        >
          ✕
        </button>
      </div>

      <div className="fees-modal-body">
        {selectedFees.map((fee, idx) => (
          <div
            key={idx}
            className="fee-row"
          >
            • {fee}
          </div>
        ))}
      </div>

    </div>
  </div>
)}

    </div>
  );
}