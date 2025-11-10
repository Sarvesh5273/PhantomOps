import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/halloween.css";

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
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Floating Decorations */}
      <div className="floating-ghost" style={{ top: "15%", left: "8%" }}>🕷️</div>
      <div className="floating-ghost" style={{ top: "25%", right: "12%", animationDelay: "3s" }}>🦇</div>
      <div className="pumpkin-decoration" style={{ bottom: "12%", left: "8%" }}>🎃</div>
      <div className="pumpkin-decoration" style={{ bottom: "18%", right: "15%", animationDelay: "2s" }}>💀</div>
      
      <div className="halloween-card" style={{ 
        maxWidth: "450px", 
        width: "90%",
        padding: "3rem 2rem",
        textAlign: "center",
        position: "relative"
      }}>
        <div className="cobweb-corner" />
        
        <h1 className="halloween-section-header spooky-text" style={{ 
          justifyContent: "center",
          fontSize: "2.5rem",
          marginBottom: "0.5rem"
        }}>
          👻 Join the Haunting 🎃
        </h1>
        
        <p style={{ 
          color: "var(--halloween-orange)", 
          marginBottom: "2rem",
          fontSize: "1.1rem",
          textShadow: "0 0 10px rgba(255, 107, 53, 0.5)"
        }}>
          Become a phantom operative... 🕸️
        </p>
        
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="👤 Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="halloween-input"
            style={{ width: "100%" }}
          />
          <input
            type="email"
            placeholder="📧 Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="halloween-input"
            style={{ width: "100%" }}
          />
          <input
            type="password"
            placeholder="🔒 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="halloween-input"
            style={{ width: "100%" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="halloween-button-success pulse-glow"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {loading ? "🕸️ Summoning spirit..." : "👻 Join PhantomOps"}
          </button>
        </form>

        <p style={{ 
          marginTop: "2rem", 
          color: "var(--halloween-ghost-white)",
          opacity: 0.7
        }}>
          Already haunting with us?{" "}
          <span
            onClick={() => navigate("/")}
            style={{ 
              color: "var(--halloween-orange)", 
              cursor: "pointer", 
              textDecoration: "underline",
              textShadow: "0 0 10px rgba(255, 107, 53, 0.5)"
            }}
          >
            Return to login 🎃
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
