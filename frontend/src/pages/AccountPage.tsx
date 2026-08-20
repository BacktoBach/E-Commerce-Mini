import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { authService } from "../services/authService";

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, profile } = useAppSelector((state) => state.auth);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authService.signOut();
      void navigate("/", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <section className="account-card" aria-labelledby="account-title">
      <p className="eyebrow">TÀI KHOẢN NIGHTFOOD</p>
      <h1 id="account-title">Hồ sơ của bạn</h1>
      <dl className="profile-list">
        <div>
          <dt>Họ và tên</dt>
          <dd>{profile?.fullName ?? user?.displayName ?? "Chưa cập nhật"}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profile?.email ?? user?.email}</dd>
        </div>
        <div>
          <dt>Vai trò</dt>
          <dd>{profile?.role ?? "CUSTOMER"}</dd>
        </div>
        <div>
          <dt>Số điện thoại</dt>
          <dd>{profile?.phone ?? "Chưa cập nhật"}</dd>
        </div>
      </dl>
      <button
        className="button button--secondary"
        disabled={isSigningOut}
        type="button"
        onClick={() => void handleSignOut()}
      >
        {isSigningOut ? "Đang đăng xuất..." : "Đăng xuất"}
      </button>
    </section>
  );
}
