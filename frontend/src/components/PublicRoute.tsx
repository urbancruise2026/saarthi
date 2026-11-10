// components/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import { FullScreenLoader } from "./Loading";

export function PublicRoute() {
  const { isAuthenticated, initialized } = useAppSelector((s) => s.user);

  if (!initialized) {
    return (
      <FullScreenLoader
        variant="colorful"
        message="Preparing your workspace..."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
