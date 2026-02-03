import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import loginPerson from "../../assets/login-person.png";
import { auth, db } from "../../services/firebase";
import logo from "../../assets/logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/UniversalLogin.css";
const UniversalLogin = () => {
    const [role, setRole] = useState(
        localStorage.getItem("selectedRole") || ""
      );  
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ---------------------------
  // MASTER LOGIN (EMAIL)
  // ---------------------------
  const handleMasterLogin = async () => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      alert("Register first");
      return;
    }

    const d = snap.data();

    localStorage.setItem("role", "master");
    localStorage.setItem("adminUid", user.uid);
    localStorage.setItem("profilePhoto", d.photoURL || "");
    localStorage.setItem("adminName", d.username || "");

    navigate("/dashboard");
  };

  // ---------------------------
  // SUB USER LOGIN
  // ---------------------------
  const handleSubLogin = async (collectionName, idField, roleName) => {

    const snap = await getDocs(
      query(
        collectionGroup(db, collectionName),
        where(idField, "==", userId.trim()),
        where("password", "==", password.trim())
      )
    );

    if (snap.empty) {
      alert("Invalid credentials");
      return;
    }

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    const adminUid = docSnap.ref.parent.parent.id;

    localStorage.setItem("role", roleName);
    localStorage.setItem("adminUid", adminUid);
    localStorage.setItem("profilePhoto", data.photoURL || "");
    localStorage.setItem("email", data.email || "");

    if (roleName === "teacher") {
      localStorage.setItem("teacherDocId", docSnap.id);
      localStorage.setItem("teacherName", data.name);
    }

    if (roleName === "parent") {
      localStorage.setItem("parentDocId", docSnap.id);
      localStorage.setItem("parentName", data.parentName);
    }

    if (roleName === "office_staff") {
      localStorage.setItem("staffDocId", docSnap.id);
      localStorage.setItem("staffName", data.name);
    }

    if (roleName === "admin") {
      localStorage.setItem("adminId", data.adminId);
      localStorage.setItem("adminName", data.name);
    }

    navigate("/dashboard");
  };

  // ---------------------------
  // MAIN LOGIN
  // ---------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {

      if (role === "master") {
        await handleMasterLogin();
      }

      if (role === "teacher") {
        await handleSubLogin("teachers", "teacherId", "teacher");
      }

      if (role === "parent") {
        await handleSubLogin("parents", "parentId", "parent");
      }

      if (role === "office_staff") {
        await handleSubLogin("office_staffs", "staffId", "office_staff");
      }

      if (role === "admin") {
        await handleSubLogin("admins", "adminId", "admin");
      }

    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // FORGOT PASSWORD (MASTER)
  // ---------------------------
  const handleForgotPassword = async () => {
    if (!email) return alert("Enter email first");
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent");
  };

  return (
    <div className="ul-page">
      <div className="ul-top-bg"></div>
  
      <div className="ul-card">
  
        <h1 className="ul-logo">LOGO</h1>
        <p className="ul-welcome">Hello 👋 Welcome!</p>
  
        <h2>Login</h2>
        <p className="ul-sub">
  {role.toUpperCase()} Login
</p>

        <p className="ul-sub">Please login to admin dashboard</p>
    
  
        <form onSubmit={handleLogin}>
  
          {role === "master" ? (
            <input
              placeholder="Email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />
          ) : (
            <input
              placeholder="User ID"
              value={userId}
              onChange={e=>setUserId(e.target.value)}
              required
            />
          )}
  
          <div className="password-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />
            <span onClick={()=>setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash/> : <FaEye/>}
            </span>
          </div>
  
          {role === "master" && (
            <p className="forgot-text" onClick={handleForgotPassword}>
              Forgot Password?
            </p>
          )}
  
          <button className="log-btn" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button></form></div>
    </div>
  );  
};
export default UniversalLogin;
