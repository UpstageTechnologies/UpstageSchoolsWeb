import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import logo from "../../assets/logo.jpeg";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc ,serverTimestamp } from "firebase/firestore";
import "../styles/UniversalLogin.css";


const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });
  

  // GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // STORE TO FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        username: username || "",
        email: user.email,
        isGoogle: true,
        plan: "basic",
        role: "master",
        createdAt: serverTimestamp()
      });

          // ⭐ SAVE LOGIN CONTEXT ⭐
    localStorage.setItem("role", "master");
    localStorage.setItem("adminUid", user.uid);

      navigate("/dashboard", {
        state: { email: user.email, isGoogle: true }
      });

    } catch (err) {
      
    }
  };

  // NORMAL REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // SAVE USER TO FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        isGoogle: false,
        plan: "basic",
        role: "master",
        createdAt: serverTimestamp()
      });
          // ⭐ SAVE LOGIN CONTEXT ⭐
    localStorage.setItem("role", "master");
    localStorage.setItem("adminUid", user.uid);

      navigate("/dashboard", {
        state: { email, password, username, isGoogle: false }
      });

    } catch (err) {
      setError(err.message);
    }finally {
      setLoading(false);
    }
  };

  return (
    
      <div className="ul-page">
        <div className="ul-top-bg"></div>
    
        <div className="ul-card">
    
          <h1 className="ul-logo">LOGO</h1>
          <p className="ul-welcome">Hello 👋 Welcome!</p>
    
          <h2>Register</h2>
          <p className="ul-sub">Create your master account</p>
    
          <form onSubmit={handleRegister}>
    
            <input
              type="text"
              placeholder="User Name"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
            />
    
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
    
            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
              <span onClick={()=>setShowPass(!showPass)}>
                {showPass ? <FaEyeSlash/> : <FaEye/>}
              </span>
            </div>
    
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
            />
    
            {error && <p style={{color:"red"}}>{error}</p>}
    
            <button className="log-btn" type="submit">
              {loading ? "Loading..." : "Register"}
            </button>
    
          </form>
    
          <div className="or-line">OR</div>
    
          <button className="google-btn" onClick={handleGoogleSignIn}>
            <FcGoogle />
            Sign up with Google
          </button>
    
          <p style={{marginTop:"12px", fontSize:"13px"}}>
            Already have account? <Link to="/login">Login</Link>
          </p>
    
        </div>
      </div>
    );
    
};

export default Register;
