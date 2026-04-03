import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";

import studentImg from "../../assets/student.jpg";
import "../styles/Landing.css";

import LandingNavbar from "./LandingNavbar";
import Footer from "../../Product/footer";
import { db } from "../../services/firebase";

export default function Landing() {
  const [schoolName, setSchoolName] = useState("SchoolTrain");
  const [schoolLogo, setSchoolLogo] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const selectedSchool = localStorage.getItem("selectedSchool");
    if (!selectedSchool) return;

    setSchoolName(selectedSchool);

    const fetchSchoolData = async () => {
      const snap = await getDocs(collection(db, "users"));

      snap.forEach((doc) => {
        const data = doc.data();
        if (data.schoolName === selectedSchool) {
          setSchoolLogo(data.schoolLogo || "");
        }
      });
    };

    fetchSchoolData();
  }, []);

  return (
    <div className="intro-page">
      <LandingNavbar showApply={true} setShowAbout={true} hideAbout={true} />

      {/* 🔥 HERO SECTION */}
      <div className="hero-wrapper">

        {/* LEFT SIDE */}
        <div className="hero-left">
          <h1>
            Welcome to <br />
            <span>{schoolName}</span>
          </h1>

          <p>
            Your smart school management assistant.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate("/UniversalLogin")}
          >
            Get Started <FaArrowRight />
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="hero-right">
          <div className="image-circle">
            <img
              src={schoolLogo || studentImg}
              alt="School"
            />
          </div>
        </div>

      </div>

    </div>
  );
}