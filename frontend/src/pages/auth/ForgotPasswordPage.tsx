import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { authService } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.requestPasswordReset(email.trim());
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể gửi email khôi phục.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="KHÔI PHỤC TÀI KHOẢN"
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký. NightFood sẽ gửi liên kết đặt lại mật khẩu nếu tài khoản tồn tại."
      footer={<Link to="/auth/login">Quay lại đăng nhập</Link>}
    >
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Email
          <input
            autoComplete="email"
            inputMode="email"
            name="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {sent ? (
          <p className="form-message form-message--success">
            Yêu cầu đã được ghi nhận. Hãy kiểm tra cả Inbox và Spam.
          </p>
        ) : null}

        <button className="button button--primary" disabled={isSubmitting || sent} type="submit">
          {isSubmitting ? "Đang gửi..." : sent ? "Đã gửi email" : "Gửi liên kết khôi phục"}
        </button>
      </form>
    </AuthCard>
  );
}
