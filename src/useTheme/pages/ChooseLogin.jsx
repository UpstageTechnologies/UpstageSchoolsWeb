import { useNavigate } from "react-router-dom";

const ChooseLogin = () => {
  const navigate = useNavigate();

  const goWithPrefill = (role, user, pass) => {
    localStorage.clear();
  
    localStorage.setItem("selectedRole", role);
  
    localStorage.setItem(
      "adminUid",
      "0Nngpl6jEwOhGmueP0d9PYy398a2"
    );
  
    // 🔥 DEMO PREFILL
    localStorage.setItem("prefillUser", user);
    localStorage.setItem("prefillPass", pass);
  
    // 🔥 IMPORTANT FLAG
    localStorage.setItem("fromChooseLogin", "true");
  
    navigate("/login");
  };
  
  return (
    <div className="ul-page">
      <div className="ul-top-bg"></div>

      <div className="ul-card">
        <div className="ul-logo">Demo School</div>
        <div className="ul-welcome">Choose your role to continue</div>

        <h2>Select Login</h2>
        <p className="ul-sub">Demo access (Try Now)</p>

        {/* MASTER */}
        <button
          style={{ margin: 34 }}
          className="auth-btn unlog-btn"
          onClick={() =>
            goWithPrefill("master", "username@gmail.com", "123456")
          }
        >
          School Owner
        </button>

        <div className="or-line">OR</div>

        {/* ADMIN */}
        <button
          style={{ margin: 34 }}
          className="auth-btn google-btn"
          onClick={() =>
            goWithPrefill("admin", "Demoadmin", "DemoA")
          }
        >
          Admin
        </button>

        {/* TEACHER */}
        <button
          style={{ margin: 34 }}
          className="auth-btn google-btn"
          onClick={() =>
            goWithPrefill("teacher", "Demoteacher", "DemoT")
          }
        >
          Teacher
        </button>

        {/* PARENT */}
        <button
          style={{ margin: 34 }}
          className="auth-btn google-btn"
          onClick={() =>
            goWithPrefill("parent", "Demoparent", "DemoP")
          }
        >
          Parent
        </button>

        {/* STAFF */}
        <button
          style={{ margin: 34 }}
          className="auth-btn google-btn"
          onClick={() =>
            goWithPrefill("office_staff", "Demostaff", "DemoS")
          }
        >
          Staff
        </button>
      </div>
    </div>
  );
};

export default ChooseLogin;