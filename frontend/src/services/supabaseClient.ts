import { createClient } from "@supabase/supabase-js";

function requiredEnvironment(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

const supabaseUrl = requiredEnvironment("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);
const publishableKey = requiredEnvironment(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    persistSession: true
  }
});
