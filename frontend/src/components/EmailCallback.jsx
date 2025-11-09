import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EmailCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // ✅ Let Supabase parse and store session token from the URL hash
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // ⏳ Give Supabase a moment to update the user's verification state in DB
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // ✅ Now fetch the user to confirm verification
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const user = userData?.user;
        if (!user) throw new Error("No user data returned.");

        // 🔎 Check if Supabase backend marked email as confirmed
        if (!user.email_confirmed_at) {
          console.warn("⚠️ User still waiting for email confirmation on Supabase.");
          Swal.fire({
            icon: "warning",
            title: "Verification Pending",
            text: "Your verification link was detected, but Supabase hasn’t finished confirming it yet. Try again in a few seconds.",
            background: "#111827",
            color: "#fff",
            confirmButtonColor: "#f59e0b",
          });
          navigate("/", { replace: true });
          return;
        }

        // ✅ Everything is good – show success message
        await Swal.fire({
          icon: "success",
          title: "✅ Email Verified!",
          text: "Your account is now active. You can log in.",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#22c55e",
        });

        navigate("/", { replace: true });

      } catch (err) {
        console.error("❌ Verification failed:", err);
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: "This verification link is invalid, expired, or already used.",
          background: "#111827",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        color: "#fff",
        marginTop: "80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🔐 Verifying your email...</h2>
      <p style={{ color: "#9ca3af" }}>Please wait a moment while we confirm your account.</p>
    </div>
  );
};

export default EmailCallback;
