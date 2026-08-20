import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const status = useAppSelector((state) => state.auth.status);

  if (status === "initializing") {
    return (
      <div className="route-loading" role="status">
        <span className="spinner" aria-hidden="true" />
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return children;
}
