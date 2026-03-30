import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash , FaUser} from "react-icons/fa";
import "../dashboard_styles/Teacher.css";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const handleViewTeacher = (t) => {
  
  localStorage.setItem("viewTeacherId", t.teacherId);
  localStorage.setItem("teacherName", t.teacherName);


};




const FloatingInput = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  focused,
  setFocused,
  rightIcon,
  onRightIconClick
}) => (
  <div className={`floating-input ${focused === name || value ? "active" : ""}`}>
    
    <input
      type={type}
      placeholder={focused === name ? "" : label}
      value={value}
      onFocus={() => setFocused(name)}
      onBlur={() => setFocused(null)}
      onChange={onChange}
      style={{ paddingRight: rightIcon ? 40 : 14 }}
    />

    <label>{label}</label>

    {rightIcon && (
      <span
        onClick={onRightIconClick}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "#555"
        }}
      >
        {rightIcon}
      </span>
    )}
  </div>
);const Teacher = ({
  formOnly = false,
  requirePremium,
  globalSearch = "",
  setActivePage,
  editData,
  onEdit ,
  sortField,          // 🔥 ADD
  sortDirection   // 🔥 ADD
}) => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role"); // admin | sub_admin
  const [focused, setFocused] = useState(null);
  
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [classes, setClasses] = useState([]);
  const [showGender, setShowGender] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);
  // 🔥 MOVE THIS ABOVE Teacher COMPONENT

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    name: "",
    teacherId: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    qualification: "",
    experience: "",
    assignedClasses: [],
    photoURL: "",
    category: "Teaching Staff"  ,
    nonTeachingRole: ""
  });

  const [classForm, setClassForm] = useState({
    class: "",
    section: "",
    subject: ""
  });
  useEffect(() => {
    if (!adminUid) return;
  
    const ref = collection(db, "users", adminUid, "teachers");
  
    const unsubscribe = onSnapshot(ref, (snap) => {
      let list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
  
      // 🔥 CLASS SORT (special case)
      if (sortField === "class") {
        list.sort((a, b) => {
          const aVal = a.assignedClasses?.[0]?.class || "";
          const bVal = b.assignedClasses?.[0]?.class || "";
  
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      }
  
      // 🔥 NORMAL SORT
      else if (sortField) {
        list.sort((a, b) => {
          const aVal = (a[sortField] || "").toString().toLowerCase();
          const bVal = (b[sortField] || "").toString().toLowerCase();
  
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      }
  
      setTeachers(list);
    });
  
    return () => unsubscribe();
  }, [adminUid, sortField, sortDirection]); // 🔥 VERY IMPORTANT
  const removeAssignedClass = (index) => {
    setForm(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.filter((_, i) => i !== index)
    }));
  };
  
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedTeacherId");
    };
  }, []);
  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        assignedClasses: editData.assignedClasses || []
      });
  
      setEditId(editData.id);
      setPassword(editData.password || "");
    }
  }, [editData]);
  /* ================= ADD CLASS ================= */
  const addAssignedClass = () => {
    if (!classForm.class || !classForm.section || !classForm.subject) {
      alert("Fill class, section & subject");
      return;
    }
  
    const newClass = {
      class: classForm.class,
      section: classForm.section,
      subject: classForm.subject
    };
  
    setForm(prev => ({
      ...prev,
      assignedClasses: [...prev.assignedClasses, newClass]
    }));
  
    setClassForm({ class: "", section: "", subject: "" });
  };
  useEffect(() => {
    if (!adminUid) return;
  
    const fetchClasses = async () => {
      const snap = await getDocs(
        collection(db, "users", adminUid, "Classes")
      );
  
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
  
      setClasses(list);
    };
  
    fetchClasses();
  }, [adminUid]);
  const generateTeacherId = async () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const roleLetter = "T"; // 🔥 Teacher
  
    const snap = await getDocs(
      collection(db, "users", adminUid, "teachers")
    );
  
    const ids = snap.docs.map(d => d.data().teacherId || "");
  
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
  useEffect(() => {
    if (editData) {
      // 🔥 EDIT → keep original ID
      setForm({
        ...editData,
        assignedClasses: editData.assignedClasses || []
      });
  
      setEditId(editData.id);
      setPassword(editData.password || "");
    } else {
      // 🔥 CREATE → generate ID
      const loadId = async () => {
        const id = await generateTeacherId();
        setForm(prev => ({ ...prev, teacherId: id }));
      };
  
      loadId();
    }
  }, [editData]);
  /* ================= SAVE ================= */
  const handleSaveTeacher = async () => {
    try {
      setSaving(true);
      setSaved(false);
  
      /* ================= VALIDATION ================= */
      if (
        !form.name ||
      
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
    
  
      /* ================= SUB ADMIN ================= */
      if (role === "admin") {
        await addDoc(
          collection(db, "users", adminUid, "approval_requests"),
          {
            module: "teacher",
            action: editId ? "update" : "create",
            targetId: editId || null,
            payload: {
              ...form,
              teacherId: form.teacherId,
              password: password || null
            },
            status: "pending",
            createdAt: Timestamp.now()
          }
        );
  
        alert("⏳ Sent for approval");
        resetForm();
        return;
      }
  
      /* ================= MAIN ADMIN ================= */
      if (editId) {
        const updateData = {
          ...form,
          teacherId: form.teacherId,
          photoURL: form.photoURL || "",
          updatedAt: Timestamp.now()
        };
  
        if (password?.trim()) {
          updateData.password = password;
        }
  
        await updateDoc(
          doc(db, "users", adminUid, "teachers", editId),
          updateData
        );
        // 🔥 HISTORY UPDATE
await addDoc(
  collection(db, "users", adminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "TEACHER",
    name: form.name,
    role: form.category,
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
        const newId = await generateTeacherId();

await setDoc(
  doc(db, "users", adminUid, "teachers", newId),
  {
    ...form,
    teacherId: newId,
    photoURL: form.photoURL || "", 
    password,
    role: "teacher",
    isActive: true,
    createdAt: Timestamp.now()
  }
);
        // 🔥 HISTORY CREATE
await addDoc(
  collection(db, "users", adminUid, "Account", "accounts", "History"),
  {
    entryType: "people",
    module: "TEACHER",
    name: form.name,
    role: form.category,
    action: "CREATE",
    date: Timestamp.now(),
    createdAt: Timestamp.now(),
    originalData: {
      id: newId,   // 🔥 VERY IMPORTANT
      ...form,
      teacherId: newId
    }
  }
);
      }
  
      /* ================= SUCCESS ================= */
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  
      resetForm(); // 🔥 realtime handles table
  
    } catch (err) {
      console.error("🔥 ERROR:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDisable = async (teacher) => {
    try {
      const newStatus = !teacher.isActive;
  
      await updateDoc(
        doc(db, "users", adminUid, "teachers", teacher.id),
        {
          isActive: newStatus,
          updatedAt: Timestamp.now()
        }
      );
  
      // 🔥 HISTORY
      await addDoc(
        collection(db, "users", adminUid, "Account", "accounts", "History"),
        {
          entryType: "people",
          module: "TEACHER",
          name: teacher.name,
          role: teacher.category,
          action: newStatus ? "ENABLE" : "DISABLE",
          date: Timestamp.now(),
          createdAt: Timestamp.now(),
          originalData: {
            id: teacher.id,
            ...teacher,
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
  const handleDelete = async (id) => {
    if (!window.confirm("Delete teacher?")) return;
  
    try {
      const teacherDoc = teachers.find(t => t.id === id);
      if (!teacherDoc) return;
  
      /* 🔴 SUB ADMIN */
      if (role === "admin") {
        await addDoc(
          collection(db, "users", adminUid, "approval_requests"),
          {
            module: "teacher",
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
  
      // 🔥 1. SAVE HISTORY FIRST
      await addDoc(
        collection(db, "users", adminUid, "Account", "accounts", "History"),
        {
          entryType: "people",
          module: "TEACHER",
          name: teacherDoc.name,
          role: teacherDoc.category,
          action: "DELETE",
          date: Timestamp.now(),
          createdAt: Timestamp.now(),
          originalData: {
            id: teacherDoc.id,   // 🔥 IMPORTANT
            ...teacherDoc
          }
        }
      );
  
      // 🔥 2. DELETE
      await deleteDoc(
        doc(db, "users", adminUid, "teachers", id)
      );
  
      alert("Deleted + history saved ✅");
  
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };
 
  /* ================= RESET ================= */
  const resetForm = () => {
    
    setEditId(null);
    setPassword("");
    setForm({
      name: "",
      teacherId: "",
      email: "",
      phone: "",
      address: "",
      gender: "",
      qualification: "",
      experience: "",
      assignedClasses: [],
      photoURL: "",
      category: "Teaching Staff",
      nonTeachingRole: ""
    });
    
    setClassForm({ class: "", section: "", subject: "" });
  };
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

useEffect(() => {
  setSelectedTeacherId(
    localStorage.getItem("selectedTeacherId")
  );
}, []);
useEffect(() => {
  const closeAllDropdowns = () => {
    setShowGender(false);
    setShowCategory(false);
    setShowClassDropdown(false);
    setShowSectionDropdown(false);
    setShowRoleDropdown(false);
  };

  window.addEventListener("click", closeAllDropdowns);

  return () => {
    window.removeEventListener("click", closeAllDropdowns);
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
            <th>Teacher ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Classes</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {teachers
  .filter(t => {

    // ✅ From global dashboard search click
    if (selectedTeacherId) {
      return t.id === selectedTeacherId;
    }

    // ✅ Normal search
    return (
      t.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.teacherId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.email?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.phone?.includes(globalSearch)
    );
  })

            .map(t => (
              <tr key={t.id} style={{ opacity: t.isActive === false ? 0.5 : 1 }} className="mobile-card">
                 <td data-label="Photo">
    {t.photoURL ? (
      <img
        src={t.photoURL}
        alt="teacher"
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
        {t.name?.charAt(0).toUpperCase()}
      </div>
    )}
  </td>
                <td data-label="Name">{t.name}</td>

                <td data-label="Teacher ID">{t.teacherId}</td>

                <td data-label="Email">{t.email}</td>

                <td data-label="Phone">{t.phone}</td>

                <td data-label="Classes">
                {t.assignedClasses?.length
                    ? t.assignedClasses
                    .map(c => `${c.class}-${c.section}`)
                    .join(", ")
                    : "-"}
                </td>

                <td>
                <button
  className="view-btn"
  onClick={() => {
    localStorage.setItem("viewType", "teacher");
    localStorage.setItem("viewName", t.name);
    localStorage.setItem("viewId", t.teacherId);
    localStorage.setItem("viewPhoto", t.photoURL || "");
  
    // 🔥 ADD THIS LINE (VERY IMPORTANT)
    localStorage.setItem("teacherId", t.teacherId);
  
    setActivePage("subdashboard");
  }}
>
  <FaEye /> View
</button>
  <button
    className="edit-btn"
    onClick={() => {
      if (onEdit) {
        onEdit(t); // 🔥 send to parent
      }
    }}
  >
    <FaEdit /> Edit
  </button>
  <button
  className="disable-btn"
  style={{
    background: t.isActive ? "#f59e0b" : "#10b981",
    color: "#fff"
  }}
  onClick={() => handleDisable(t)}
>
  {t.isActive ? "Disable" : "Enable"}
</button>
  <button
    className="delete-btn"
    onClick={() =>
      requirePremium
        ? requirePremium(() => handleDelete(t.id))
        : handleDelete(t.id)
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
     {formOnly&& (

<div className="account-grid">



<FloatingInput
name="name"
label="Teacher Name"
value={form.name}
focused={focused}
setFocused={setFocused}
onChange={e => setForm({ ...form, name: e.target.value })}
/>

<FloatingInput
  name="teacherId"
  label="Teacher ID"
  value={form.teacherId}
  readOnly
/>


{/* PASSWORD */}
<div className="password-field">

<FloatingInput
name="password"
label="Password"
type={showPassword ? "text" : "password"}
value={password}
focused={focused}
setFocused={setFocused}
onChange={e => setPassword(e.target.value)}
/>

<span
className="password-toggle"
onClick={() => setShowPassword(prev => !prev)}
>
{showPassword ? <FaEyeSlash /> : <FaEye />}
</span>

</div>


<FloatingInput
name="email"
label="Email"
value={form.email}
focused={focused}
setFocused={setFocused}
onChange={(e) =>
setForm({ ...form, email: e.target.value })
}
/>

<FloatingInput
name="phone"
label="Phone"
value={form.phone}
focused={focused}
setFocused={setFocused}
maxLength={10}
onChange={e => {
const v = e.target.value.replace(/\D/g, "");
setForm({ ...form, phone: v.slice(0,10) });
}}
/>

<FloatingInput
name="address"
label="Address"
value={form.address}
focused={focused}
setFocused={setFocused}
rows={3}
onChange={e =>
setForm({ ...form, address: e.target.value })
}
/>
<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={(e) => {
      e.stopPropagation();   // 🔥 important
      setShowGender(prev => !prev);
    }}
  >
    {form.gender || "Gender"}
    <span>▾</span>
  </div>

  {showGender && (
    <div className="adminpopup-menu">

      {["Male", "Female", "Other"].map(g => (
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
<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={(e) => {
      e.stopPropagation();
      setShowCategory(prev => !prev);
    }}
  >
    {form.category || "Category"}
    <span>▾</span>
  </div>

  {showCategory && (
    <div className="adminpopup-menu">

      {["Teaching Staff", "Non Teaching Staff"].map(c => (
        <div
          key={c}
          className={`popup-item ${form.category === c ? "active" : ""}`}
          onClick={() => {
            setForm(prev => ({
              ...prev,
              category: c,
              assignedClasses:
                c === "Non Teaching Staff" ? [] : prev.assignedClasses,
              nonTeachingRole:
                c === "Teaching Staff" ? "" : prev.nonTeachingRole
            }));

            setShowCategory(false);
          }}
        >
          {form.category === c && "✓ "}
          {c}
        </div>
      ))}

    </div>
  )}

</div>
{/* PHOTO */}
<div className="photo-box">

<label className="photo-upload">

{form.photoURL ? (
<div className="photo-placeholder uploaded">

<img
src={form.photoURL}
alt="teacher"
className="photo-preview"
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
hidden
onChange={e=>{
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
/>

</label>

</div>
{/* Teaching Staff */}

{form.category === "Teaching Staff" &&  (

<>
<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={(e) => {
      e.stopPropagation();
      setShowClassDropdown(prev => !prev);
    }}
  >
    {classForm.class || "Class"}
    <span>▾</span>
  </div>

  {showClassDropdown && (
    <div className="adminpopup-menu">

      {classes.map(c => (
        <div
          key={c.id}
          className={`popup-item ${classForm.class === c.name ? "active" : ""}`}
          onClick={() => {
            setClassForm({ ...classForm, class: c.name });
            setShowClassDropdown(false);
          }}
        >
          {classForm.class === c.name && "✓ "}
          {c.name}
        </div>
      ))}

    </div>
  )}

</div>
<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={(e) => {
      e.stopPropagation();

      // 🔥 class select pannala na prevent
      if (!classForm.class) {
        alert("⚠️ First select class");
        return;
      }

      setShowSectionDropdown(prev => !prev);
    }}
  >
    {classForm.section || "Section"}
    <span>▾</span>
  </div>

  {showSectionDropdown && (
    <div className="adminpopup-menu">

      {classes
        .find(c => c.name === classForm.class)
        ?.sections?.map(sec => (
          <div
            key={sec}
            className={`popup-item ${classForm.section === sec ? "active" : ""}`}
            onClick={() => {
              setClassForm({ ...classForm, section: sec });
              setShowSectionDropdown(false);
            }}
          >
            {classForm.section === sec && "✓ "}
            {sec}
          </div>
        ))}

    </div>
  )}

</div>

<FloatingInput
name="subject"
label="Subject"
value={classForm.subject}
focused={focused}
setFocused={setFocused}
onChange={e =>
setClassForm({ ...classForm, subject: e.target.value })
}
/>

<button onClick={addAssignedClass}>
+ Add Class
</button>
<div className="assigned-class-inline">

  {(form.assignedClasses || []).map((c, i) => (
    <div key={i} className="inline-chip">

      <span>
        {c.class} {c.section} {c.subject}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeAssignedClass(i);
        }}
      >
        ✕
      </button>

    </div>
  ))}

</div>

</>

)}


{/* Non Teaching */}

{form.category === "Non Teaching Staff" && (
  <div className="adminpopup-select">

<div
  className="adminpopup-input"
  onClick={(e) => {
    e.stopPropagation();
    setShowRoleDropdown(prev => !prev);
  }}
>
  {form.nonTeachingRole || "Select Role"}
  <span>▾</span>
</div>

{showRoleDropdown && (
  <div className="adminpopup-menu">

    {["Helper", "ECA Staff"].map(role => (
      <div
        key={role}
        className={`popup-item ${form.nonTeachingRole === role ? "active" : ""}`}
        onClick={() => {
          setForm({ ...form, nonTeachingRole: role });
          setShowRoleDropdown(false);
        }}
      >
        {form.nonTeachingRole === role && "✓ "}
        {role}
      </div>
    ))}

  </div>
)}

</div>

)}
<button
  className="save"
  disabled={saving}
  onClick={() =>
    requirePremium
      ? requirePremium(handleSaveTeacher)
      : handleSaveTeacher()
  }
>
  {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
</button>

<button
className="cancel"
onClick={resetForm}
>
Cancel
</button>

</div>

)}
          </>
      )}
    

export default Teacher;
