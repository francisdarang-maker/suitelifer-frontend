import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await api.post("/api/logout");

        if (response.data.isLoggedOut) {
          localStorage.removeItem("token");
          localStorage.removeItem("hris-token");
          navigate("/login", { replace: true });
        } else {
          console.log("Failed to log out");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    logout();
  }, [navigate]);

  return null;
};

export default Logout;
