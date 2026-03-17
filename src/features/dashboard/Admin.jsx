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
  getDoc,setDoc
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
  onEdit   // 🔥 ADD
}) => {

  const [admins, setAdmins] = useState([]);
  const [focused, setFocused] = useState(null);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showGender,setShowGender] =useState(false);
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


  /* ================= FETCH ADMINS ================= */
  const fetchAdmins = async () => {
    if (!superAdminUid) return;

    const snap = await getDocs(
      collection(db, "users", superAdminUid, "admins")
    );

    setAdmins(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  };
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
  useEffect(() => {
    fetchAdmins();
  }, [superAdminUid]);

  /* ================= ADD / EDIT ADMIN ================= */
  const handleSaveAdmin = async () => {
    if (!superAdminUid) {
      alert("Master not authenticated");
      return;
    }
  
    if (
      !form.name ||
      !form.adminId ||
      !form.email ||
      !form.phone ||
      (!editId && !password)
    ) {
      alert("Required fields missing");
      return;
    }
    const phoneClean = form.phone.trim();

if (!/^\d{10}$/.test(phoneClean)) {
  alert("📞 Phone number must be exactly 10 digits");
  return;
}

  
    if (editId) {
      // --- UPDATE (same as before) ---
      const updateData = {
        ...form,
        role: "admin",                 // 👈 force correct role always
        updatedAt: Timestamp.now()
        
      };
      
      if (password && password.trim() !== "") {
        updateData.password = password;
      }
      
    
      await updateDoc(
        doc(db, "users", superAdminUid, "admins", editId),
        updateData
      );
    } 
    else {
      // 🔎 1️⃣ CHECK DUPLICATE
      const existing = await getDoc(
        doc(db, "users", superAdminUid, "admins", form.adminId)
      );
    
      if (existing.exists()) {
        alert("❌ Admin ID already exists. Use a different ID.");
        return;
      }
    
      // 🆕 2️⃣ CREATE NEW
      await setDoc(
        doc(db, "users", superAdminUid, "admins", form.adminId),
        {
          ...form,
          password,
          role: "admin",
          createdAt: Timestamp.now()
        }
      );
    }
    
  
    resetForm();
    fetchAdmins();
  };
  

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete admin?")) return;

    await deleteDoc(
      doc(db, "users", superAdminUid, "admins", id)
    );
    fetchAdmins();
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
    setActivePage("subdashboard");
  };
  
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedAdminId");
    };
  }, []);
  
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
      <tr key={a.id} className="mobile-card">
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
            className="delete-btn"
            onClick={() => requirePremium(() => handleDelete(a.id))}
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
focused={focused}
setFocused={setFocused}
onChange={e => setForm({ ...form, adminId: e.target.value })}
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
<div className="popup-select">

  <div
    className="popup-input"
    onClick={() => setShowGender(prev => !prev)}
  >
    {form.gender || "Gender"}
    <span>▾</span>
  </div>

  {showGender && (
    <div className="popup-menu">

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
onClick={()=>requirePremium ? requirePremium(handleSaveAdmin) : handleSaveAdmin()}
>
Save
</button>

<button
className="cancel"
onClick={resetForm}
>
Cancel
</button>
</div>
)}</> 
      
  )}
   

export default Admin;
