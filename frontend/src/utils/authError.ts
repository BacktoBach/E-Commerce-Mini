export function authErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu không chính xác.";
  }
  if (
    message.includes("token has expired") ||
    message.includes("token is invalid") ||
    message.includes("otp_expired") ||
    message.includes("invalid token")
  ) {
    return "Mã xác thực không đúng hoặc đã hết hạn.";
  }
  if (message.includes("rate limit") || message.includes("security purposes")) {
    return "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.";
  }
  if (message.includes("password should be different")) {
    return "Mật khẩu mới phải khác mật khẩu hiện tại.";
  }
  if (message.includes("password") && message.includes("characters")) {
    return "Mật khẩu chưa đáp ứng yêu cầu bảo mật.";
  }

  return fallback;
}
