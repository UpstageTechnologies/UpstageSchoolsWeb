import React from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import { useEffect } from "react";
export default function Report({
    adminUid,
  reportFilter,
  setReportFilter,
  filterSearch,
  setFilterSearch,
  showFilterList,
  setShowFilterList,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  generateReport,
  setShowGeneratedReport,
  setReportData,
  showGeneratedReport,
  reportData,
  handleSort,
  sortField,
  sortDirection,
  paginate,
  getFeeBalance,
  dropdownRef
}) {
 

    useEffect(() => {
      if (!adminUid) return;
    
      const reportRef = collection(
        db,
        "users",
        adminUid,
        "Account",
        "accounts",
        "Report"
      );
    
      const unsub = onSnapshot(reportRef, snap => {
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
    
        console.log("🔥 FIRESTORE REPORT:", data);
    
        setAllReportData(data);
      });
    
      return () => unsub();
    }, [adminUid]);
    const formatPaymentType = (i) => {

        // ✅ SOURCE FIX
        if (i.type === "source" || i.incomeType === "source") {
          return "Source";
        }
      
        if (i.incomeType === "competition") return "Competition";
      
        let type = i.paymentType?.toLowerCase() || "";
      
        if (type === "full") type = "Full";
        else if (type === "partial") type = "Partial";
        else if (type === "term1") type = "Term1";
        else if (type === "term2") type = "Term2";
        else if (type === "term3") type = "Term3";
        else type = "Other";
      
        const admission = i.isNew ? "New" : "Old";
      
        return `${type} (${admission})`;
      };
  return (
    <div className="section-card pop">

      <div className="history-controls">
        <h3 className="section-title">
          Income Report – {reportFilter.toUpperCase()}
        </h3>

        <div className="report-toolbar">

          {/* 🔽 FILTER DROPDOWN */}
          <div className="filter-dropdown" ref={dropdownRef}>

            <input
              type="text"
              placeholder="Search filter..."
              value={filterSearch}
              onChange={(e)=>setFilterSearch(e.target.value)}
              onFocus={()=>setShowFilterList(true)}
              className="report-search"
            />

            {showFilterList && (
              <div className="filter-list">

                <h5 className="filter-section-title">Date Range</h5>

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

                  <label>Activity type</label>
                  <select
                    value={reportFilter}
                    onChange={(e)=>setReportFilter(e.target.value)}
                    className="report-dropdown"
                  >
                    <option value="all">All</option>
                    <option value="new">New Admission</option>
                    <option value="old">Old Admission</option>
                    <option value="full">Full Payment</option>
                    <option value="partial">Partial Payment</option>
                    <option value="term1">Term 1</option>
                    <option value="term2">Term 2</option>
                    <option value="term3">Term 3</option>
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

                  <button
                    className="action-btn print"
                    onClick={() => window.print()}
                  >
                    <FaPrint/> Print
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

                  <th onClick={() => handleSort("studentName")}>
                    Student
                    {sortField === "studentName" &&
                      (sortDirection === "asc"
                        ? <FiChevronUp size={14}/>
                        : <FiChevronDown size={14}/>
                      )}
                  </th>

                  <th onClick={() => handleSort("className")}>
                    Class
                    {sortField === "className" &&
                      (sortDirection === "asc"
                        ? <FiChevronUp size={14}/>
                        : <FiChevronDown size={14}/>
                      )}
                  </th>

                  <th onClick={() => handleSort("paymentType")}>
                    Payment Type
                    {sortField === "paymentType" &&
                      (sortDirection === "asc"
                        ? <FiChevronUp size={14}/>
                        : <FiChevronDown size={14}/>
                      )}
                  </th>

                  <th onClick={() => handleSort("paidAmount")}>
                    Paid
                    {sortField === "paidAmount" &&
                      (sortDirection === "asc"
                        ? <FiChevronUp size={14}/>
                        : <FiChevronDown size={14}/>
                      )}
                  </th>

                  <th onClick={() => handleSort("balance")}>
                    Balance
                    {sortField === "balance" &&
                      (sortDirection === "asc"
                        ? <FiChevronUp size={14}/>
                        : <FiChevronDown size={14}/>
                      )}
                  </th>

                  <th onClick={() => handleSort("date")}>
                    Date
                    {sortField === "date" &&
                      (sortDirection === "asc"
                        ? <FiChevronUp size={14}/>
                        : <FiChevronDown size={14}/>
                      )}
                  </th>

                </tr>
              </thead>

              <tbody>

                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  paginate(reportData).map(i => {

                    const balance =
                      i.paymentType === "pending"
                        ? i.balance
                        : getFeeBalance(i.studentId, i.feeId);

                    return (
                      <tr key={i.id}>

                        <td data-label="Student">{i.studentName}</td>
                        <td data-label="Class">{i.className}</td>

                        <td
                          data-label="Payment Type"
                          style={{ textTransform: "capitalize" }}
                        >
                        
  {formatPaymentType(i)}
</td>
                       

                        <td data-label="Paid">
                          ₹{i.paidAmount || 0}
                        </td>

                        <td
                          data-label="Balance"
                          style={{
                            color: balance > 0 ? "red" : "green"
                          }}
                        >
                          ₹{balance}
                        </td>

                        <td data-label="Date">
                          {i.date || "-"}
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}   