import { createClient } from "@supabase/supabase-js";

// ⚙️ Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// 🔒 Secure configuration: sessionStorage for sensitive dashboards
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: window.sessionStorage, // 🧠 tokens only live during active tab session
    persistSession: true,           // keeps session active until tab closed
    detectSessionInUrl: true,       // handles OAuth redirect sessions
  },
});

