import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

// Pages for signed-in developers. Anyone else is sent to sign in and comes back afterwards.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { email } = useAuth();
  const location = useLocation();
  if (!email) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
