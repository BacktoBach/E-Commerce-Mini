import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthProfile, AuthStatus, AuthUser } from "../../types/auth";

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  profile: AuthProfile | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "initializing",
  user: null,
  profile: null,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLoading(state, action: PayloadAction<AuthUser>) {
      state.status = "initializing";
      state.user = action.payload;
      state.profile = null;
      state.error = null;
    },
    authAuthenticated(state, action: PayloadAction<{ user: AuthUser; profile: AuthProfile }>) {
      state.status = "authenticated";
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.error = null;
    },
    authUnauthenticated(state) {
      state.status = "unauthenticated";
      state.user = null;
      state.profile = null;
      state.error = null;
    },
    authFailed(state, action: PayloadAction<string>) {
      state.status = "unauthenticated";
      state.user = null;
      state.profile = null;
      state.error = action.payload;
    }
  }
});

export const { authAuthenticated, authFailed, authLoading, authUnauthenticated } =
  authSlice.actions;
export default authSlice.reducer;
