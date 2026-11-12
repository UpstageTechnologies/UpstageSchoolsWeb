import React, { useMemo } from "react";
import { FaArrowLeft, FaArrowRight, FaFileInvoice, FaTrash, FaEdit } from "react-icons/fa";
import "../../../dashboard_styles/ios.css";
import "../../../dashboard_styles/History.css";

export default function EntriesTable({
  incomeList = [],
  expenseList = [],
  entryDate,
  isOfficeStaff = false,
  deleteEntry,
  onEditEntry,
  deletingId,
  setActivePage,
  currentPageIndex = 0,
  totalPages = 0,
  prevPage,
  nextPage,
  getVisiblePages,
  goToPage,
  searchText = "",
  fromDate = "",
  toDate = "",
  activityType = "",
  appliedFilter = null
}) {
  const all = useMemo(() => {
    const list = [
      ...incomeList.map(i => ({
        ...i,
        id: i.id,
        docId: i.id,
        type: "income",
        date: i.date || "",
        source: i.competitionName || i.studentName || i.name || "Income",
        income: i.paidAmount ?? 0,
        expense: "",
        mode: i.paymentMode || "",
        hidden: isOfficeStaff,
        studentId: i.studentId || null,
        rawItem: i
      })),

      ...expenseList.map(e => ({
        ...e,
        id: e.id,
        docId: e.id,
        type: "expense",
        date: e.date || "",
        source: e.name || e.miscName || "Expense",
        income: "",
        expense: e.amount ?? 0,
        mode: e.paymentMode || "",
        hidden: isOfficeStaff,
        studentId: null,
        rawItem: e
      }))
    ];

    let filtered = list;

    if (appliedFilter) {
      const { searchText: sText, fromDate: fDate, toDate: tDate, activityType: aType } = appliedFilter;

      if (sText) {
        filtered = filtered.filter(row =>
          (row.source || "").toLowerCase().includes(sText.toLowerCase())
        );
      }
      if (fDate) {
        filtered = filtered.filter(row => row.date >= fDate);
      }
      if (tDate) {
        filtered = filtered.filter(row => row.date <= tDate);
      }
      if (aType) {
        filtered = filtered.filter(row => row.type === aType);
      }
    } else {
      // Direct / live filters if appliedFilter is not explicitly set
      if (searchText) {
        filtered = filtered.filter(row =>
          (row.source || "").toLowerCase().includes(searchText.toLowerCase())
        );
      }
      if (fromDate) {
        filtered = filtered.filter(row => row.date >= fromDate);
      }
      if (toDate) {
        filtered = filtered.filter(row => row.date <= toDate);
      }
      if (activityType) {
        filtered = filtered.filter(row => row.type === activityType);
      }

      // Default: If no search or date filter is applied, show only the selected entryDate
      if (!searchText && !fromDate && !toDate && !activityType) {
        filtered = filtered.filter(row => row.date === entryDate);
      }
    }

    filtered.sort((a, b) => {
      if (a.date !== b.date) {
        return (a.date || "") > (b.date || "") ? -1 : 1;
      }
      return (a.source || "").localeCompare(b.source || "");
    });

    return filtered;
  }, [incomeList, expenseList, entryDate, isOfficeStaff, searchText, fromDate, toDate, activityType, appliedFilter]);

  const dateTotals = useMemo(() => {
    const totals = {};
    for (const row of all) {
      if (!totals[row.date]) {
        totals[row.date] = { income: 0, expense: 0 };
      }
      totals[row.date].income += row.hidden ? 0 : Number(row.income || 0);
      totals[row.date].expense += row.hidden ? 0 : Number(row.expense || 0);
    }
    return totals;
  }, [all]);

  return (
    <div style={{ marginTop: 10 }} className="section-card pop">
      <div className="print-area">
        <table className="history-table">
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
            {all.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                  No entries found for this selection.
                </td>
              </tr>
            ) : (
              all.map((row, index) => {
                const isFirstOfDate = index === 0 || all[index - 1].date !== row.date;
                const isLastOfDate = index === all.length - 1 || all[index + 1].date !== row.date;
                const isDeletingThis = deletingId === row.id;

                return (
                  <React.Fragment key={row.id || `${row.type}-${index}`}>
                    {isFirstOfDate && (
                      <tr>
                        <td colSpan={5} style={{ fontWeight: "bold", background: "white" }}>
                          {row.date}
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
                              setActivePage && setActivePage(`bill_${row.studentId}_${row.date}`)
                            }
                          >
                            <span className="invoice-btn">
                              <FaFileInvoice className="icon" />
                              <span className="label">invoice</span>
                            </span>
                          </span>
                        )}
                      </td>

                      <td className="table-actions">
                        {onEditEntry && (
                          <button
                            type="button"
                            className="entry-edit-btn"
                            onClick={() => onEditEntry(row)}
                            aria-label="Edit entry"
                            disabled={isDeletingThis}
                            style={{ marginRight: 8 }}
                          >
                            <FaEdit className="icon" />
                            <span className="label">Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="entry-delete-btn"
                          onClick={() => deleteEntry && deleteEntry(row)}
                          aria-label="Delete entry"
                          disabled={isDeletingThis}
                        >
                          <FaTrash className="icon" />
                          <span className="label">
                            {isDeletingThis ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </td>
                    </tr>

                    {isLastOfDate && (
                      <tr style={{ fontWeight: "bold", background: "#fafafa" }}>
                        <td>TOTAL</td>
                        <td style={{ color: "green" }}>
                          ₹{dateTotals[row.date]?.income || 0}
                        </td>
                        <td style={{ color: "red" }}>
                          ₹{dateTotals[row.date]?.expense || 0}
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <div className="tab-buttons">
            <button
              type="button"
              className="tab-btn"
              disabled={currentPageIndex === 0}
              onClick={prevPage}
              aria-label="Previous page"
            >
              <FaArrowLeft />
            </button>

            {getVisiblePages &&
              getVisiblePages().map(i => (
                <button
                  type="button"
                  key={i}
                  className={`tab-btn ${i === currentPageIndex ? "active" : ""}`}
                  onClick={() => goToPage && goToPage(i)}
                >
                  {i + 1}
                </button>
              ))}

            <button
              type="button"
              className="tab-btn"
              disabled={currentPageIndex >= totalPages - 1}
              onClick={nextPage}
              aria-label="Next page"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}