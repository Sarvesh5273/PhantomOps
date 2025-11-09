// src/components/UserDashboard.jsx
import React from "react";
import LogoutButton from "./LogoutButton";

const UserDashboard = () => {
  return (
    <div style={{ background: "#0f172a", color: "#fff", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: "600" }}>🚨 PhantomOps User Dashboard</h1>
        <LogoutButton />
      </div>

      <p style={{ marginTop: "2rem", color: "#94a3b8" }}>
        Welcome! Soon you'll be able to report emergencies and view safe routes here.
      </p>
    </div>
  );
};

export default UserDashboard;
