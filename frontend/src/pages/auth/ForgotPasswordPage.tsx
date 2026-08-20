import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { authFlowStorage } from "../../services/authFlowStorage";
import { authService } from "../../services/authService";
import { authErrorMessage } from "../../utils/authError";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await authService.requestPasswordReset(normalizedEmail);
      authFlowStorage.start("recovery", normalizedEmail);
      void navigate("/auth/verify-recovery", {
        replace: true,
        state: { email: normalizedEmail }
      });
    } catch (caught) {
      setError(authErrorMessage(caught, "Không thể gửi mã khôi phục."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="KHÔI PHỤC TÀI KHOẢN"
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký. NightFood sẽ gửi mã 6 số nếu tài khoản tồn tại."
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
        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang gửi..." : "Gửi mã khôi phục"}
        </button>
      </form>
    </AuthCard>
  );
}
