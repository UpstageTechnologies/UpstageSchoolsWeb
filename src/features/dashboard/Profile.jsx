import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../dashboard_styles/Profile.css";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import Cropper from "react-easy-crop";
import { onSnapshot } from "firebase/firestore";


export default function Profile() {
  const role = localStorage.getItem("role");

  const [data, setData] = useState(null);
  const [adminUid, setAdminUid] = useState(null);
  const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");

  const [editing, setEditing] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("me");

  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [schoolEmail, setSchoolEmail] = useState("");
const [schoolAddress, setSchoolAddress] = useState("");
const [gstNumber, setGstNumber] = useState("");


  useEffect(() => {
    const uid =
      role === "master"
        ? auth.currentUser?.uid
        : localStorage.getItem("adminUid");
    setAdminUid(uid);
  }, [role]);
  useEffect(() => {
    if (cropOpen) {
      document.body.classList.add("crop-open");
    } else {
      document.body.classList.remove("crop-open");
    }
  }, [cropOpen]);
  

  useEffect(() => {
    if (!adminUid) return;
  
    let ref = doc(db, "users", adminUid);
    if (role === "admin") ref = doc(db, "users", adminUid, "admins", localStorage.getItem("adminId"));
    if (role === "teacher") ref = doc(db, "users", adminUid, "teachers", localStorage.getItem("teacherDocId"));
    if (role === "parent") ref = doc(db, "users", adminUid, "parents", localStorage.getItem("parentDocId"));
  
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
    
        setData(d);
        setEditName(d?.name || "");
        setEditEmail(d?.email || "");
        setSchoolName(d?.schoolName || "");
        setSchoolLogo(d?.schoolLogo || "");
    
        // ✅ ADD THESE HERE
        setPhone(d?.phone || "");
        setAddress(d?.address || "");
        setSchoolEmail(d?.schoolEmail || "");
        setSchoolAddress(d?.schoolAddress || "");
        setGstNumber(d?.gstNumber || "");
    
        // navbar sync
        localStorage.setItem("profilePhoto", d.photoURL || "");
        localStorage.setItem("adminName", d.name || d.username || "");
        localStorage.setItem("email", d.email || "");
    
        window.dispatchEvent(new Event("profile-updated"));
        setLoading(false);
      }
    });
    
  
    return () => unsub();
  }, [adminUid, role]);
  

  const handleApplyCrop = async () => {
    if (!croppedPixels || !imageSrc) return;
  
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imageSrc;
    await new Promise(r => (img.onload = r));
  
    canvas.width = croppedPixels.width;
    canvas.height = croppedPixels.height;
    const ctx = canvas.getContext("2d");
  
    ctx.drawImage(
      img,
      croppedPixels.x,
      croppedPixels.y,
      croppedPixels.width,
      croppedPixels.height,
      0,
      0,
      croppedPixels.width,
      croppedPixels.height
    );
  
    const base64 = canvas.toDataURL("image/jpeg");
  
    if (activeTab === "me") {
      setData(p => ({ ...p, photoURL: base64 }));
    } else {
      setSchoolLogo(base64);
    }
  
    setCropOpen(false);
  };
  

  const saveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");
  
      setSaving(true);
      setSaveSuccess(false);
  
      // Email change
      if (editEmail !== user.email) {
        await verifyBeforeUpdateEmail(user, editEmail);
        setSaving(false);
        alert("Verification mail sent");
        return;
      }
  
      let ref;
      if (role === "master") ref = doc(db, "users", adminUid);
      if (role === "admin") ref = doc(db, "users", adminUid, "admins", localStorage.getItem("adminId"));
      if (role === "teacher") ref = doc(db, "users", adminUid, "teachers", localStorage.getItem("teacherDocId"));
      if (role === "parent") ref = doc(db, "users", adminUid, "parents", localStorage.getItem("parentDocId"));
  
      const updatedData = {
        name: editName,
        username: editName,
        email: editEmail,
        phone,
        address,
        photoURL: data.photoURL || "",
      
        ...(role === "master" && {
          schoolName,
          schoolLogo,
          schoolEmail,
          schoolAddress,
          gstNumber
        })
      };
      
  
      await updateDoc(ref, updatedData);
  
      // 🔥 instant navbar + sidebar sync
      localStorage.setItem("profilePhoto", updatedData.photoURL || "");
      localStorage.setItem("adminName", editName);
      localStorage.setItem("email", editEmail);
  
      if (role === "master") {
        localStorage.setItem("schoolName", schoolName || "");
        localStorage.setItem("schoolLogo", schoolLogo || "");
      }
  
      window.dispatchEvent(new Event("profile-updated"));
  
      setSaving(false);
      setSaveSuccess(true);
  
      setTimeout(() => {
        setSaveSuccess(false);
        setEditing(false);
      }, 1200);
  
    } catch (e) {
      setSaving(false);
      alert(e.message);
    }
  };
  const resetFormFromData = () => {
    if (!data) return;
  
    setEditName(data.name || "");
    setEditEmail(data.email || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
  
    setSchoolName(data.schoolName || "");
    setSchoolEmail(data.schoolEmail || "");
    setSchoolAddress(data.schoolAddress || "");
    setGstNumber(data.gstNumber || "");
    setSchoolLogo(data.schoolLogo || "");
  };
  
  
  if (loading) return <div className="profile-loading"></div>;

  return (
    <div className="profile-root">
      <div className="profile-shell">

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={activeTab === "me" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("me")}>
            👤 Me
          </button>
          <button className={activeTab === "school" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("school")} disabled={role !== "master"}>
            🏫 School
          </button>
        </div>

        {/* Hero */}
        <div className="profile-hero">
          <div className="avatar-container">
            <div className="avatar-ring">
            {activeTab === "me" ? (
  data?.photoURL ? <img src={data.photoURL} /> : <FaUserCircle />
) : (
  schoolLogo ? <img src={schoolLogo} /> : <FaUserCircle />
)}

            </div>

            {editing && (
              <label className="avatar-fab">
                <FaCamera />
                <input type="file" hidden accept="image/*" onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    setImageSrc(reader.result);
    setCropOpen(true);
  };
  reader.readAsDataURL(file);
}}
 />
              </label>
            )}
          </div>

          {activeTab === "me" ? (
  <div className="hero-text">
    <h1>{editName || "Your Name"}</h1>
    <p>{editEmail}</p>
  </div>
) : (
  <div className="hero-text">
    <h1>{schoolName || "School Name"}</h1>
    <p className="muted">School Profile</p>
  </div>
)}

        </div>

        {/* Crop */}
        {cropOpen && (
  <div className="crop-modal">
    <div className="crop-box">

      <div className="cropper-wrapper">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
        />
      </div>

      <input
        className="zoom-slider"
        type="range"
        min={1}
        max={3}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(e.target.value)}
      />

      <div className="crop-actions">
        <button className="btn-secondary" onClick={() => setCropOpen(false)}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleApplyCrop}>
          Apply
        </button>
      </div>

    </div>
  </div>
)}


        {/* Card */}
        <div className="profile-card">
          {activeTab === "me" ? (
            <>
              <div className="profile-row">
                <label>Name</label>
                <input disabled={!editing} value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="profile-row">
                <label>Email</label>
                <input disabled={!editing} value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="profile-row">
      <label>Phone Number</label>
      <input disabled={!editing} value={phone}
        onChange={e => setPhone(e.target.value)} />
    </div>

    <div className="profile-row">
      <label>Address</label>
      <textarea disabled={!editing} value={address}
        onChange={e => setAddress(e.target.value)} />
    </div>
            </>
          ) : (
            role === "master" && (
              <>
                <div className="profile-row">
                  <label>School Name</label>
                  <input disabled={!editing} value={schoolName} onChange={e => setSchoolName(e.target.value)} />
                </div>
                <div className="profile-row">
      <label>School Email</label>
      <input disabled={!editing} value={schoolEmail}
        onChange={e => setSchoolEmail(e.target.value)} />
    </div>

    <div className="profile-row">
      <label>GST Number</label>
      <input disabled={!editing} value={gstNumber}
        onChange={e => setGstNumber(e.target.value)} />
    </div>

    <div className="profile-row">
      <label>School Address</label>
      <textarea disabled={!editing} value={schoolAddress}
        onChange={e => setSchoolAddress(e.target.value)} />
    </div>
                
              </>
            )
          )}

          <div className="profile-actions">
            {!editing ? (
              <button className="btn-primary" onClick={() => setEditing(true)}>Edit</button>
            ) : (
              <>
                <button
                 className="btn-secondary"
                 onClick={() => {
                  resetFormFromData(); // 🔥 reset values
                  setEditing(false);  // exit edit mode
                }}
                >
                 Cancel
                 </button>

                <button className="btn-primary" onClick={saveProfile}>
                  {saving ? "Saving..." : saveSuccess ? "Saved ✓" : "Save"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
