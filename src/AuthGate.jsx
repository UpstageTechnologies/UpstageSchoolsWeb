// src/AuthGate.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { useNavigate } from "react-router-dom";

export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // 🔥 MASTER AUTO LOGIN
      if (
        user &&
        user.uid === "0Nngpl6jEwOhGmueP0d9PYy398a2"
      ) {
        localStorage.setItem("adminUid", user.uid);
        localStorage.setItem("role", "master");
        localStorage.setItem("plan", "lifetime");
      }

      setReady(true);
    });
  }, []);

  if (!ready) return <div>Checking auth...</div>;

  return children;
}
