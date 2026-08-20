import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { authFlowStorage } from "../../services/authFlowStorage";
import { authService } from "../../services/authService";
import { authErrorMessage } from "../../utils/authError";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await authService.signUp({
        email: normalizedEmail,
        password,
        fullName: fullName.trim()
      });
      if (data.session) {
        void navigate("/account", { replace: true });
      } else {
        authFlowStorage.start("signup", normalizedEmail);
        void navigate("/auth/verify-email", {
          replace: true,
          state: { email: normalizedEmail }
        });
      }
    } catch (caught) {
      setError(authErrorMessage(caught, "Không thể tạo tài khoản lúc này."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="THÀNH VIÊN NIGHTFOOD"
      title="Tạo tài khoản"
      description="Một tài khoản dùng cho đặt món, lưu địa chỉ và theo dõi giao hàng."
      footer={
        <p>
          Đã có tài khoản? <Link to="/auth/login">Đăng nhập</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Họ và tên
          <input
            autoComplete="name"
            maxLength={120}
            name="fullName"
            required
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>
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
          Mật khẩu
          <input
            autoComplete="new-password"
            minLength={8}
            name="password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <small>Tối thiểu 8 ký tự.</small>
        </label>
        <label>
          Xác nhận mật khẩu
          <input
            autoComplete="new-password"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
    </AuthCard>
  );
}
