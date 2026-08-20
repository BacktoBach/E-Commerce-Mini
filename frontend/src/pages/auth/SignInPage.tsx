import { useState, type SyntheticEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { authService } from "../../services/authService";

interface LocationState {
  from?: { pathname?: string };
  passwordUpdated?: boolean;
}

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationState = location.state as LocationState | null;
  const destination = locationState?.from?.pathname ?? "/";

  const handlePasswordSignIn = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.signInWithPassword({ email: email.trim(), password });
      void navigate(destination, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể đăng nhập lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.signInWithGoogle();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể đăng nhập bằng Google.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="CHÀO MỪNG TRỞ LẠI"
      title="Đăng nhập"
      description="Đăng nhập để lưu địa chỉ, theo dõi đơn hàng và đặt món nhanh hơn."
      footer={
        <p>
          Chưa có tài khoản? <Link to="/auth/register">Đăng ký</Link>
        </p>
      }
    >
      <button
        className="button button--google"
        type="button"
        disabled={isSubmitting}
        onClick={() => void handleGoogleSignIn()}
      >
        <span aria-hidden="true">G</span>
        Tiếp tục với Google
      </button>

      <div className="auth-divider">
        <span>hoặc dùng email</span>
      </div>

      <form className="auth-form" onSubmit={(event) => void handlePasswordSignIn(event)}>
        {locationState?.passwordUpdated ? (
          <p className="form-message form-message--success">
            Mật khẩu đã được cập nhật. Hãy đăng nhập lại.
          </p>
        ) : null}
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
        <label>
          <span className="label-row">
            Mật khẩu
            <Link to="/auth/forgot-password">Quên mật khẩu?</Link>
          </span>
          <input
            autoComplete="current-password"
            minLength={8}
            name="password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="form-message form-message--error">{error}</p> : null}

        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthCard>
  );
}
