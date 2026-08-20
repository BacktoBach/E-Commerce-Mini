import { Link, Outlet } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

export function StorefrontLayout() {
  const { status, profile, user } = useAppSelector((state) => state.auth);

  return (
    <div className="app-root">
      <header className="site-header">
        <Link className="site-brand" to="/">
          NightFood
        </Link>
        <nav aria-label="Điều hướng tài khoản">
          {status === "authenticated" ? (
            <Link className="nav-link" to="/account">
              {profile?.fullName ?? user?.displayName ?? "Tài khoản"}
            </Link>
          ) : (
            <Link className="nav-link" to="/auth/login">
              Đăng nhập
            </Link>
          )}
        </nav>
      </header>
      <main className="app-shell">
        <Outlet />
      </main>
    </div>
  );
}
