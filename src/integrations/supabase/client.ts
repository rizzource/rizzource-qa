import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Supabase URL and anon key - using project config (no env vars in Lovable)
const SUPABASE_URL = "https://ixwnucfebopjqcokohhw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4d251Y2ZlYm9wanFjb2tvaGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODMxMjQsImV4cCI6MjA3MTM1OTEyNH0.6XjMw9dOjDgc_pwYNa-J6bBdfKtyDT2I4UcQQlUvplE";

// ✅ Only one client instance
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
