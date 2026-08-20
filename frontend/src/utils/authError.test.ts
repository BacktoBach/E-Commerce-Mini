import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./authError";

describe("authErrorMessage", () => {
  it("maps invalid credentials to a safe Vietnamese message", () => {
    expect(authErrorMessage(new Error("Invalid login credentials"), "fallback")).toBe(
      "Email hoặc mật khẩu không chính xác."
    );
  });

  it("maps an expired OTP without exposing provider details", () => {
    expect(authErrorMessage(new Error("otp_expired"), "fallback")).toBe(
      "Mã xác thực không đúng hoặc đã hết hạn."
    );
  });

  it("uses the provided fallback for unknown errors", () => {
    expect(authErrorMessage(new Error("network unavailable"), "Không thể xác thực.")).toBe(
      "Không thể xác thực."
    );
  });
});
