import { Outlet } from "react-router-dom";

export function StorefrontLayout() {
  return (
    <div className="app-root">
      <main className="app-shell">
        <Outlet />
      </main>
    </div>
  );
}
