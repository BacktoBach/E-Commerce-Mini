import { useState, type SyntheticEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { OtpInput } from "../../components/auth/OtpInput";
import { useCountdown } from "../../hooks/useCountdown";
import { authFlowStorage } from "../../services/authFlowStorage";
import { authService } from "../../services/authService";
import { authErrorMessage } from "../../utils/authError";
import { EMAIL_OTP_LENGTH, sanitizeOtp } from "../../utils/otp";

interface OtpLocationState {
  email?: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pending = authFlowStorage.get("signup");
  const stateEmail = (location.state as OtpLocationState | null)?.email;
  const email = stateEmail?.trim().toLowerCase() ?? pending?.email ?? "";
  const { seconds, restart } = useCountdown(
    (pending?.sentAt ?? Date.now()) + RESEND_COOLDOWN_SECONDS * 1_000
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (sanitizeOtp(otp).length !== EMAIL_OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyEmailOtp(email, otp);
      authFlowStorage.clear("signup");
      void navigate("/account", { replace: true });
    } catch (caught) {
      setError(authErrorMessage(caught, "Không thể xác thực email. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setIsResending(true);
    try {
      await authService.resendSignupOtp(email);
      authFlowStorage.start("signup", email);
      restart(RESEND_COOLDOWN_SECONDS);
      setMessage("Đã gửi mã xác thực mới. Hãy kiểm tra cả Inbox và Spam.");
    } catch (caught) {
      setError(authErrorMessage(caught, "Không thể gửi lại mã xác thực."));
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <AuthCard
        eyebrow="XÁC THỰC EMAIL"
        title="Thiếu thông tin"
        description="Phiên đăng ký không còn email để xác thực. Vui lòng bắt đầu lại."
        footer={<Link to="/auth/login">Quay lại đăng nhập</Link>}
      >
        <Link className="button button--primary" to="/auth/register">
          Đăng ký lại
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="XÁC THỰC EMAIL"
      title="Nhập mã 6 số"
      description={`NightFood vừa gửi mã xác thực tới ${email}. Mã chỉ sử dụng một lần.`}
      footer={
        <p>
          Sai email? <Link to="/auth/register">Đăng ký lại</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={(event) => void handleVerify(event)}>
        <OtpInput value={otp} disabled={isSubmitting} onChange={setOtp} />

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {message ? <p className="form-message form-message--success">{message}</p> : null}

        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang xác thực..." : "Xác thực tài khoản"}
        </button>
        <button
          className="button button--text"
          disabled={seconds > 0 || isResending}
          type="button"
          onClick={() => void handleResend()}
        >
          {isResending
            ? "Đang gửi lại..."
            : seconds > 0
              ? `Gửi lại mã sau ${seconds}s`
              : "Gửi lại mã"}
        </button>
      </form>
    </AuthCard>
  );
}
