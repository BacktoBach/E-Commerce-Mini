import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { useAppSelector } from "../../redux/hooks";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);
  const { status, error: profileError } = useAppSelector((state) => state.auth);
  const callbackError = searchParams.get("error_description") ?? searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      void navigate("/", { replace: true });
      return;
    }

    const timeoutId = globalThis.setTimeout(() => setTimedOut(true), 10_000);
    return () => globalThis.clearTimeout(timeoutId);
  }, [navigate, status]);

  const error =
    callbackError ??
    profileError ??
    (timedOut ? "Không tìm thấy phiên xác thực hợp lệ. Vui lòng thử đăng nhập lại." : null);

  return (
    <AuthCard
      eyebrow="XÁC THỰC NIGHTFOOD"
      title={error ? "Không thể xác thực" : "Đang hoàn tất..."}
      description={
        error
          ? "Liên kết xác thực không hợp lệ, đã hết hạn hoặc hồ sơ chưa thể tải."
          : "NightFood đang kiểm tra phiên đăng nhập và đồng bộ hồ sơ của bạn."
      }
      footer={error ? <Link to="/auth/login">Quay lại đăng nhập</Link> : undefined}
    >
      {error ? (
        <p className="form-message form-message--error">{error}</p>
      ) : (
        <div className="auth-progress" role="status">
          <span className="spinner" aria-hidden="true" />
          Vui lòng chờ trong giây lát
        </div>
      )}
    </AuthCard>
  );
}
