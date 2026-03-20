  import React, { useEffect, useState } from "react";
  import { onSnapshot } from "firebase/firestore";
  import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
  import "../dashboard_styles/Teacher.css"; // same CSS reuse
  import FloatingInput from "../../components/FloatingInput";
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
  ];const OfficeStaff = ({
    formOnly = false,
    requirePremium,
    globalSearch = "",
    setActivePage,
    editData,
    onEdit,
    sortField,        // 🔥 ADD
    sortDirection   
  }) => {
    const selectedOfficeStaffId =
      localStorage.getItem("selectedOfficeStaffId");
  

    /* ================= BASIC ================= */
    const adminUid =
      auth.currentUser?.uid || localStorage.getItem("adminUid");

    const roleType = localStorage.getItem("role"); // admin | sub_admin
    const [staffs, setStaffs] = useState([]);
    const [editId, setEditId] = useState(null);
    const [focused, setFocused] = useState(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showDepartment, setShowDepartment] = useState(false);
    const [showRole, setShowRole] = useState(false);
    const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);
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
    
    useEffect(() => {
      if (editData) {
        setForm({
          name: editData.name || "",
          staffId: editData.staffId || "",
          email: editData.email || "",
          phone: editData.phone || "",
          department: editData.department || "",
          role: editData.role || "",
          address: editData.address || "",
          photoURL: editData.photoURL || ""
        });
    
        setEditId(editData.id);
        setPassword(editData.password || "");
      }
    }, [editData]);
    useEffect(() => {
      if (!adminUid) return;
    
      const ref = collection(db, "users", adminUid, "office_staffs");
    
      const unsubscribe = onSnapshot(ref, (snap) => {
        let list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        const uniqueMap = new Map();

        list.forEach(item => {
          if (!uniqueMap.has(item.staffId)) {
            uniqueMap.set(item.staffId, item);
          }
        });
    
        list = Array.from(uniqueMap.values());
        // 🔥 NAME SORT
        if (sortField === "name") {
          list.sort((a, b) => {
            const aVal = (a.name || "").toLowerCase();
            const bVal = (b.name || "").toLowerCase();
    
            return sortDirection === "asc"
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          });
        }
    
        // 🔥 DEPARTMENT SORT
        else if (sortField === "department") {
          list.sort((a, b) => {
            const aVal = (a.department || "").toLowerCase();
            const bVal = (b.department || "").toLowerCase();
    
            return sortDirection === "asc"
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          });
        }
    
        // 🔥 ROLE SORT
        else if (sortField === "role") {
          list.sort((a, b) => {
            const aVal = (a.role || "").toLowerCase();
            const bVal = (b.role || "").toLowerCase();
    
            return sortDirection === "asc"
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          });
        }
    
        // 🔥 DEFAULT
        else if (sortField) {
          list.sort((a, b) => {
            const aVal = (a[sortField] || "").toString().toLowerCase();
            const bVal = (b[sortField] || "").toString().toLowerCase();
    
            return sortDirection === "asc"
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          });
        }
    
        setStaffs(list);
      });
    
      return () => unsubscribe();
    }, [adminUid, sortField, sortDirection]); // 🔥 MUST
    /* ================= SAVE ================= */
    const handleSaveStaff = async () => {
      try {
        setSaving(true);
        setSaved(false);
    
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
    
        if (!/^\d{10}$/.test(form.phone)) {
          alert("📞 Phone must be 10 digits");
          return;
        }
    
        const staffIdTrimmed = form.staffId.trim();
    
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
    
        // 🔴 sub admin
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
          return;
        }
    
        // 🟢 main admin
        if (editId) {
          const updateData = {
            ...form,
            staffId: staffIdTrimmed,
            updatedAt: Timestamp.now()
          };
    
          if (password.trim()) {
            updateData.password = password;
          }
    
          await updateDoc(
            doc(db, "users", adminUid, "office_staffs", editId),
            updateData
          );
          // 🔥 HISTORY UPDATE
await addDoc(
  collection(db, "users", adminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "OFFICE_STAFF",
    name: form.name,
    role: form.role,
    action: "UPDATE",
    date: Timestamp.now(),
    createdAt: Timestamp.now(),
    originalData: {
      id: editId,
      ...updateData
    }
  }
);
        } else {
          await addDoc(
            collection(db, "users", adminUid, "office_staffs"),
            {
              ...form,
              staffId: staffIdTrimmed,
              password,
              createdAt: Timestamp.now()
            }
          );
          // 🔥 HISTORY (CREATE)
await addDoc(
  collection(db, "users", adminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "OFFICE_STAFF",
    name: form.name,
    role: form.role,
    action: "CREATE",
    date: Timestamp.now(),
    createdAt: Timestamp.now(),
    originalData: {
      ...form,
      staffId: staffIdTrimmed
    }
  }
);
        }
    
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    
        resetForm();
       
    
      } catch (err) {
        console.error("🔥 FIREBASE ERROR:", err);
        alert(err.message); // 🔥 REAL ERROR SHOW
      } finally {
        setSaving(false);
      }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (staff) => {
      if (!window.confirm("Delete staff?")) return;
    
      // 🔥 UI update immediately
      setStaffs(prev => prev.filter(s => s.id !== staff.id));
    
      try {
        if (roleType === "admin") {
          await addDoc(
            collection(db, "users", adminUid, "approval_requests"),
            {
              module: "office_staff",
              action: "delete",
              targetId: staff.id,
              status: "pending",
              createdBy: localStorage.getItem("adminId"),
              createdAt: Timestamp.now()
            }
          );
          alert("⏳ Delete request sent");
          return;
        }
    
        // 🔥 Save to History (WITH ID)
        await addDoc(
          collection(db, "users", adminUid, "Account", "accounts", "History"),
          {
            entryType: "people",
            module: "OFFICE_STAFF",
            name: staff.name,
            role: staff.role,
            action: "DELETE",
            date: Timestamp.now(),
            createdAt: Timestamp.now(),
            originalData: {
              id: staff.id,   // 🔥 VERY IMPORTANT
              ...staff
            }
          }
        );
    
        // 🔥 Delete from firestore
        await deleteDoc(
          doc(db, "users", adminUid, "office_staffs", staff.id)
        );
    
      } catch (err) {
        console.error(err);
        alert("Delete failed ❌");
      }
    };
