import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhotoVideo, FaUser } from "react-icons/fa";
import "../dashboard_styles/Teacher.css"; // reuse same CSS
import CreateAccountModal from "../../components/CreateAccountModal"
import "../dashboard_styles/CreateAccountModal.css"
import FloatingInput from "../../components/FloatingInput";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,setDoc,onSnapshot
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const role = localStorage.getItem("role");
const isAdmin = role === "master";
const Admin = ({
  formOnly = false,
  requirePremium,
  globalSearch = "",
  setActivePage,
  editData,
  onEdit,
  sortField,          // 🔥 ADD THIS
  sortDirection       // 🔥 ADD THIS
}) => {

  const [admins, setAdmins] = useState([]);
  const [focused, setFocused] = useState(null);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showGender,setShowGender] =useState(false);
  const [saving, setSaving] = useState(false);
  
const [saved, setSaved] = useState(false);
  const selectedAdminId = localStorage.getItem("selectedAdminId");

  /* ===== ADMIN FORM ===== */
  const [form, setForm] = useState({
    name: "",
    adminId: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    qualification: "",
    experience: "",
    photoURL: ""

  });
  

  const superAdminUid =
  auth.currentUser?.uid || localStorage.getItem("adminUid");

  useEffect(() => {
    if (!superAdminUid) return;
  
    const ref = collection(db, "users", superAdminUid, "admins");
  
    const unsubscribe = onSnapshot(ref, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

if (sortField) {
  list.sort((a, b) => {
    const aVal = (a[sortField] || "").toString().toLowerCase();
    const bVal = (b[sortField] || "").toString().toLowerCase();

    return sortDirection === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });
}

setAdmins(list);
    });
  
    return () => unsubscribe();
  }, [superAdminUid, sortField, sortDirection]);
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        adminId: editData.adminId || "",
        email: editData.email || "",
        phone: editData.phone || "",
        address: editData.address || "",
        gender: editData.gender || "",
        qualification: editData.qualification || "",
        experience: editData.experience || "",
        photoURL: editData.photoURL || ""
      });
  
      setEditId(editData.id);
      setPassword(editData.password || "");
    }
  }, [editData]);
  const generateAdminId = async () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const roleLetter = "A";
  
    const snap = await getDocs(
      collection(db, "users", superAdminUid, "admins")
    );
  
    const ids = snap.docs.map(d => d.data().adminId || "");
  
    const filtered = ids.filter(id =>
      id.startsWith(year + roleLetter)
    );
  
    let lastNumber = 0;
  
    filtered.forEach(id => {
      const num = parseInt(id.slice(-3));
      if (num > lastNumber) lastNumber = num;
    });
  
    const newNumber = (lastNumber + 1)
      .toString()
      .padStart(3, "0");
  
    return `${year}${roleLetter}${newNumber}`;
  };
  const handleSaveAdmin = async () => {
    try {
      setSaving(true);
      setSaved(false);
  
      if (!superAdminUid) {
        alert("❌ Master not authenticated");
        return;
      }
  
      if (
        !form.name ||
        !form.adminId ||
        !form.email ||
        !form.phone ||
        (!editId && !password)
      ) {
        alert("❌ Required fields missing");
        return;
      }
  
      const phoneClean = form.phone.trim();
  
      if (!/^\d{10}$/.test(phoneClean)) {
        alert("📞 Phone must be 10 digits");
        return;
      }
  
      /* ================= UPDATE ================= */
      if (editId) {
        const updateData = {
          ...form,
          role: "admin",
          updatedAt: Timestamp.now()
        };
  
        if (password?.trim()) {
          updateData.password = password;
        }
  
        await updateDoc(
          doc(db, "users", superAdminUid, "admins", editId),
          updateData
        );  
        // 🔥 HISTORY UPDATE
await addDoc(
  collection(db, "users", superAdminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "ADMIN",
    name: form.name,
    role: "admin",
    action: "UPDATE",
    date: Timestamp.now(),
    createdAt: Timestamp.now(),
    originalData: {
      id: editId,
      ...updateData
    }
  }
);
  
      } 
      /* ================= CREATE ================= */
      else {
        const existing = await getDoc(
          doc(db, "users", superAdminUid, "admins", form.adminId)
        );
  
        if (existing.exists()) {
          alert("❌ Admin ID already exists");
          return;
        }
        const newId = await generateAdminId(); // 🔥 MUST ADD
        await setDoc(
          doc(db, "users", superAdminUid, "admins", newId),
          {
            ...form,
            adminId: newId,
            password,
            role: "admin",
            isActive: true,
            createdAt: Timestamp.now()
          }
        );
        // 🔥 HISTORY CREATE
await addDoc(
  collection(db, "users", superAdminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "ADMIN",
    name: form.name,
    role: "admin",
    action: "CREATE",
    date: Timestamp.now(),
    createdAt: Timestamp.now(),
    originalData: {
      id: form.adminId,   // 🔥 IMPORTANT
      ...form,
      adminId: form.adminId
    }
  }
);
      }
  
      /* ================= SUCCESS ================= */
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  
      resetForm(); // 🔥 no fetch needed (onSnapshot handles)
  
    } catch (err) {
      console.error("🔥 ERROR:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDisable = async (admin) => {
    try {
      const newStatus = !admin.isActive;
  
      await updateDoc(
        doc(db, "users", superAdminUid, "admins", admin.id),
        {
          isActive: newStatus,
          updatedAt: Timestamp.now()
        }
      );
  
      // 🔥 HISTORY
      await addDoc(
        collection(db, "users", superAdminUid, "Account", "accounts", "History"),
        {
          entryType: "people",
          module: "ADMIN",
          name: admin.name,
          role: "admin",
          action: newStatus ? "ENABLE" : "DISABLE",
          date: Timestamp.now(),
          createdAt: Timestamp.now(),
          originalData: {
            id: admin.id,
            ...admin,
            isActive: newStatus
          }
        }
      );
  
      alert(newStatus ? "Enabled ✅" : "Disabled 🚫");
  
    } catch (err) {
      console.error(err);
      alert("Failed ❌");
    }
  };
  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete admin?")) return;
  
    try {
      const adminDoc = admins.find(a => a.id === id);
      if (!adminDoc) return;
  
      // 🔥 SAVE HISTORY FIRST
      await addDoc(
        collection(db, "users", superAdminUid, "Account", "accounts", "History"),
        {
          entryType: "people",
          module: "ADMIN",
          name: adminDoc.name,
          role: "admin",
          action: "DELETE",
          date: Timestamp.now(),
          createdAt: Timestamp.now(),
          originalData: {
            id: adminDoc.id,
            ...adminDoc
          }
        }
      );
  
      // 🔥 DELETE
      await deleteDoc(
        doc(db, "users", superAdminUid, "admins", id)
      );
  
      alert("Deleted + history saved ✅");
  
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };
  const resetForm = () => {
   
    setEditId(null);
    setPassword("");
    setForm({
      name: "",
      adminId: "",
      email: "",
      phone: "",
      address: "",
      gender: "",
      qualification: "",
      experience: "",
      photoURL: ""
    });
  };
  const handleView = (admin) => {
    localStorage.setItem("viewType", "admin");
    localStorage.setItem("viewName", admin.name);
    localStorage.setItem("viewId", admin.adminId);
  
    if (setActivePage) {
      setActivePage("subdashboard");
    }
  };
  
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedAdminId");
    };
  }, []);
  useEffect(() => {
    const closeAll = () => {
      setShowGender(false);
    };
  
    window.addEventListener("click", closeAll);
  
    return () => {
      window.removeEventListener("click", closeAll);
    };
  }, []);
  useEffect(() => {
    if (editData) {
      // 🔥 EDIT MODE → KEEP OLD ID
      setForm({
        ...editData
      });
  
      setEditId(editData.id);
  
    } else {
      // 🔥 CREATE MODE → GENERATE NEW ID
      const loadId = async () => {
        const id = await generateAdminId();
        setForm(prev => ({ ...prev, adminId: id }));
      };
  
      loadId();
    }
  }, [editData]);
  return (
  
          <>
        {!formOnly && (
<></>
)}
      
     
      {!formOnly && (
<table className="teacher-table">
        <thead>
          <tr>
          <th>Photo</th>
            <th>Name</th>
            <th>Admin ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Qualification</th>
            <th>Experience</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
        {admins
  .filter(a => {

    // ✅ From dashboard search click
    if (selectedAdminId) {
      return a.id === selectedAdminId;
    }

    // ✅ Normal search
    return (
      a.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      a.adminId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      a.email?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      a.phone?.includes(globalSearch)
    );
  })

    .map(a => (
      <tr key={a.id} style={{ opacity: a.isActive === false ? 0.5 : 1 }}>
         <td data-label="Photo">
    {a.photoURL ? (
      <img
        src={a.photoURL}
        alt="admin"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid #ddd"
        }}
      />
    ) : (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600
        }}
      >
        {a.name?.charAt(0).toUpperCase()}
      </div>
    )}
  </td>
        <td data-label="Name">{a.name}</td>
        <td data-label="Admin ID">{a.adminId}</td>
        <td data-label="Email">{a.email}</td>
        <td data-label="Phone">{a.phone}</td>
        <td data-label="Gender">{a.gender || "-"}</td>
        <td data-label="Qualification">{a.qualification || "-"}</td>
        <td data-label="Experience">{a.experience || "-"}</td>

        <td >
     
        <button
  className="view-btn"
  onClick={() => handleView(a)}
>
  <FaEye /> View
</button>
<button
  className="edit-btn"
  onClick={() => {
    if (onEdit) {
      onEdit(a); // 🔥 send to parent
    }
  }}
>
  <FaEdit /> Edit
</button>
<button
  className="disable-btn"
  style={{
    background: a.isActive ? "#f59e0b" : "#10b981",
    color: "#fff"
  }}
  onClick={() => handleDisable(a)}
>
  {a.isActive ? "Disable" : "Enable"}
  
</button>
          <button
            className="delete-btn"
            onClick={() =>
              requirePremium
                ? requirePremium(() => handleDelete(a.id))
                : handleDelete(a.id)
            }
          >
            <FaTrash /> Delete
          </button>
        </td>
      </tr>
    ))}
