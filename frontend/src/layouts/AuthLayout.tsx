import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <div className="auth-layout__glow" aria-hidden="true" />
      <Outlet />
    </main>
  );
}