const safePremium = requirePremium ?? ((fn) => fn());
    /* ================= RESET ================= */
    const resetForm = () => {
     
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
    useEffect(()=>{
      const close=()=> {
      
        setShowDepartment(false);
        setShowRole(false);
      };
      window.addEventListener("click",close);
      return()=>window.removeEventListener("click",close);
    },[]);
    
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
                        if (onEdit) {
                          onEdit(s); // 🔥 send data to parent
                        }
                      }}
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
  className="delete-btn"
  onClick={() => safePremium(() => handleDelete(s))}
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
        {formOnly && (
        <div className="account-grid">
<FloatingInput
  name="name"
  label="Staff Name"
  value={form.name}
  focused={focused}
  setFocused={setFocused}
  onChange={(e) =>
    setForm({ ...form, name: e.target.value })
  }
/>
<FloatingInput
  name="staffId"
  label="Staff ID"
  value={form.staffId}
  focused={focused}
  setFocused={setFocused}
  onChange={(e) =>
    setForm({ ...form, staffId: e.target.value })
  }
/>

<FloatingInput
  name="password"
  label="Password"
  type={showPassword ? "text" : "password"}
  value={password}
  focused={focused}
  setFocused={setFocused}
  onChange={(e) => setPassword(e.target.value)}
  rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
  onRightIconClick={() => setShowPassword(p => !p)}
/>
              

                <FloatingInput
  name="phone"
  label="Phone"
  value={form.phone}
  focused={focused}         // ✅ FIX
  setFocused={setFocused}   // ✅ FIX
  onChange={(e) => {
    const v = e.target.value.replace(/\D/g, "");
    setForm({ ...form, phone: v.slice(0, 10) });
  }}
/>

<div className="adminpopup-select">

<div
  className="adminpopup-input"
  onClick={(e) => {
    e.stopPropagation(); // 🔥 ADD THIS
    setShowDepartment(prev => !prev);
  }}
>
  {form.department || "Department"}
  <span>▾</span>
</div>

{showDepartment && (
  <div className="adminpopup-menu">

    {departments.map(d => (
      <div
        key={d}
        className={`popup-item ${form.department === d ? "active" : ""}`}
        onClick={() => {
          setForm({ ...form, department: d });
          setShowDepartment(false);
        }}
      >
        {form.department === d && "✓ "}
        {d}
      </div>
    ))}

  </div>
)}

</div>

<div className="adminpopup-select">
<div
  className="adminpopup-input"
  onClick={(e) => {
    e.stopPropagation(); // 🔥 ADD THIS
    setShowRole(prev => !prev);
  }}
>
  {form.role || "Role"}
  <span>▾</span>
</div>

{showRole && (
  <div className="adminpopup-menu">

    {roles.map(r => (
      <div
        key={r}
        className={`popup-item ${form.role === r ? "active" : ""}`}
        onClick={() => {
          setForm({ ...form, role: r });
          setShowRole(false);
        }}
      >
        {form.role === r && "✓ "}
        {r}
      </div>
    ))}

  </div>
)}

</div>

              <button
  className="save"
  disabled={saving}
  onClick={() => safePremium(handleSaveStaff)}
>
  {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
</button>
                <button className="cancel" onClick={resetForm}>Cancel</button>
             
            </div>
         
        )}
    </>
    );
  };
  export default OfficeStaff;
