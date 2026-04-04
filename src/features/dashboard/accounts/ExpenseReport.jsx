import React from "react";
import { FaPrint } from "react-icons/fa";

export default function ExpenseReport({
  expenseList,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  reportFilter,
  setReportFilter,
  generateReport,
  reportData,
  showGeneratedReport,
  setShowGeneratedReport,
  setReportData,
  showFilterList,
  setShowFilterList,
  filterSearch,
  setFilterSearch,
  dropdownRef
}) {

  return (
    <div className="section-card pop">

      <div className="history-controls">
        <h3 className="section-title">
          Expense Report
        </h3>

        <div className="report-toolbar">

          <div className="filter-dropdown" ref={dropdownRef}>

            <input
              type="text"
              placeholder="Search filter..."
              value={filterSearch}
              onChange={(e)=>setFilterSearch(e.target.value)}
              onFocus={()=>setShowFilterList(true)}
              className="report-search"
            />
              <button
      className="print-btn-inside"
      onClick={() => window.print()}
    >
      <FaPrint />
    </button>
            {showFilterList && (
              <div className="filter-list">

                <h5>Date Range</h5>

                <div className="report-actions">

                  <label>From:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e)=>setFromDate(e.target.value)}
                    className="report-date"
                  />

                  <label>To:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e)=>setToDate(e.target.value)}
                    className="report-date"
                  />

                  <label>Type</label>
                  <select
                    value={reportFilter}
                    onChange={(e)=>setReportFilter(e.target.value)}
                    className="report-dropdown"
                  >
                    <option value="all">All</option>
                    <option value="salary">Salary</option>
                    <option value="student_misc">Competition</option>
                    <option value="others">Other</option>
                  </select>

                  <label>Actions</label>

                  <button
                    className="action-btn generate"
                    onClick={generateReport}
                  >
                    Generate
                  </button>

                  <button
                    className="action-btn close"
                    onClick={()=>{
                      setShowGeneratedReport(false);
                      setReportData([]);
                    }}
                  >
                    Close
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      <div style={{marginTop:15}}>

        {showGeneratedReport && (
          <div className="print-area">

            <table className="history-table">

              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  reportData.map(e => (
                    <tr key={e.id}>
                      <td>{e.type}</td>
                      <td>{e.name}</td>
                      <td style={{color:"red"}}>₹{e.amount}</td>
                      <td>{e.date}</td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}