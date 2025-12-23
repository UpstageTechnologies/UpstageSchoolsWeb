import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BackConfirm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackButton = () => {
      const confirmExit = window.confirm("Do you want to quit?");

      if (confirmExit) {
        navigate("/", { replace: true }); // Home page
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    // push dummy state
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  return null; // UI illa
};

export default BackConfirm;
