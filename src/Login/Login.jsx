import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import logo from "../logo.jpeg";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // NORMAL LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    const email = prompt("Enter your registered email:");
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ GOOGLE LOGIN (REGISTER CHECK ADDED)
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔍 CHECK USER IN FIRESTORE
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // ❌ NOT REGISTERED
        await signOut(auth);
        alert("This Google account is not registered. Please sign up first.");
        return;
      }

      // ✅ REGISTERED USER
      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <img src={logo} alt="Logo" className="logo" />

      <div className="wrapper">
        <div className="log">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <p className="forgot-text" onClick={handleForgotPassword}>
              Forgot Password?
            </p>

            <button className="log-btn" type="submit">Login</button>
          </form>

          <p>--- or ---</p>

          <button className="google-btn" onClick={handleGoogleSignIn}>
            <FcGoogle /> Sign in with Google
          </button>

          <p>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
