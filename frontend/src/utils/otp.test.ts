import { describe, expect, it } from "vitest";
import { replaceOtpDigit, sanitizeOtp } from "./otp";

describe("OTP helpers", () => {
  it("keeps only the first six digits", () => {
    expect(sanitizeOtp(" 12a34-5678 ")).toBe("123456");
  });

  it("replaces an existing digit without changing the other positions", () => {
    expect(replaceOtpDigit("123456", 2, "9")).toBe("129456");
  });

  it("removes a digit and shifts the remaining digits left", () => {
    expect(replaceOtpDigit("123456", 2, "")).toBe("12456");
  });
});
