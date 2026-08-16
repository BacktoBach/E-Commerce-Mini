import { Navigate, Route, Routes } from "react-router-dom";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import Home from "../pages/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
