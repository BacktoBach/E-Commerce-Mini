import { createClient } from "@supabase/supabase-js";

export function createSupabaseAuthClient(supabaseUrl: string, publishableKey: string) {
  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}
