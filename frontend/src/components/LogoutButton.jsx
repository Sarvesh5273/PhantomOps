// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // end Supabase session
      sessionStorage.removeItem("jwt");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");

      navigate("/login"); // redirect to login
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Something went wrong while logging out.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "#dc3545",
        color: "#fff",
        padding: "8px 14px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
