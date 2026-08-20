import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockResult {
  data: unknown;
  error: null;
}

const authMocks = vi.hoisted(() => ({
  verifyOtp: vi.fn<(params: unknown) => Promise<MockResult>>(),
  resend: vi.fn<(params: unknown) => Promise<MockResult>>(),
  resetPasswordForEmail: vi.fn<(email: string) => Promise<MockResult>>()
}));

vi.mock("./supabaseClient", () => ({
  supabase: { auth: authMocks }
}));

import { authService } from "./authService";

describe("authService OTP flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.verifyOtp.mockResolvedValue({ data: {}, error: null });
    authMocks.resend.mockResolvedValue({ data: {}, error: null });
    authMocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  });

  it("verifies the signup email OTP with the email type", async () => {
    await authService.verifyEmailOtp("customer@example.com", "123456");

    expect(authMocks.verifyOtp).toHaveBeenCalledWith({
      email: "customer@example.com",
      token: "123456",
      type: "email"
    });
  });

  it("verifies a recovery OTP with the recovery type", async () => {
    await authService.verifyRecoveryOtp("customer@example.com", "654321");

    expect(authMocks.verifyOtp).toHaveBeenCalledWith({
      email: "customer@example.com",
      token: "654321",
      type: "recovery"
    });
  });

  it("resends signup and recovery codes through their matching Supabase methods", async () => {
    await authService.resendSignupOtp("customer@example.com");
    await authService.requestPasswordReset("customer@example.com");

    expect(authMocks.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "customer@example.com"
    });
    expect(authMocks.resetPasswordForEmail).toHaveBeenCalledWith("customer@example.com");
  });
});
