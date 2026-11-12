import React, { useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import "../../../dashboard_styles/Accounts.css";

export default function EditEntryModal({
  isOpen,
  entry,
  onClose,
  onSave,
  isSaving
}) {
  if (!isOpen || !entry) return null;

  return (
    <EditEntryModalContent
      key={entry.id}
      entry={entry}
      onClose={onClose}
      onSave={onSave}
      isSaving={isSaving}
    />
  );
}

function EditEntryModalContent({
  entry,
  onClose,
  onSave,
  isSaving
}) {
  const [name, setName] = useState(
    () => entry.source || entry.name || entry.studentName || entry.competitionName || ""
  );
  const [amount, setAmount] = useState(() => {
    const amtVal = entry.type === "income" ? entry.income : entry.expense;
    return amtVal !== "" && amtVal !== undefined && amtVal !== null ? String(amtVal) : "";
  });
  const [date, setDate] = useState(() => entry.date || "");
  const [paymentMode, setPaymentMode] = useState(
    () => entry.mode || entry.paymentMode || "Cash"
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Description / Name cannot be empty.");
      return;
    }
    const numAmt = Number(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!date) {
      setError("Please select a valid date.");
      return;
    }
    if (!paymentMode) {
      setError("Please select a payment mode.");
      return;
    }

    try {
      await onSave({
        ...entry,
        name: name.trim(),
        amount: numAmt,
        date,
        paymentMode
      });
    } catch (err) {
      console.error("Modal save error:", err);
      setError(err.message || "Failed to save changes.");
    }
  };

  const isIncome = entry.type === "income";

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px"
      }}
    >
      <div
        className="modal-box"
        style={{
          width: "440px",
          maxWidth: "100%",
          borderRadius: "14px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          padding: "24px",
          background: "#ffffff",
          position: "relative"
        }}
      >
        <button
          onClick={onClose}
          type="button"
          disabled={isSaving}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#6b7280"
          }}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "1.25rem",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>Edit {isIncome ? "Income" : "Expense"} Entry</span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "12px",
              background: isIncome ? "#ecfdf5" : "#fef2f2",
              color: isIncome ? "#059669" : "#dc2626",
              fontWeight: 600,
              textTransform: "uppercase"
            }}
          >
            {entry.type}
          </span>
        </h3>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "14px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: "13px"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "4px"
              }}
            >
              Description / Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              placeholder="e.g. Donation, Salary, Fee"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "4px"
              }}
            >
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSaving}
              placeholder="0.00"
              step="any"
              min="0.01"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "4px"
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSaving}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "4px"
              }}
            >
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              disabled={isSaving}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
                background: "#fff"
              }}
            >
              <option value="Cash">Cash</option>
              <option value="Account">Account (Bank / UPI / Online)</option>
            </select>
          </div>

          {entry.studentId && (
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                background: "#f9fafb",
                padding: "8px 12px",
                borderRadius: "6px"
              }}
            >
              Student ID: <strong>{entry.studentId}</strong>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "12px"
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#f3f4f6",
                color: "#374151",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: isSaving ? "#93c5fd" : "#2563eb",
                color: "#fff",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FaSave />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
