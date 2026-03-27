import React from "react";
import { Link } from "react-router-dom";
import studentImg from "../../assets/student.jpg";
import "../styles/Landing.css";
import logo from "../../assets/logo.jpeg";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "./LandingNavbar";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import Footer from "../../Product/footer";
export default function Landing() {
  const [schoolName, setSchoolName] = useState("SchoolTrain");
  const [schoolLogo, setSchoolLogo] = useState("");
  useEffect(() => {
    const savedSchool = localStorage.getItem("selectedSchool");
  
    if (savedSchool) {
      setSchoolName(savedSchool);
  
      const fetchLogo = async () => {
        const snap = await getDocs(collection(db, "users"));
  
        snap.forEach(doc => {
          const data = doc.data();
  
          if (data.schoolName === savedSchool) {
            setSchoolLogo(data.schoolLogo); // ✅ get logo
          }
        });
      };
  
      fetchLogo();
    }
  }, []);
  const [adminUid, setAdminUid] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      const selectedSchool = localStorage.getItem("selectedSchool");
  
      const snap = await getDocs(collection(db, "users"));
  
      snap.forEach(doc => {
        const data = doc.data();
  
        if (data.schoolName === selectedSchool) {
          setAdminUid(doc.id); // ✅ முக்கியம்
        }
      });
    };
  
    fetchAdmin();
  }, []);
  const navigate = useNavigate();
  return (
    <div className="intro-page">
    <LandingNavbar showApply={true} setShowAbout={true} />
       
        <div className="hero-left">
          <h1>
          Welcome to <span>{schoolName}</span>
          </h1>
          <p>Your smart school management assistant.</p>
          
          <div className="intro-buttons">
          <button 
  className="btn-primary"
  onClick={() => navigate("/UniversalLogin")}
>
  Get Started <FaArrowRight/>
</button>

          </div>
          <footer>
       <Footer/>
        </footer>
        </div>
        
        <div className="hero-right">
        <div className="image-circle">
        <img
  src={schoolLogo || studentImg}
  alt="School"
/>
        </div>
      </div>
    </div>
  );
}
