import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export interface SignUpInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

function applicationUrl(path: string): string {
  return new URL(path, globalThis.location.origin).toString();
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async signUp({ email, password, fullName }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...(fullName?.trim() ? { data: { full_name: fullName.trim() } } : {})
      }
    });
    if (error) throw error;
    return data;
  },

  async signInWithPassword({ email, password }: SignInInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: applicationUrl("/auth/callback") }
    });
    if (error) throw error;
  },

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async verifyEmailOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
    return data;
  },

  async resendSignupOtp(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
  },

  async verifyRecoveryOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
    if (error) throw error;
    return data;
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
