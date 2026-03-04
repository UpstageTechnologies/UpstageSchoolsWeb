import React from "react";
import { FaTrash } from "react-icons/fa";
import "../../../dashboard_styles/accounts.css"
export default function EntriesTable({
  incomeList,
  expenseList,
  entryDate,
  isOfficeStaff,
  deleteEntry,
  setActivePage,
  currentPageIndex,
  totalPages,
  prevPage,
  nextPage,
  getVisiblePages,
  goToPage
}) {

  const all = [
    ...incomeList
      .filter(i => i.date === entryDate)
      .map(i => ({
        id: i.id,
        type: "income",
        date: i.date,
        source: i.competitionName || i.studentName || i.name || "Income",
        income: isOfficeStaff ? "***" : (i.paidAmount || 0),
        expense: "",
        studentId: i.studentId || null
      })),

    ...expenseList
      .filter(e => e.date === entryDate)
      .map(e => ({
        id: e.id,
        type: "expense",
        date: e.date,
        source: e.name,
        income: "",
        expense: isOfficeStaff ? "***" : (e.amount || 0),
        studentId: null
      }))
  ];

  all.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date > b.date ? -1 : 1;
    }
    return a.source.localeCompare(b.source);
  });

  let lastDate = null;
  let dateIncomeTotal = 0;
  let dateExpenseTotal = 0;

  return (
    <div className="nice-table-wrapper">
      <table className="nice-table1">
        <thead>
          <tr>
            <th>Description</th>
            <th>Income</th>
            <th>Expense</th>
            <th>Bill</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {all.map((row, index) => {
            const nextRow = all[index + 1];
            const isLastOfDate =
              !nextRow || nextRow.date !== row.date;

            dateIncomeTotal += Number(row.income) || 0;
            dateExpenseTotal += Number(row.expense) || 0;

            return (
              <React.Fragment key={row.id}>
                {lastDate !== row.date && (
                  <tr className="date-heading">
                    <td colSpan={5} style={{ fontWeight: "bold", background: "#f3f3f3" }}>
                      {lastDate = row.date}
                    </td>
                  </tr>
                )}

                <tr>
                  <td>{row.source}</td>

                  <td style={{ color: "green" }}>
                    {row.income === "***"
                      ? "***"
                      : row.income
                      ? `₹${row.income}`
                      : ""}
                  </td>

                  <td style={{ color: "red" }}>
                    {row.expense === "***"
                      ? "***"
                      : row.expense
                      ? `₹${row.expense}`
                      : ""}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {row.type === "income" && row.studentId && (
                      <span
                        style={{
                          cursor: "pointer",
                          color: "#2140df",
                          fontSize: 18
                        }}
                        onClick={() =>
                          setActivePage(
                            `bill_${row.studentId}_${row.date}`
                          )
                        }
                      >
                        invoice
                      </span>
                    )}
                  </td>

                  <td className="action-cell">
                    <button
                      className="delete-btn"
                      onClick={() => deleteEntry(row)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>

                {isLastOfDate && (
                  <tr style={{ fontWeight: "bold", background: "#fafafa" }}>
                    <td>TOTAL</td>
                    <td style={{ color: "green" }}>
                      ₹{dateIncomeTotal}
                    </td>
                    <td style={{ color: "red" }}>
                      ₹{dateExpenseTotal}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                )}

                {isLastOfDate && (() => {
                  dateIncomeTotal = 0;
                  dateExpenseTotal = 0;
                })()}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="pagination-bar">
        <div className="tab-buttons">

          <button
            className="tab-btn"
            disabled={currentPageIndex === 0}
            onClick={prevPage}
          >
            Previous
          </button>

          {getVisiblePages().map(i => (
            <button
              key={i}
              className={`tab-btn ${i === currentPageIndex ? "active" : ""}`}
              onClick={() => goToPage(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="tab-btn"
            disabled={currentPageIndex === totalPages - 1}
            onClick={nextPage}
          >
            Next
          </button>

        </div>
      </div>
    </div>
  );
}