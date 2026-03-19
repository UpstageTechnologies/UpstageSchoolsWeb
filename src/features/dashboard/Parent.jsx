import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash ,FaUser ,FaUndo} from "react-icons/fa";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,query, where,onSnapshot
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import "../dashboard_styles/Teacher.css";
import FloatingInput from "../../components/FloatingInput";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const handleViewParent = (p) => {
  localStorage.setItem("viewAs", "parent");
  localStorage.setItem("viewParentId", p.parentId);
  localStorage.setItem("parentName", p.parentName);

  window.open("/dashboard", "_blank");   // 👈 new tab
};
const Parent = ({ 
  formOnly = false, 
  requirePremium, 
  globalSearch = "", 
  setActivePage,
  editData,       
  onEdit,   // ✅ ADD THIS
  setEditData        // ✅ ADD THIS
}) => {
  /* ================= BASIC ================= */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role"); // admin | sub_admin
  const selectedParentId = localStorage.getItem("selectedParentId");

  const [parents, setParents] = useState([]);
 
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");
  const [studentCount, setStudentCount] = useState(0);
const [students, setStudents] = useState([]);
  const [studentsCount, setStudentsCount] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [openClassIndex, setOpenClassIndex] = useState(null);
  const [openSectionIndex, setOpenSectionIndex] = useState(null)
  const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    parentName: "",
    parentId: "",
    email: "",
    phone: "",
    address: "",
    photoURL: "" 
  });
  useEffect(() => {
    if (!adminUid) return;
  
    const ref = collection(db, "users", adminUid, "parents");
  
    const unsubscribe = onSnapshot(ref, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          (a.parentName || "")
            .toLowerCase()
            .localeCompare((b.parentName || "").toLowerCase())
        );
  
      setParents(list);
    });
  
    return () => unsubscribe();
  }, [adminUid]);

  useEffect(() => {
    if (editData) {
      setForm({
        parentName: editData.parentName || "",
        parentId: editData.parentId || "",
        email: editData.email || "",
        phone: editData.phone || "",
        address: editData.address || "",
        photoURL: editData.photoURL || ""
      });
  
      setEditId(editData.id);
    }
  }, [editData]);
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedParentId");
    };
  }, []);
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
          copy.push({ studentId: "", studentName: "", class: "", section: ""});
        }
      } else {
        copy.length = count;
      }
      return copy;
    });
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
  useEffect(() => {
    if (editData) {
      setForm({
        parentName: editData.parentName || "",
        parentId: editData.parentId || "",
        email: editData.email || "",
        phone: editData.phone || "",
        address: editData.address || "",
        photoURL: editData.photoURL || ""
      });
  
      setEditId(editData.id);
  
      // 🔥 LOAD STUDENTS ALSO
      const loadStudents = async () => {
        const snap = await getDocs(
          collection(db, "users", adminUid, "students")
        );
  
        const list = snap.docs
          .map(d => d.data())
          .filter(s => s.parentId === editData.parentId);
  
        setStudents(
          list.length
            ? list
            : [{ studentId: "", studentName: "", class: "", section: "" }]
        );
  
        setStudentsCount(list.length || 1);
      };
  
      loadStudents();
    }
  }, [editData]);
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
  
      /* ================= VALIDATION ================= */
      if (
        !form.parentName ||
        !form.parentId ||
        !form.email ||
        !form.phone ||
        !form.address ||
        students.some(s => !s.studentId || !s.studentName || !s.class || !s.section) ||
        (!editId && !password)
      ) {
        alert("❌ All fields required");
        return;
      }
  
      const parentIdTrim = form.parentId.trim();
      const phoneClean = form.phone.trim();
  
      if (!/^\d{10}$/.test(phoneClean)) {
        alert("📞 Phone must be 10 digits");
        return;
      }
  
      /* ================= CLEAN STUDENTS ================= */
      const cleanStudents = students.map(s => ({
        ...s,
        studentId: s.studentId.trim().toLowerCase()
      }));
  
      const ids = cleanStudents.map(s => s.studentId);
      const hasDuplicate = ids.some((id, i) => ids.indexOf(id) !== i);
  
      if (hasDuplicate) {
        alert("❌ Duplicate Student IDs");
        return;
      }
  
      /* ================= DUP CHECK ================= */
      const parentQ = query(
        collection(db, "users", adminUid, "parents"),
        where("parentId", "==", parentIdTrim)
      );
  
      const parentSnap = await getDocs(parentQ);
  
      if (!editId && !parentSnap.empty) {
        alert("❌ Parent ID already exists");
        return;
      }
  
      if (editId && !parentSnap.empty && parentSnap.docs[0].id !== editId) {
        alert("❌ Duplicate Parent ID");
        return;
      }
  
      /* ================= STUDENT GLOBAL CHECK ================= */
      for (const s of cleanStudents) {
        const q2 = query(
          collection(db, "users", adminUid, "students"),
          where("studentId", "==", s.studentId)
        );
  
        const snap2 = await getDocs(q2);
  
        if (!editId && !snap2.empty) {
          alert(`❌ Student ID "${s.studentId}" exists`);
          return;
        }
  
        if (editId && !snap2.empty) {
          const another = snap2.docs.find(
            d => d.data().parentId !== parentIdTrim
          );
  
          if (another) {
            alert(`❌ "${s.studentId}" used by another parent`);
            return;
          }
        }
      }
  
      /* ================= PAYLOAD ================= */
      const payload = {
        ...form,
        parentId: parentIdTrim,
        studentsCount,
        students: cleanStudents
      };
  
      /* ================= SUB ADMIN ================= */
      if (role === "admin") {
        await addDoc(
          collection(db, "users", adminUid, "approval_requests"),
          {
            module: "parent",
            action: editId ? "update" : "create",
            targetId: editId || null,
            payload: { ...payload, password: password || null },
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
        // update parent
        const updateData = {
          ...payload,
          updatedAt: Timestamp.now()
        };
  
        if (password?.trim()) {
          updateData.password = password;
        }
  
        await updateDoc(
          doc(db, "users", adminUid, "parents", editId),
          updateData
        );
  
      } else {
        // create parent
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
  
      /* ================= STUDENTS SYNC ================= */
      const existingSnap = await getDocs(
        collection(db, "users", adminUid, "students")
      );
  
      const existing = existingSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
  
      for (const s of cleanStudents) {
        const match = existing.find(
          x =>
            x.studentId?.toLowerCase() === s.studentId &&
            x.parentId === parentIdTrim
        );
  
        if (!match) {
          await addDoc(
            collection(db, "users", adminUid, "students"),
            {
              studentName: s.studentName,
              studentId: s.studentId,
              parentId: parentIdTrim,
              parentName: payload.parentName,
              class: s.class,
              section: s.section,
              createdAt: Timestamp.now()
            }
          );
        }
      }
  
      /* ================= SUCCESS ================= */
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  
      resetForm(); // 🔥 no fetch needed
  
    } catch (err) {
      console.error("🔥 ERROR:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete parent and all students?")) return;
  
    if (role === "admin") {
      // … your approval request logic (same)
      return;
    }
  
    // 1️⃣ get parent
    const parentDoc = parents.find(p => p.id === id);
    if (!parentDoc) return;
  
    // 2️⃣ delete students belonging to parent
    const snap = await getDocs(
      collection(db, "users", adminUid, "students")
    );
  
    for (const d of snap.docs) {
      if (d.data().parentId === parentDoc.parentId) {
        await deleteDoc(
          doc(db, "users", adminUid, "students", d.id)
        );
      }
    }
  
    // 3️⃣ delete parent
    await deleteDoc(doc(db, "users", adminUid, "parents", id));
  
  };
  const handleEdit = (p) => {
    if (onEdit) {
      onEdit(p); // 🔥 send to parent component
    }
  };
  const resetForm = () => {
    setEditId(null);
    setPassword("");
    setStudentsCount(1);
    setStudents([{ studentId: "", studentName: "", class: "", section: "" }]);
    setForm({
      parentName: "",
      parentId: "",
      email: "",
      phone: "",
      address: "",
      photoURL: ""
    });
  };

  /* ================= UI ================= */
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
  .filter(p => {

    // ✅ From global search
    if (selectedParentId) {
      return p.id === selectedParentId;
    }

    // ✅ Normal search
    return (
      
  p.parentName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
  p.parentId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
  p.email?.toLowerCase().includes(globalSearch.toLowerCase()) ||
  p.phone?.includes(globalSearch) ||
  p.address?.toLowerCase().includes(globalSearch.toLowerCase())
    );
  })


    .map(p => (
      <tr key={p.id} className="mobile-card">
       <td data-label="Photo">
  {p.photoURL ? (
    <img
      src={p.photoURL}
      alt=""
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />
  ) : (
    <div
     
    >
      {p.parentName?.charAt(0) || "P"}
    </div>
  )}
</td>


        <td data-label="Name">{p.parentName}</td>
        <td data-label="Parent ID">{p.parentId}</td>
        <td data-label="Students">{p.studentsCount}</td>
        <td data-label="Email">{p.email}</td>
        <td data-label="Phone">{p.phone}</td>
        <td data-label="Address">{p.address}</td>
        <td >
<button
  className="view-btn"
  onClick={() => {
    localStorage.setItem("viewType", "parent");
    localStorage.setItem("viewName", p.parentName);
    localStorage.setItem("parentName", p.parentName); // 🔥 ADD THIS
    localStorage.setItem("viewId", p.parentId);
    localStorage.setItem("parentId", p.parentId);     // 🔥 ADD THIS
    localStorage.setItem("adminUid", auth.currentUser.uid);
  
    setActivePage("subdashboard");
  }}
  
>
  <FaEye /> View
</button>
<button className="edit-btn"onClick={() => handleEdit(p)}>
<FaEdit /> Edit
</button>
<button
  className="delete-btn"
  onClick={() =>
    requirePremium
      ? requirePremium(() => handleDelete(p.id))
      : handleDelete(p.id)
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
      {/* MODAL same as before */}
      {formOnly && (
       <>
          <div className="account-grid">
 
          <FloatingInput
name="parentName"
label="Parent Name"
value={form.parentName}
focused={focused}
setFocused={setFocused}
onChange={e =>
setForm({ ...form, parentName: e.target.value })
}
/>
<FloatingInput
name="parentId"
label="Parent ID"
value={form.parentId}
focused={focused}
setFocused={setFocused}
onChange={e =>
  setForm({ ...form, parentId: e.target.value })
}
/>
<FloatingInput
name="email"
label="Email"
value={form.email}
focused={focused}
setFocused={setFocused}
onChange={e =>
  setForm({ ...form, email: e.target.value })
}
/><FloatingInput
name="phone"
label="Phone"
value={form.phone}
focused={focused}
setFocused={setFocused}
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
onChange={e =>
  setForm({ ...form, address: e.target.value })
}
/>
            <div style={{ position: "relative" }}>
            <FloatingInput
name="password"
label="Password"
type={showPassword ? "text" : "password"}
value={password}
focused={focused}
setFocused={setFocused}
onChange={e => setPassword(e.target.value)}
rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
onRightIconClick={() => setShowPassword(prev => !prev)}
/>
         </div>

         <FloatingInput
name="studentCount"
label="Number of Students"
type="number"
value={studentCount}
focused={focused}
setFocused={setFocused}
onChange={(e) => {
  const count = parseInt(e.target.value) || 0;

  setStudentCount(count);

  setStudents(
    Array.from({ length: count }, () => ({
      studentName: "",
      studentId: ""
    }))
  );
}}
/>

{students.map((s, i) => (
  <React.Fragment key={i}>


<FloatingInput
name={`studentId${i}`}
label={`Student ${i + 1} ID`}
value={s.studentId}
focused={focused}
setFocused={setFocused}
onChange={e =>
  handleStudentChange(i, "studentId", e.target.value)
}
/>

<FloatingInput
name={`studentName${i}`}
label={`Student ${i + 1} Name`}
value={s.studentName}
focused={focused}
setFocused={setFocused}
onChange={e =>
  handleStudentChange(i, "studentName", e.target.value)
}
/>


<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={() =>
      setOpenClassIndex(openClassIndex === i ? null : i)
    }
  >
    {s.class || "Class"}
    <span>▾</span>
  </div>

  {openClassIndex === i && (
    <div className="adminpopup-menu">

      {classes.map(c => (

        <div
          key={c.id}
          className="drop-item"
          onClick={()=>{
            handleStudentChange(i, "class", c.name);
            setOpenClassIndex(null);
          }}
        >
          {c.name}
        </div>

      ))}

    </div>
  )}

</div>
<div className="adminpopup-select">

  <div
    className="adminpopup-input"
    onClick={() =>
      setOpenSectionIndex(openSectionIndex === i ? null : i)
    }
  >
    {s.section || "Section"}
    <span>▾</span>
  </div>

  {openSectionIndex === i && (
    <div className="adminpopup-menu">

      {classes
        .find(c => c.name === s.class)
        ?.sections?.map(sec => (

        <div
          key={sec}
          className="drop-item"
          onClick={()=>{
            handleStudentChange(i, "section", sec);
            setOpenSectionIndex(null);
          }}
        >
          {sec}
        </div>

      ))}

    </div>
  )}

</div>


  </React.Fragment>
))}
{/* PHOTO */}
<div className="photo-box">

<label className="photo-upload">

{form.photoURL ? (
<div className="photo-placeholder uploaded">

<img
src={form.photoURL}
alt="parent"
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
      ? requirePremium(handleSave)
      : handleSave()
  }
>
  {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
</button>
              <button className="cancel" onClick={resetForm}>
                <FaUndo /> Reset
              </button>
          
            </div>
          </>
          
      )}
    </>
  );
};

export default Parent;
