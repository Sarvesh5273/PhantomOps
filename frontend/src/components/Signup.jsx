import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Create Auth user with redirect after email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
        emailRedirectTo: "http://localhost:5173/auth/callback",
        },
      });
      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("Signup failed. Please try again.");

      // 2️⃣ Temporarily store name locally (DB insert happens after verification)
      sessionStorage.setItem("temp_name", name);

      // 3️⃣ Success — show “check your email” notice
      await Swal.fire({
        icon: "info",
        title: "Almost done!",
        text: "We’ve sent a confirmation link to your email. Please verify it to activate your account.",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#22c55e",
      });

      // 4️⃣ Redirect back to login
      navigate("/", { replace: true });
    } catch (err) {
      console.error("❌ Signup error:", err);
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: err.message || "Please check your details and try again.",
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
      <h2>🆕 Sign Up for PhantomOps</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
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
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", color: "#9ca3af" }}>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/")}
          style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;
