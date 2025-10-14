import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Supabase URL and anon key - using project config (no env vars in Lovable)
const SUPABASE_URL = "https://qicuswuaduuiyrrpoqel.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3Vzd3VhZHV1aXlycnBvcWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDIzNjMsImV4cCI6MjA3NTQ3ODM2M30.AL6NYb5LqAnWCr1CYlw4_JuXekyXd7blor5UFzWwzzI";

// ✅ Only one client instance
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
