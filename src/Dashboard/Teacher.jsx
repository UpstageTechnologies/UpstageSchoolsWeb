import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./Teacher.css";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db ,secondaryAuth } from "../firebase";

const Teacher = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  const [form, setForm] = useState({
    name: "",
    teacherId: "",
    department: "",
    email: "",
    phone: "",
    photo: ""
  });

  const uid = auth.currentUser?.uid;

  // 🔄 FETCH TEACHERS
  const fetchTeachers = async () => {
    if (!uid) return;

    const snap = await getDocs(
      collection(db, "users", uid, "teachers")
    );

    const list = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 🔤 A–Z SORT
    list.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    setTeachers(list);
  };

  useEffect(() => {
    fetchTeachers();
  }, [uid]);

  // ➕ ADD / ✏️ EDIT TEACHER
  const handleAddTeacher = async () => {
    if (
      !form.name ||
      !form.teacherId ||
      !form.department ||
      !form.email ||
      !form.phone ||
      (!editId && !password)
    ) {
      alert("All fields required");
      return;
    }

    // 🔴 DUPLICATE TEACHER ID (ONLY FOR NEW)
    if (!editId) {
      const snap = await getDocs(
        collection(db, "users", uid, "teachers")
      );

      const duplicate = snap.docs.some(
        doc => doc.data().teacherId === form.teacherId
      );

      if (duplicate) {
        alert("Teacher ID already exists!");
        return;
      }
    }

    // ✏️ EDIT MODE (NO PASSWORD CHANGE)
    if (editId) {
      await updateDoc(
        doc(db, "users", uid, "teachers", editId),
        { ...form }
      );
    }
    // ➕ ADD MODE (ADMIN CREATES TEACHER LOGIN)
    else {
      // 🔐 CREATE AUTH ACCOUNT
      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        form.email,
        password
      );
      

      const teacherAuthUid = userCred.user.uid;

      // 🔥 SAVE TEACHER PROFILE (NO PASSWORD)
      await addDoc(
        collection(db, "users", uid, "teachers"),
        {
          ...form,
          role: "teacher",
          authUid: teacherAuthUid,
          createdAt: Timestamp.now()
        }
      );
    }

    setShowModal(false);
    setEditId(null);
    setPassword("");
    setForm({
      name: "",
      teacherId: "",
      department: "",
      email: "",
      phone: "",
      photo: ""
    });

    fetchTeachers();
  };

  // 🗑 DELETE TEACHER
  const handleDeleteTeacher = async (id) => {
    const ok = window.confirm("Delete this teacher?");
    if (!ok) return;

    await deleteDoc(
      doc(db, "users", uid, "teachers", id)
    );

    fetchTeachers();
  };

  return (
    <div className="teacher-page">
      {/* HEADER */}
      <div className="teacher-header">
        <h2>All Teachers</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="add-btn"
            onClick={() => {
              setEditId(null);
              setPassword("");
              setForm({
                name: "",
                teacherId: "",
                department: "",
                email: "",
                phone: "",
                photo: ""
              });
              setShowModal(true);
            }}
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="teacher-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Teacher ID</th>
            <th>Department</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teachers
            .filter(t => {
              const q = search.toLowerCase();
              return (
                t.name.toLowerCase().includes(q) ||
                t.teacherId.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q) ||
                t.department.toLowerCase().includes(q) ||
                t.phone.toLowerCase().includes(q)
              );
            })
            .map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.teacherId}</td>
                <td>{t.department}</td>
                <td>{t.email}</td>
                <td>{t.phone}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setForm({
                        name: t.name,
                        teacherId: t.teacherId,
                        department: t.department,
                        email: t.email,
                        phone: t.phone,
                        photo: t.photo || ""
                      });
                      setEditId(t.id);
                      setShowModal(true);
                    }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTeacher(t.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editId ? "Edit Teacher" : "Add New Teacher"}</h3>

            <input
              placeholder="Teacher Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Teacher ID"
              value={form.teacherId}
              onChange={(e) =>
                setForm({ ...form, teacherId: e.target.value })
              }
            />

            <input
              placeholder="Department"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            {/* 🔐 PASSWORD – ONLY FOR NEW TEACHER */}
            {!editId && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button className="save" onClick={handleAddTeacher}>
                Save
              </button>
              <button
                className="cancel"
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;
