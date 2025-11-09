import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { apiClient } from "../utils/apiClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Login via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // 2️⃣ Wait for session hydration
      let sessionOk = false;
      for (let i = 0; i < 8; i++) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          sessionOk = true;
          break;
        }
        await wait(150);
      }

      const raw = sessionStorage.getItem("sb-vgvngeemmxlvnipiglox-auth-token");
      if (!sessionOk && !raw) throw new Error("Session not initialized yet. Please try again.");

      // 3️⃣ Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // 4️⃣ Check if user is verified
      if (!user.email_confirmed_at) {
        await Swal.fire({
          icon: "warning",
          title: "Email Not Verified",
          text: "Please verify your email before logging in.",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 5️⃣ Fetch user role + name
      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("role, name")
        .eq("id", user.id)
        .maybeSingle(); // safe query (avoids crash if missing row)

      if (userError) throw userError;

      let { role, name } = userRecord || {};

      // 6️⃣ If verified user has no name but signup stored one temporarily → update now
      const tempName = sessionStorage.getItem("temp_name");
      if (tempName && !name) {
        const { error: nameError } = await supabase
          .from("users")
          .update({ name: tempName })
          .eq("id", user.id);
        if (!nameError) name = tempName;
        sessionStorage.removeItem("temp_name");
      }

      // 7️⃣ Verify with Flask backend (optional)
      await apiClient.get("/api/test-auth");

      // 8️⃣ Store session
      sessionStorage.setItem("jwt", data.session.access_token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("user", JSON.stringify(user));

      // 9️⃣ Success Message
      await Swal.fire({
        icon: "success",
        title: `Welcome ${name || "User"} 👋`,
        text: role === "admin" ? "Admin access granted" : "User access granted",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#22c55e",
        timer: 1500,
        showConfirmButton: false,
      });

      // 🔟 Redirect based on role
      if (role === "admin") navigate("/admin", { replace: true });
      else navigate("/user", { replace: true });

    } catch (err) {
      console.error("❌ Login error:", err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          err.response?.data?.error ||
          err.message ||
          "Please check your credentials or server connection.",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", textAlign: "center" }}>
      <h2>🔐 Login to PhantomOps</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px",
            cursor: "pointer",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
