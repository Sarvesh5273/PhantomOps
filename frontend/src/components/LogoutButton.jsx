import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/halloween.css";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem("jwt");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Something went wrong while logging out.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="halloween-button-danger"
      style={{
        padding: "10px 20px",
        fontWeight: "bold",
      }}
    >
      👻 Vanish
    </button>
  );
};

export default LogoutButton;
