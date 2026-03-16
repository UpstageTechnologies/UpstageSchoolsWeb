  import React, { useEffect, useState } from "react";
  import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
  import "../dashboard_styles/Teacher.css"; // same CSS reuse
  import {
    collection,
    addDoc,
    getDocs,
    Timestamp,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where
  } from "firebase/firestore";
  import { auth, db } from "../../services/firebase";

  /* 🏢 Departments */
  const departments = [
    "Office",
    "Accounts",
    "Admin",
    "Transport",
    "Library",
    "Reception",
    "Maintenance"
  ];

  /* 👔 Staff Roles */
  const roles = [
    "Clerk",
    "Accountant",
    "Receptionist",
    "Office Assistant",
    "Manager",
    "Supervisor"
  ];
  const OfficeStaff = ({ formOnly=false, requirePremium, globalSearch="", setActivePage }) => {

    const selectedOfficeStaffId =
      localStorage.getItem("selectedOfficeStaffId");
  

    /* ================= BASIC ================= */
    const adminUid =
      auth.currentUser?.uid || localStorage.getItem("adminUid");

    const roleType = localStorage.getItem("role"); // admin | sub_admin

    const [showModal, setShowModal] = useState(false);
    const [staffs, setStaffs] = useState([]);
    const [editId, setEditId] = useState(null);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    /* ================= FORM ================= */
    const [form, setForm] = useState({
      name: "",
      staffId: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      address: "",
      photoURL: ""
    });

    /* ================= FETCH STAFF ================= */
    const fetchStaffs = async () => {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "office_staffs")
      );

      setStaffs(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
          )
      );
    };

    useEffect(() => {
      fetchStaffs();
    }, [adminUid]);

    /* ================= SAVE ================= */
    const handleSaveStaff = async () => {
      if (
        !form.name ||
        !form.staffId ||
        !form.phone ||
        !form.department ||
        !form.role ||
        (!editId && !password)
      ) {
        alert("❌ Required fields missing");
        return;
      }

      // 📞 phone validation
      if (!/^\d{10}$/.test(form.phone)) {
        alert("📞 Phone must be 10 digits");
        return;
      }

      const staffIdTrimmed = form.staffId.trim();

      // 🔎 duplicate staffId check
      const q = query(
        collection(db, "users", adminUid, "office_staffs"),
        where("staffId", "==", staffIdTrimmed)
      );
      const snap = await getDocs(q);

      if (!editId && !snap.empty) {
        alert("❌ Staff ID already exists");
        return;
      }

      if (editId && !snap.empty && snap.docs[0].id !== editId) {
        alert("❌ Another staff uses this ID");
        return;
      }
      if (roleType === "admin") {
        await addDoc(
          collection(db, "users", adminUid, "office_staffs"),
          {
            ...form,
            staffId: staffIdTrimmed,
            password,
            createdAt: Timestamp.now()
          }
        );
        

        alert("⏳ Sent for approval");
        resetForm();
        return;
      }

      /* 🟢 MAIN ADMIN */
      if (editId) {
        const updateData = {
          ...form,
          staffId: staffIdTrimmed,
          updatedAt: Timestamp.now()
        };

        if (password.trim()) updateData.password = password;

        await updateDoc(
          doc(db, "users", adminUid, "office_staffs", editId),
          updateData
        );
      } else {
        await addDoc(
          collection(db, "users", adminUid, "office_staffs"),
          {
            name: newStaffName,
            phone: newStaffPhone,
            department: "Office",
            role: salaryPosition,
            staffId: "OFF" + Date.now(),
            createdAt: new Date()
          }
        );
        
      }

      resetForm();
      fetchStaffs();
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
      if (!window.confirm("Delete staff?")) return;

      if (roleType === "admin") {
        await addDoc(
          collection(db, "users", adminUid, "approval_requests"),
          {
            module: "office_staff",
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

      await deleteDoc(doc(db, "users", adminUid, "office_staffs", id));
      fetchStaffs();
    };

    /* ================= RESET ================= */
    const resetForm = () => {
      setShowModal(false);
      setEditId(null);
      setPassword("");
      setForm({
        name: "",
        staffId: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        address: "",
        photoURL: ""
      });
    };
    useEffect(() => {
      return () => {
        localStorage.removeItem("selectedOfficeStaffId");
      };
    }, []);
    
    return (
<>
       
           
          {!formOnly && (
<></>
)}
       

        {/* TABLE */}
        {!formOnly && (
<table className="teacher-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Staff ID</th>
              <th>Department</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
          {staffs
  .filter(s => {

    // 🎯 When coming from dashboard global search click
    if (selectedOfficeStaffId) {
      return s.id === selectedOfficeStaffId;
    }

    // 🔍 Normal search inside page
    return (
      s.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.staffId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.phone?.includes(globalSearch)
    );
  })


              .map(s => (
                <tr key={s.id}>
                  <td data-label="Photo">
                    {s.photoURL ? (
                      <img src={s.photoURL} alt="" style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover"
                      }} />
                    ) : (
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {s.name?.charAt(0)}
                      </div>
                    )}
                  </td>

                  <td data-label="Name">{s.name}</td>
                  <td data-label="Staff Id">{s.staffId}</td>
                  <td data-label="Department">{s.department}</td>
                  <td data-label="Role">{s.role}</td>
                  <td data-label="Phone">{s.phone}</td>

                  <td>
                  <button
                      className="view-btn"
                      onClick={() => {
                        localStorage.setItem("viewType", "office_staff");
                        localStorage.setItem("viewName", s.name);
                        localStorage.setItem("viewId", s.staffId);
                        setActivePage("subdashboard");
                      }}
                      
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setForm({ ...s });
                        setEditId(s.id);
                        setPassword(s.password || "");
                        setShowModal(true);
                      }}
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(s.id)}
                    >
                      <FaTrash /> Delete
                    </button>


                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        )}
        {/* MODAL */}
        {(showModal || formOnly) && (
        <div className="account-grid">

              <input
                placeholder="Staff Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />

              <input
                placeholder="Staff ID"
                value={form.staffId}
                onChange={e => setForm({ ...form, staffId: e.target.value })}
              />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(p => !p)}
                  
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              

              <input
                placeholder="Phone"
                value={form.phone}
                maxLength={10}
                onChange={e =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
              />

              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Department</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>

              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Role</option>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>

                <button className="save" onClick={handleSaveStaff}>Save</button>
                <button className="cancel" onClick={resetForm}>Cancel</button>
             
            </div>
         
        )}
    </>
    );
  };
  export default OfficeStaff;
