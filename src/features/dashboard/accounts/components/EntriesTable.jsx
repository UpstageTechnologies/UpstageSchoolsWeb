import React from "react";
import { FaArrowLeft, FaArrowRight, FaFileInvoice, FaTrash } from "react-icons/fa";
import "../../../dashboard_styles/ios.css"
import "../../../dashboard_styles/History.css"

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
  goToPage,
  searchText,
  fromDate,
  toDate,
  activityType,
  appliedFilter
}) {
  let all = [
    ...incomeList.map(i => ({
      id: i.id,
      type: "income",
      date: i.date,
      source: i.competitionName || i.studentName || i.name || "Income",
      income: i.paidAmount || 0,
      expense: "",
      mode: i.paymentMode || "",
      hidden: isOfficeStaff,
      studentId: i.studentId || null
    })),
  
    ...expenseList.map(e => ({
      id: e.id,
      type: "expense",
      date: e.date,
      source: e.name,
      income: "",
      expense: e.amount || 0,
      mode: e.paymentMode || "",
      hidden: isOfficeStaff,
      studentId: null
    }))
  ];
  
  if (appliedFilter) {

    const { searchText, fromDate, toDate, activityType } = appliedFilter;
  
    if (searchText) {
      all = all.filter(row =>
        row.source?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  
    if (fromDate) {
      all = all.filter(row => row.date >= fromDate);
    }
  
    if (toDate) {
      all = all.filter(row => row.date <= toDate);
    }
  
    if (activityType) {
      all = all.filter(row => row.type === activityType);
    }
  
  } else {
    // 👉 DEFAULT → selected date
    all = all.filter(row => row.date === entryDate);
  }
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
    <div style={{marginTop:10}}className="section-card pop">
      <div className="print-area">
      <table className="history-table
">
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

              dateIncomeTotal += row.hidden ? 0 : Number(row.income || 0);
              dateExpenseTotal += row.hidden ? 0 : Number(row.expense || 0);

            return (
              <React.Fragment key={row.id}>
                {lastDate !== row.date && (
                  <tr >
                    <td colSpan={5} style={{ fontWeight: "bold", background: "white" }}>
                      {lastDate = row.date}
                    </td>
                  </tr>
                )}

                <tr>
                  <td>{row.source}</td>

                  <td style={{ color: "green" }}>
  {row.income
    ? row.hidden
      ? `***(${row.mode === "Cash" ? "C" : "A"})`
      : `₹${row.income}(${row.mode === "Cash" ? "C" : "A"})`
    : ""}
</td>
<td style={{ color: "red" }}>
  {row.expense
    ? row.hidden
      ? `***(${row.mode === "Cash" ? "C" : "A"})`
      : `₹${row.expense}(${row.mode === "Cash" ? "C" : "A"})`
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
                        <span
  className="invoice-btn"
  onClick={() =>
    setActivePage(`bill_${row.studentId}_${row.date}`)
  }
>
  <FaFileInvoice className="icon" />
  <span className="label">invoice</span>
</span>
                      </span>
                    )}
                  </td>

                  <td className="table-actions">
  <button
    className="entry-delete-btn"
    onClick={() => deleteEntry(row)}
    aria-label="Delete entry"
  >
    <FaTrash className="icon" />
    <span className="label">Delete</span>
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
       </div>

      {/* PAGINATION */}
      <div className="pagination-bar">
        <div className="tab-buttons">

          <button
            className="tab-btn"
            disabled={currentPageIndex === 0}
            onClick={prevPage}
          >
            <FaArrowLeft/>
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
            <FaArrowRight/>
          </button>

        </div>
      </div>
    </div>
   
  );
}