import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye ,FaUser,FaBan,FaCheck } from "react-icons/fa";
import "../dashboard_styles/Teacher.css";
import { onSnapshot } from "firebase/firestore"; 
import FloatingInput from "../../components/FloatingInput";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,query, where,setDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
const selectedStudentId = localStorage.getItem("selectedStudentId");
const Student = ({
  formOnly = false,
  requirePremium,
  globalSearch = "",
  editData,
  onEdit,
  sortField,        // 🔥 ADD
  sortDirection 
}) => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role");

  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [focused, setFocused] = useState(null);
  const [showClass, setShowClass] = useState(false);
const [showSection, setShowSection] = useState(false);
const [classes, setClasses] = useState([]);
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    parentId: "",
    parentName: "",
    gender: "",
    dob: "",
    phone: "",
    address: "",
    class: "",
    section: "",
    photoURL: ""  
  });
  const selectedClass = classes.find(c => c.name === form.class)
  const safePremium = requirePremium ?? ((fn) => fn());
  useEffect(() => {
    if (!adminUid) return;
  
    const ref = collection(db, "users", adminUid, "students");
  
    const unsubscribe = onSnapshot(ref, (snap) => {
      let list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
  
      // 🔥 NAME SORT (studentName)
      if (sortField === "studentName") {
        list.sort((a, b) => {
          const aVal = (a.studentName || "").toLowerCase();
          const bVal = (b.studentName || "").toLowerCase();
  
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      }
  
      // 🔥 CLASS SORT
      else if (sortField === "class") {
        list.sort((a, b) => {
          const aVal = (a.class || "").toLowerCase();
          const bVal = (b.class || "").toLowerCase();
  
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      }
  
      // 🔥 DEFAULT (dynamic fallback)
      else if (sortField) {
        list.sort((a, b) => {
          const aVal = (a[sortField] || "").toString().toLowerCase();
          const bVal = (b[sortField] || "").toString().toLowerCase();
  
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      }
  
      setStudents(list);
    });
  
    return () => unsubscribe();
  }, [adminUid, sortField, sortDirection]); // 🔥 IMPORTANT
  useEffect(() => {
    if (editData) {
      setForm({
        studentName: editData.studentName || "",
        studentId: editData.studentId || "",
        parentId: editData.parentId || "",
        parentName: editData.parentName || "",
        gender: editData.gender || "",
        dob: editData.dob || "",
        phone: editData.phone || "",
        address: editData.address || "",
        class: editData.class || "",
        section: editData.section || "",
        photoURL: editData.photoURL || ""
      });
  
      setEditId(editData.id);
    }
  }, [editData]);
  useEffect(() => {

    const fetchClasses = async () => {
    
    const snap = await getDocs(
    collection(db,"users",adminUid,"Classes")
    )
    
    const list = snap.docs.map(d => ({
    id:d.id,
    ...d.data()
    }))
    
    setClasses(list)
    
    }
    
    fetchClasses()
    
    },[adminUid])
    const generateStudentId = async () => {
      const year = new Date().getFullYear().toString().slice(-2);
      const roleLetter = "S";
    
      const snap = await getDocs(
        collection(db, "users", adminUid, "students")
      );
    
      const ids = snap.docs.map(d => d.data().studentId || "");
    
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
      const loadId = async () => {
        const id = await generateStudentId();
        setForm(prev => ({ ...prev, studentId: id }));
      };
    
      if (!editId) loadId();
    }, []);
    const handleSaveStudent = async () => {
      try {
        setSaving(true);
        setSaved(false);
    
        if (
          !form.studentName ||
          !form.parentId ||
          !form.parentName ||
          !form.class ||
          !form.section
        ) {
          alert("❌ Required fields missing");
          return;
        }
    
    
        // 🟢 UPDATE
        if (editId) {
          const updateData = {
            ...form,
            studentId: idTrim,
            photoURL: form.photoURL || "",   // ✅ ADD THIS
            updatedAt: Timestamp.now()
          };
    
          await updateDoc(
            doc(db, "users", adminUid, "students", editId),
            updateData
          );
    
          // ✅ ONLY UPDATE HISTORY
          await addDoc(
            collection(db, "users", adminUid, "Account", "accounts", "History"),
            {
              entryType: "people",
              module: "STUDENT",
              name: form.studentName,
              role: form.class,
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
    
        // 🟢 CREATE
        else {
          const newId = await generateStudentId();

await setDoc(
  doc(db, "users", adminUid, "students", newId),
  {
    ...form,
    studentId: newId,
    photoURL: form.photoURL || "",   // ✅ ADD THIS
    isActive: true,
    createdAt: Timestamp.now()
  }
);
    
          // ✅ ONLY CREATE HISTORY
          await addDoc(
            collection(db, "users", adminUid, "Account", "accounts", "History"),
            {
              entryType: "people",
              module: "STUDENT",
              name: form.studentName,
              role: form.class,
              action: "CREATE",
              date: Timestamp.now(),
              createdAt: Timestamp.now(),
              originalData: {
                id: newId, // 🔥 IMPORTANT
                ...form,
                studentId: form.studentId
              }
            }
          );
        }
    
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    
        resetForm();
    
      } catch (err) {
        console.error(err);
        alert("❌ Save failed");
      } finally {
        setSaving(false);
      }
    };
    const handleDisable = async (student) => {
      try {
        const newStatus = !student.isActive;
    
        await updateDoc(
          doc(db, "users", adminUid, "students", student.id),
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
            module: "STUDENT",
            name: student.studentName,
            role: student.class,
            action: newStatus ? "ENABLE" : "DISABLE",
            date: Timestamp.now(),
            createdAt: Timestamp.now(),
            originalData: {
              id: student.id,
              ...student,
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
    const handleDeleteStudent = async (student) => {
      if (!window.confirm("Delete student?")) return;
    
      // 🔥 UI remove instantly
      setStudents(prev => prev.filter(s => s.id !== student.id));
    
      try {
        // 🔥 HISTORY SAVE
        await addDoc(
          collection(db, "users", adminUid, "Account", "accounts", "History"),
          {
            entryType: "people",
            module: "STUDENT",
            name: student.studentName,
            role: student.class,
            action: "DELETE",
            date: Timestamp.now(),
            createdAt: Timestamp.now(),
            originalData: {
              id: student.id,
              ...student
            }
          }
        );
    
        // 🔥 DELETE FROM FIRESTORE
        await deleteDoc(
          doc(db, "users", adminUid, "students", student.id)
        );
    
      } catch (err) {
        console.error(err);
        alert("Delete failed ❌");
      }
    };

  const resetForm = () => {
  
    setEditId(null);
    setForm({
      studentName: "",
      studentId: "",
      parentId: "",
      parentName: "",
      gender: "",
      dob: "",
      phone: "",
      address: "",
      class: "",
      section: "",
      photoURL: ""  
    });
  };

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
            <th>ID</th>
            <th>Parent</th>
            <th>Class</th>
            <th>Section</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students
  .filter(s => {
    if (selectedStudentId) {
      const found = s.id === selectedStudentId;
      if (found) {
        localStorage.removeItem("selectedStudentId"); // 🔥 auto clear
      }
      return found;
    }

    // ✅ Normal table search
    return (
      s.studentName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.parentName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.parentId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.class?.toString().includes(globalSearch) ||
      s.section?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.phone?.includes(globalSearch)
    );
  })
  .map(s => (
    <tr
    key={s.id}
    style={{ opacity: s.isActive === false ? 0.5 : 1 }}className="mobile-card">
                 <td data-label="Photo">
          {s.photoURL ? (
            <img
              src={s.photoURL}
              alt=""
              
            />
          ) : (
            <div
             
            >
              {s.studentName?.charAt(0) || "S"}
            </div>
          )}
        </td>
                <td data-label="Name">{s.studentName}</td>
                <td data-label="Student ID">{s.studentId}</td>
                <td data-label="Parent">{s.parentName}</td>
                <td data-label="Class">{s.class}</td>
                <td data-label="Section">{s.section}</td>

                <td >
                <button
    className="view-btn"
    onClick={() => setViewStudent(s)}
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
  className={`disable-btn ${!s.isActive ? "enable" : ""}`}
  onClick={() => handleDisable(s)}
>
  {s.isActive ? <FaBan /> : <FaCheck />}
  {s.isActive ? "Disable" : "Enable"}
</button>
  <button
    className="delete-btn"
    onClick={() => safePremium(() => handleDeleteStudent(s))}
  >
    <FaTrash /> Delete
  </button>
  
</td>

              </tr>
            ))}
        </tbody>
      </table>
      )}
      {viewStudent && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Student Details</h3>

      <div style={{ textAlign: "center", marginBottom: 15 }}>
        {viewStudent.photoURL ? (
          <img
            src={viewStudent.photoURL}
            alt=""
           
          />
        ) : (
          <div
           
          >
            {viewStudent.studentName?.charAt(0)}
          </div>
        )}
      </div>

      <p><b>Name:</b> {viewStudent.studentName}</p>
      <p><b>Student ID:</b> {viewStudent.studentId}</p>
      <p><b>Parent:</b> {viewStudent.parentName}</p>
      <p><b>Parent ID:</b> {viewStudent.parentId}</p>
      <p><b>Class:</b> {viewStudent.class}</p>
      <p><b>Section:</b> {viewStudent.section}</p>
      <p><b>Phone:</b> {viewStudent.phone || "-"}</p>
      <p><b>Address:</b> {viewStudent.address || "-"}</p>

      <div className="modal-actions">
        <button className="cancel" onClick={() => setViewStudent(null)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}
{formOnly && (
<div className="account-grid">
<FloatingInput
  name="studentName"
  label="Student Name"
  value={form.studentName}
  focused={focused}
  setFocused={setFocused}
  onChange={e =>
    setForm({ ...form, studentName: e.target.value })
  }
/>
<FloatingInput
  name="studentId"
  label="Student ID"
  value={form.studentId}
  readOnly
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
  name="parentName"
  label="Parent Name"
  value={form.parentName}
  focused={focused}
  setFocused={setFocused}
  onChange={e =>
    setForm({ ...form, parentName: e.target.value })
  }
/>
<div className="adminpopup-select">

<div
className="adminpopup-input"
onClick={() => setShowClass(!showClass)}
>
{form.class || "Class"}
<span>▾</span>
</div>

{showClass && (

<div className="adminpopup-menu">

{classes.map(c => (

<div
key={c.id}
className="popup-item"
onClick={()=>{
setForm({...form,class:c.name,section:""})
setShowClass(false)
}}
>

Class {c.name}

</div>

))}

</div>

)}

</div><div className="adminpopup-select">

<div
  className="adminpopup-input"
  onClick={() => {
    if (!form.class) {
      alert("⚠️ First select class")
      return
    }
    setShowSection(!showSection)
    setShowClass(false)
  }}
>
  {form.section ? `Section ${form.section}` : "Section"}
  <span>▾</span>
</div>

{showSection && (

  <div className="adminpopup-menu">

    {selectedClass?.sections?.map(s => (

      <div
        key={s}
        className={`popup-item ${form.section === s ? "active" : ""}`}
        onClick={() => {
          setForm(prev => ({ ...prev, section: s }))
          setShowSection(false)
        }}
      >
        Section {s}
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
alt="student"
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
<button
  className="save"
  disabled={saving}
  onClick={() => safePremium(handleSaveStudent)}
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
)}
    </>
  );
};
export default Student;
 