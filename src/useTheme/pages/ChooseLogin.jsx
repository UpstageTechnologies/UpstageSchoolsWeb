import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

const MASTER_UID = "0Nngpl6jEwOhGmueP0d9PYy398a2";

const ChooseLogin = () => {
  const navigate = useNavigate();

  const goDashboard = (role) => {
    // 🔥 MASTER UID FIXED
    localStorage.setItem("adminUid", MASTER_UID);
    localStorage.setItem("role", role);

    localStorage.setItem("schoolName", "Demo School");
    localStorage.setItem("plan", "lifetime");

    if (role === "master") {
      localStorage.setItem("adminName", "School Owner");
    }
    if (role === "admin") {
      localStorage.setItem("adminName", "Admin");
    }
    if (role === "teacher") {
      localStorage.setItem("teacherName", "Teacher");
    }
    if (role === "parent") {
      localStorage.setItem("parentName", "Parent");
    }
    if (role === "office_staff") {
      localStorage.setItem("staffName", "Staff");
    }

    navigate("/dashboard");
  };

  return (
    <div className="landing-container">
      <nav className="nnav">
        <img src={logo} alt="Logo" />
      </nav>

      <div className="role-box">
        {/* 🔥 MASTER — NO LOGIN PAGE */}
        <div onClick={() => {
  localStorage.setItem(
    "adminUid",
    "0Nngpl6jEwOhGmueP0d9PYy398a2" // MASTER ID
  );
  localStorage.setItem("role", "master");

  navigate("/dashboard");
}}
>
          School Owner (Demo)
        </div>
        <div onClick={() => {
  localStorage.setItem(
    "adminUid",
    "vd8GKjbWrgfpO3FnokO5qHe2o1s2" // MASTER ID
  );
  localStorage.setItem(
    "adminId",
    "6JjkEs657wx3QrfhYYzB" // ADMIN ID
  );
  localStorage.setItem("role", "admin");

  navigate("/dashboard");
}}
>Admin</div>
<div
  onClick={() => {
    localStorage.setItem("adminUid", "0Nngpl6jEwOhGmueP0d9PYy398a2");
    localStorage.setItem("teacherDocId", "1TZJvwgnh54DNX3PuTU9");
    localStorage.setItem("role", "teacher");
    navigate("/dashboard");
  }}
>
  Teacher
</div>

<div
  onClick={() => {
    localStorage.setItem("adminUid","0Nngpl6jEwOhGmueP0d9PYy398a2");
    localStorage.setItem("parentDocId", "Ni9HDGmyLBTSWgfm1fJy");
    localStorage.setItem("role", "parent");
    navigate("/dashboard");
  }}
>
  Parent
</div>

<div
  onClick={() => {
    localStorage.setItem("adminUid", "0Nngpl6jEwOhGmueP0d9PYy398a2");
    localStorage.setItem("staffDocId", "e57TdCp2mW11gNrNFrbI");
    localStorage.setItem("role", "office_staff");
    navigate("/dashboard");
  }}
>
  Staff
</div>
      </div>
    </div>
  );
};

export default ChooseLogin;
