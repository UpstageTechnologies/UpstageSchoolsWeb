import React, { useState } from "react";

export default function SearchableDropdown({
  items = [],
  value,
  onChange,
  placeholder
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  const styles = {
    wrapper: {
      position: "relative",
      width: "100%"
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      outline: "none"
    },
    list: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      background: "#fff",
      border: "1px solid #ccc",
      maxHeight: "180px",
      overflowY: "auto",
      zIndex: 50
    },
    item: {
      padding: "8px",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.wrapper}>
      <input
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
      />

      {open && (
        <div style={styles.list}>
          {filtered.length === 0 && (
            <div style={{ padding: 8, color: "gray" }}>
              No results
            </div>
          )}

          {filtered.map((item, i) => (
            <div
              key={i}
              style={styles.item}
              onMouseEnter={(e) =>
                (e.target.style.background = "#2140df",
                e.target.style.color = "#fff")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "white",
                e.target.style.color = "black")
              }
              onClick={() => {
                onChange(item);
                setOpen(false);
                setSearch("");
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
