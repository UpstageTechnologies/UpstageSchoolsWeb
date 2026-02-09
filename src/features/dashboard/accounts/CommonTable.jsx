import React, { useEffect, useState } from "react";
export default function CommonTable({
    columns,
    data,
    emptyText = "No data found",
    pageSize = 10,
    showDateFilter = false,
    searchText = ""
  }) {
    const [entryDate, setEntryDate] = useState("ALL");
    const [pageIndex, setPageIndex] = useState(0);
  
    // 🔹 unique dates
    const allDates = [...new Set(data.map(d => d.date).filter(Boolean))].sort();
  
    // 🔹 search filter
    let filtered = data.filter(row =>
      JSON.stringify(row)
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  
    // 🔹 date filter
    if (showDateFilter && entryDate !== "ALL") {
      filtered = filtered.filter(d => d.date === entryDate);
    }
  
    // 🔹 pagination
    const totalPages = Math.ceil(filtered.length / pageSize);
    const pageData = filtered.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize
    );
  
    return (
      <>
        {/* 🔹 DATE FILTER */}
        {showDateFilter && (
          <select
            value={entryDate}
            onChange={e => {
              setEntryDate(e.target.value);
              setPageIndex(0);
            }}
            style={{ marginBottom: 12 }}
          >
            <option value="ALL">All Dates</option>
            {allDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
  
        <table className="nice-table">
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
            </tr>
          </thead>
  
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr key={row.id || i}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
  
        {/* 🔹 PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button disabled={pageIndex === 0}
              onClick={() => setPageIndex(p => p - 1)}>
              Prev
            </button>
  
            <span style={{ margin: "0 8px" }}>
              Page {pageIndex + 1} / {totalPages}
            </span>
  
            <button disabled={pageIndex === totalPages - 1}
              onClick={() => setPageIndex(p => p + 1)}>
              Next
            </button>
          </div>
        )}
      </>
    );
  }
  