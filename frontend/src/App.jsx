import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./utils/supabaseClient";

// Components
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import FeedbackForm from "./components/FeedbackForm";
import EmailCallback from "./components/EmailCallback"; // ✅ New component for email verification

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ textAlign: "center" }}>Loading...</div>;

  // ✅ ProtectedRoute for role-based access
  const ProtectedRoute = ({ element, allowedRole }) => {
    const token = sessionStorage.getItem("jwt");
    const role = sessionStorage.getItem("role");

    if (!token) return <Navigate to="/" replace />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;

    return element;
  };

  return (
    <Router>
      <Routes>
        {/* 🧠 Email Verification Callback Route */}
        <Route path="/auth/callback" element={<EmailCallback />} />

        {/* 🧠 Login Route */}
        <Route
          path="/"
          element={
            session ? (
              sessionStorage.getItem("role") === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/user" replace />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* 🆕 Signup Route */}
        <Route path="/signup" element={<Signup />} />

        {/* 🔐 Role-Based Dashboards */}
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />}
        />
        <Route
          path="/user"
          element={<ProtectedRoute element={<UserDashboard />} allowedRole="user" />}
        />

        {/* 💬 Shared (Authenticated) Routes */}
        <Route
          path="/feedback"
          element={<ProtectedRoute element={<FeedbackForm />} />}
        />

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
