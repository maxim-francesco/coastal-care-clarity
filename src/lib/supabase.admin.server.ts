import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.server";

if (typeof window !== "undefined") {
  throw new Error("supabase.admin.server.ts should only be imported on the server.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase admin environment variables. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
}

// Bypasses RLS - MUST remain server-side only!
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
