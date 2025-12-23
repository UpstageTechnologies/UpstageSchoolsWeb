import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import "../dashboard_styles/Teacher.css";

const Parent = () => {
  /* ================= BASIC ================= */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role"); // admin | sub_admin

  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  const [studentsCount, setStudentsCount] = useState(1);
  const [students, setStudents] = useState([
    { studentId: "", studentName: "" }
  ]);

  const [form, setForm] = useState({
    name: "",
    parentId: "",
    email: "",
    phone: "",
    address: ""
  });

  /* ================= FETCH ================= */
  const fetchParents = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "parents")
    );

    setParents(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  };

  useEffect(() => {
    fetchParents();
  }, [adminUid]);

  /* ================= STUDENT HANDLERS ================= */
  const handleStudentChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleStudentCountChange = (count) => {
    setStudentsCount(count);
    setStudents(prev => {
      const copy = [...prev];
      if (count > copy.length) {
        while (copy.length < count) {
          copy.push({ studentId: "", studentName: "" });
        }
      } else {
        copy.length = count;
      }
      return copy;
    });
  };

  /* ================= SAVE (ADMIN / SUB ADMIN) ================= */
  const handleSave = async () => {
    if (
      !form.name ||
      !form.parentId ||
      !form.email ||
      !form.phone ||
      !form.address ||
      students.some(s => !s.studentId || !s.studentName) ||
      (!editId && !password)
    ) {
      alert("All fields required");
      return;
    }

    const payload = {
      ...form,
      studentsCount,
      students
    };

    /* 🔴 SUB ADMIN → APPROVAL */
    if (role === "sub_admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "parent",
          action: editId ? "update" : "create",
          targetId: editId || null,
          payload: {
            ...payload,
            password: password || null
          },
          status: "pending",
          createdBy: localStorage.getItem("adminId"),
          createdAt: Timestamp.now()
        }
      );

      alert("⏳ Sent for admin approval");
      resetForm();
      return;
    }

    /* 🟢 MAIN ADMIN → DIRECT SAVE */
    if (editId) {
      await updateDoc(
        doc(db, "users", adminUid, "parents", editId),
        {
          ...payload,
          updatedAt: Timestamp.now()
        }
      );
    } else {
      await addDoc(
        collection(db, "users", adminUid, "parents"),
        {
          ...payload,
          password,
          role: "parent",
          createdAt: Timestamp.now()
        }
      );
    }

    resetForm();
    fetchParents();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete parent?")) return;

    /* 🔴 SUB ADMIN → APPROVAL */
    if (role === "sub_admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "parent",
          action: "delete",
          targetId: id,
          status: "pending",
          createdBy: localStorage.getItem("adminId"),
          createdAt: Timestamp.now()
        }
      );

      alert("⏳ Delete request sent");
      return;
    }

    /* 🟢 MAIN ADMIN */
    await deleteDoc(doc(db, "users", adminUid, "parents", id));
    fetchParents();
  };

  /* ================= EDIT ================= */
  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      parentId: p.parentId,
      email: p.email,
      phone: p.phone,
      address: p.address
    });
    setStudentsCount(p.studentsCount || 1);
    setStudents(p.students || [{ studentId: "", studentName: "" }]);
    setPassword("");
    setShowModal(true);
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setPassword("");
    setStudentsCount(1);
    setStudents([{ studentId: "", studentName: "" }]);
    setForm({
      name: "",
      parentId: "",
      email: "",
      phone: "",
      address: ""
    });
  };

  /* ================= UI ================= */
  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <h2>Parents</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search parent..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FaPlus />
          </button>
        </div>
      </div>

      <table className="teacher-table">
        <thead>
          <tr>
            <th>Parent</th>
            <th>Parent ID</th>
            <th>Students</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
  {parents
    .filter(p =>
      JSON.stringify(p).toLowerCase().includes(search.toLowerCase())
    )
    .map(p => (
      <tr key={p.id} className="mobile-card">
        <td data-label="Name">{p.name}</td>
        <td data-label="Parent ID">{p.parentId}</td>
        <td data-label="Students">{p.studentsCount}</td>
        <td data-label="Email">{p.email}</td>
        <td data-label="Phone">{p.phone}</td>
        <td data-label="Address">{p.address}</td>

        <td data-label="Action" className="action-cell">
          <button
            className="edit-btn"
            onClick={() => handleEdit(p)}
          >
            <FaEdit /> Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => handleDelete(p.id)}
          >
            <FaTrash /> Delete
          </button>
        </td>
      </tr>
    ))}
</tbody>

      </table>

      {/* MODAL same as before */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editId ? "Edit Parent" : "Add Parent"}</h3>

            <input
              placeholder="Parent Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Parent ID"
              value={form.parentId}
              onChange={e =>
                setForm({ ...form, parentId: e.target.value })
              }
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <p>Number of Students</p>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => handleStudentCountChange(n)}
                style={{
                  margin: 5,
                  background: studentsCount === n ? "#2140df" : "#ccc",
                  color: "#fff"
                }}
              >
                {n}
              </button>
            ))}

            {students.map((s, i) => (
              <div key={i}>
                <input
                  placeholder={`Student ${i + 1} ID`}
                  value={s.studentId}
                  onChange={e =>
                    handleStudentChange(i, "studentId", e.target.value)
                  }
                />
                <input
                  placeholder={`Student ${i + 1} Name`}
                  value={s.studentName}
                  onChange={e =>
                    handleStudentChange(i, "studentName", e.target.value)
                  }
                />
              </div>
            ))}

            <input
              type="password"
              placeholder={editId ? "New Password (optional)" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className="modal-actions">
              <button className="save" onClick={handleSave}>
                Save
              </button>
              <button className="cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parent;
