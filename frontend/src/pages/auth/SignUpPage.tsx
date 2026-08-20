import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { authService } from "../../services/authService";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim()
      });
      setMessage(
        data.session
          ? "Tài khoản đã được tạo và đăng nhập thành công."
          : "Đã gửi email xác thực. Hãy kiểm tra hộp thư trước khi đăng nhập."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tạo tài khoản lúc này.");
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
        {message ? <p className="form-message form-message--success">{message}</p> : null}

        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
    </AuthCard>
  );
}