</tbody>

      </table>
      )}
   {formOnly && (
<div className="account-grid">
<FloatingInput
name="name"
label="Admin Name"
value={form.name}
focused={focused}
setFocused={setFocused}
onChange={e => setForm({ ...form, name: e.target.value })}
/>
<FloatingInput
  name="adminId"
  label="Admin ID"
  value={form.adminId}
  readOnly
/>

{/* PASSWORD */}
<div className="password-field">
<FloatingInput
name="password"
label={editId ? "New Password (optional)" : "Password"}
type={showPassword ? "text" : "password"}
value={password}
focused={focused}
setFocused={setFocused}
onChange={e => setPassword(e.target.value)}
rightIcon={showPassword ? <FaEyeSlash/> : <FaEye/>}
onRightIconClick={() => setShowPassword(prev => !prev)}
/>

<span onClick={()=>setShowPassword(prev=>!prev)}>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</span>

</div>
<FloatingInput
name="email"
label="Email"
value={form.email}
focused={focused}
setFocused={setFocused}
onChange={e => setForm({ ...form, email: e.target.value })}
/>
<FloatingInput
name="phone"
label="Phone"
type="tel"
value={form.phone}
focused={focused}
setFocused={setFocused}
onChange={e => {
const v = e.target.value.replace(/\D/g,"");
setForm({ ...form, phone: v.slice(0,10) });
}}
/>
<FloatingInput
name="address"
label="Address"
value={form.address}
focused={focused}
setFocused={setFocused}
onChange={e => setForm({ ...form, address: e.target.value })}
/>
<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={(e) => {
      e.stopPropagation();
      setShowGender(prev => !prev);
    }}
  >
    {form.gender || "Gender"}
    <span>▾</span>
  </div>

  {showGender && (
    <div className="adminpopup-menu"
    onClick={(e) => e.stopPropagation()}>

      {["Male","Female","Other"].map(g => (

        <div
          key={g}
          className={`popup-item ${form.gender === g ? "active" : ""}`}
          onClick={() => {
            setForm({ ...form, gender: g });
            setShowGender(false);
          }}
        >
          {form.gender === g && "✓ "}
          {g}

        </div>

      ))}

    </div>
  )}

</div>
<FloatingInput
name="qualification"
label="Qualification"
value={form.qualification}
focused={focused}
setFocused={setFocused}
onChange={e =>
setForm({ ...form, qualification: e.target.value })
}
/><FloatingInput
name="experience"
label="Experience (years)"
type="number"
value={form.experience}
focused={focused}
setFocused={setFocused}
onChange={e =>
setForm({ ...form, experience: e.target.value })
}
/>{/* PHOTO */}
<div className="photo-box">

<label className="photo-upload">

{form.photoURL ? (
<div className="photo-placeholder uploaded">

<img
src={form.photoURL}
alt="profile"
className="photo-preview"
onClick={(e)=>{
e.preventDefault();
setPreviewOpen(true);
}}
/>

<span className="photo-text success">
✔ Profile uploaded
</span>

</div>
) : (
<div className="photo-placeholder">
<FaUser className="photo-icon"/>
<span className="photo-text">
Upload profile picture
</span>
</div>
)}

<input
type="file"
accept="image/*"
onChange={(e)=>{
const file = e.target.files?.[0];
if(!file) return;

const reader = new FileReader();

reader.onloadend = () =>
setForm(prev => ({
...prev,
photoURL: reader.result
}));

reader.readAsDataURL(file);
}}
hidden
/>

</label>

</div>


{/* IMAGE PREVIEW MODAL */}

{previewOpen && (
<div
className="photo-modal"
onClick={()=>setPreviewOpen(false)}
>

<div
className="photo-modal-box"
onClick={(e)=>e.stopPropagation()}
>

<img
src={form.photoURL}
alt="preview"
className="photo-modal-img"
/>

</div>

</div>
)}

<button
  className="save"
  disabled={saving}
  onClick={() =>
    requirePremium
      ? requirePremium(handleSaveAdmin)
      : handleSaveAdmin()
  }
>
  {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
</button>

<button
className="cancel"
onClick={resetForm}
>
Reset
</button>
</div>
)}</> 
      
  )}
   

export default Admin;
