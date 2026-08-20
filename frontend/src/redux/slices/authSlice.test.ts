import { describe, expect, it } from "vitest";
import authReducer, { authAuthenticated, authUnauthenticated, type AuthState } from "./authSlice";

const initialState: AuthState = {
  status: "initializing",
  user: null,
  profile: null,
  error: null
};

describe("authSlice", () => {
  it("stores the authenticated user and NightFood profile", () => {
    const state = authReducer(
      initialState,
      authAuthenticated({
        user: {
          id: "user-id",
          email: "customer@example.com",
          displayName: "Night Customer",
          avatarUrl: null
        },
        profile: {
          id: "user-id",
          email: "customer@example.com",
          username: null,
          fullName: "Night Customer",
          avatarUrl: null,
          phone: null,
          role: "CUSTOMER",
          createdAt: "2026-08-20T00:00:00.000Z",
          updatedAt: "2026-08-20T00:00:00.000Z"
        }
      })
    );

    expect(state.status).toBe("authenticated");
    expect(state.profile?.role).toBe("CUSTOMER");
  });

  it("clears user data after sign out", () => {
    const state = authReducer({ ...initialState, status: "authenticated" }, authUnauthenticated());

    expect(state).toMatchObject({
      status: "unauthenticated",
      user: null,
      profile: null,
      error: null
    });
  });
});
