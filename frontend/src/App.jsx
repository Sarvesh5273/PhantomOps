import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// --- FIX: Added .js extension
import { supabase } from "./utils/supabaseClient.js";

// Components
// --- FIX: Added .jsx extension to all component imports
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import FeedbackForm from "./components/FeedbackForm.jsx";
import EmailCallback from "./components/EmailCallback.jsx";

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null); // <-- 1. ADDED ROLE STATE
  const [loading, setLoading] = useState(true);

  // 2. REPLACED useEffect TO FETCH ROLE
  useEffect(() => {
    const getSessionAndRole = async (currentSession) => {
      if (currentSession) {
        // Fetch role from 'users' table
        const { data: userRecord } = await supabase
          .from("users")
          .select("role")
          .eq("id", currentSession.user.id)
          .maybeSingle();

        if (userRecord && userRecord.role) {
          sessionStorage.setItem("role", userRecord.role); // Keep this for apiClient
          setRole(userRecord.role); // <-- Set the new state
        } else {
          // This can happen if the user record isn't created yet
          console.warn("User session found, but role not yet available in database.");
          setRole(null);
        }
      } else {
        // User logged out
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("jwt");
        setRole(null); // <-- Clear the state
      }
    };

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await getSessionAndRole(session); // Get role on initial load
      setLoading(false);
    };

    init();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      getSessionAndRole(newSession); // Get role on any auth change
    });

    return () => listener.subscription.unsubscribe();
  }, []); // Empty dependency array is correct here

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;

  // 3. UPDATED ProtectedRoute TO USE STATE
  const ProtectedRoute = ({ element, allowedRole }) => {
    // We use 'session' and 'role' from state, not sessionStorage
    if (!session) return <Navigate to="/" replace />; 
    if (allowedRole && role !== allowedRole) {
      // User is logged in, but wrong role. Send them to their dashboard.
      return <Navigate to={role === 'admin' ? '/admin' : '/user'} replace />;
    }
    // If allowedRole is not specified (like for FeedbackForm), just check for session
    if (allowedRole && !role) {
       // Still loading role, show loading
       return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading user profile...</div>
    }

    return element;
  };

  return (
    <Router>
      <Routes>
        {/* 🧠 Email Verification Callback Route */}
        <Route path="/auth/callback" element={<EmailCallback />} />

        {/* 4. UPDATED Login Route Logic */}
        <Route
          path="/"
          element={
            session && role ? ( // Wait for BOTH session and role
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/user" replace />
              )
            ) : session && !role ? (
              // Session exists, but role is still loading or missing
              <div style={{ textAlign: "center", marginTop: "50px" }}>Loading user profile...</div>
            ) : (
              // No session, show login
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

        {/* 💬 Shared (Authenticated) Routes - No 'allowedRole' prop */}
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