import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import AccountPage from "../pages/AccountPage";
import Home from "../pages/Home";
import AuthCallbackPage from "../pages/auth/AuthCallbackPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import { ProtectedRoute } from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<Home />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<SignInPage />} />
        <Route path="register" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="callback" element={<AuthCallbackPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
