  import React from "react";
  import { useNavigate } from "react-router-dom";
  import ebi from ".././assets/ebineser.png";
  import ramesh from ".././assets/image1.png";
  import siva from ".././assets/image2.png"
  import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
  import "../useTheme/styles/Landing.css"
  import Footer from "./footer";
  import "./AboutPanel.css"
  
  export default function AboutPanel({ show, onClose }) {
    const navigate = useNavigate();
    const [errors, setErrors] = React.useState({}); 
    const [successMsg, setSuccessMsg] = React.useState("");
    const [showSearch,setShowSearch] =("")
    const [showContact, setShowContact] = React.useState(false);
    const [formData, setFormData] = React.useState({

      name: "",
      phone: "",
      subject: "",
      message: ""
    });
    
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
    const validate = () => {
      let newErrors = {};
    
      if (!formData.name.trim()) {
        newErrors.name = "Enter The Name";
      }
    
      if (!formData.phone.trim()) {
        newErrors.phone = "Mobile number is required";
      } else if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = "Invalid mobile number";
      }
    
      return newErrors;
    };
    const handleSubmit = async () => {
      const validationErrors = validate();
    
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
    
        const modal = document.querySelector(".contact-modal");
        modal.classList.add("shake");
    
        setTimeout(() => {
          modal.classList.remove("shake");
        }, 400);
    
        return;
      }
    
      try {
        await addDoc(collection(db, "visitors"), {
          ...formData,
          createdAt: serverTimestamp()
        });
    
        // 🔥 SUCCESS MESSAGE
        setSuccessMsg("✅ Thank you! Our team will contact you shortly.");
    
        setFormData({
          name: "",
          phone: "",
          subject: "",
          message: ""
        });
    
        setErrors({});
    
        // 🔥 auto close after 2.5 sec
        setTimeout(() => {
          setShowContact(false);
          setSuccessMsg("");
        }, 2500);
    
      } catch (err) {
        console.error(err);
      }
    };
    return (
      <div className={`about-panel ${show ? "active" : ""}`}>
        <div className="about-content">
          
          <h1>About Upstage Technologies</h1>

          <p>
        Upstage Technologies is a modern IT solutions company focused on building 
        scalable, efficient, and user-friendly digital platforms.
      </p>

      <p>
        Our mission is to simplify operations through smart technology and help 
        organizations grow faster in a digital-first world.
      </p>
      <div className="about-buttons">
      <button 
  className="first-btn"
  onClick={() => {
    onClose();          // 🔥 close about
    navigate("/products");
  }}
>
  Start Now
</button>
  <button className="secondary-btn" onClick={() => setShowContact(true)}>
  Contact Us
</button>

</div>
{showContact && (
  <div className="contact-overlay">
    <div className="contact-modal">
    {successMsg && (
  <div className="success-box">
    {successMsg}
  </div>
)}
      <h2>Contact Us</h2>
      <div className="form-group">
  <input
    name="name"
    onChange={handleChange}
    placeholder="Your Name"
  />
  {errors.name && <p className="error">{errors.name}</p>}
</div>

<div className="form-group">
  <input
    name="phone"
    onChange={handleChange}
    placeholder="Mobile Number"
  />
  {errors.phone && <p className="error">{errors.phone}</p>}
</div>

<input
  name="subject"
  onChange={handleChange}
  placeholder="Subject / Question"
/>

<textarea
  name="message"
  onChange={handleChange}
  placeholder="Your Message"
/>

      <div className="contact-actions">
        <button className="cancel-btn" onClick={() => setShowContact(false)}>
          Cancel
        </button>
        <button className="submit-btn" onClick={handleSubmit}>
  Send Message
</button>
      </div>

    </div>
  </div>
)}
       {/* 🔥 EXTRA SECTION */}
       <div className="about-team">

<div className="team-header">
  <span className="team-tag">Our Team</span>
  <h2>Dedicated Team</h2>
  <p>Meet the people behind Upstage Technologies</p>
</div>

<div className="team-grid">

  <div className="team-card">
    <img src={ebi} alt="Ebi" />
    <p>Ebi</p>
  </div>

  <div className="team-card">
    <img src={ramesh} alt="Ramesh" />
    <p>Ramesh</p>
  </div>

  <div className="team-card2">
    <img src={siva} alt="Siva" />
    <p>Siva</p>
  </div>

</div>

</div>
          <div className="custom-footer">
  <div className="footer-container">

      <p className="footer-text">
        Sent your email..
      </p>

      <div className="subscribe-box">
        <input type="email" placeholder="Enter your email" />
        <button>Submit</button>
      </div>
    

    {/* RIGHT LINKS */}
    <div className="footer-links">

      <div>
        <h4>Products</h4>
        <p>Hospital Mangement</p>
        <p>Kadai Mangement</p>
        <p>School Mangement</p>
      </div>

      <div>
        <h4>Learn</h4>
        <p>Blogs</p>
        <p>Research & Education</p>
        <p>Certifications</p>
      </div>

      <div>
        <h4>About</h4>
        <p>Providers</p>
        <p>About Us</p>
      </div>

      <div>
        <h4>Support</h4>
        <p>FAQ’s</p>
        <p>Contact Us</p>
      </div>

      <div>
        <h4>Legal</h4>
        <p>Terms & Conditions</p>
        <p>Privacy Policy</p>
        <p>Risk & Benefits</p>
      </div>

    </div>
  </div>
</div>

      
<Footer />
        </div>
    
      </div>
    );
  }