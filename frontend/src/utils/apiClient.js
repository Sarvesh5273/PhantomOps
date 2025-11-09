import axios from "axios";
import { supabase } from "./supabaseClient";

// ✅ Configure base Flask backend URL
export const apiClient = axios.create({
  baseURL: "http://localhost:5000", // Keep same host as Flask
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach Supabase JWT token for every request
apiClient.interceptors.request.use(async (config) => {
  try {
    // 🧠 1️⃣ Try reading token directly from sessionStorage (fast + current design)
    const sessionData = sessionStorage.getItem("sb-vgvngeemmxlvnipiglox-auth-token");
    let token = null;

    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      token = parsed?.access_token || null; // ✅ matches your structure
    }

    // 🧠 2️⃣ Fallback (optional): use Supabase client if storage empty (after refresh)
    if (!token) {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || null;
    }

    // 🧠 3️⃣ Attach the token to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🧩 Attached JWT to request:", token.slice(0, 25) + "...");
    } else {
      console.warn("⚠️ No access_token found — user may not be logged in.");
    }
  } catch (err) {
    console.error("❌ Failed to attach Supabase token:", err);
  }

  return config;
});
