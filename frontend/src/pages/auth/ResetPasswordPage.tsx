import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { authFlowStorage } from "../../services/authFlowStorage";
import { authService } from "../../services/authService";
import { authErrorMessage } from "../../utils/authError";

type RecoveryStatus = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    if (!authFlowStorage.hasValidRecovery()) {
      setRecoveryStatus("invalid");
      return;
    }

    void authService
      .getSession()
      .then((session) => {
        if (active) setRecoveryStatus(session ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) setRecoveryStatus("invalid");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updatePassword(password);
      authFlowStorage.clearRecovery();
      await authService.signOut();
      void navigate("/auth/login", { replace: true, state: { passwordUpdated: true } });
    } catch (caught) {
      setError(authErrorMessage(caught, "Không thể cập nhật mật khẩu."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="BẢO MẬT TÀI KHOẢN"
      title="Đặt mật khẩu mới"
      description="Mã khôi phục phải được xác thực trước khi bạn thay đổi mật khẩu."
      footer={<Link to="/auth/login">Quay lại đăng nhập</Link>}
    >
      {recoveryStatus === "checking" ? (
        <div className="auth-progress" role="status">
          <span className="spinner" aria-hidden="true" />
          Đang kiểm tra phiên khôi phục...
        </div>
      ) : recoveryStatus === "invalid" ? (
        <p className="form-message form-message--error">
          Phiên khôi phục không hợp lệ hoặc đã hết hạn. Hãy yêu cầu một mã mới.
        </p>
      ) : (
        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Mật khẩu mới
            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            Xác nhận mật khẩu mới
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
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
