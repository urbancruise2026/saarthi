import { Navigate, useLocation, Outlet } from "react-router-dom";
import { ReactNode } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { FullScreenLoader } from "./Loading";

type AccessRole =
  | "EMPLOYEE"
  | "TEAM_LEAD"
  | "MANAGER"
  | "ZONAL_HEAD"
  | "HOD"
  | "SUPER_ADMIN";

// ✅ Role ke hisaab se dashboard route
const ROLE_DASHBOARD_MAP: Record<AccessRole, string> = {
  EMPLOYEE: "/employee-dashboard",
  TEAM_LEAD: "/teamlead-dashboard",
  MANAGER: "/manager-dashboard",
  ZONAL_HEAD: "/zonal-dashboard",
  HOD: "/hod-dashboard",
  SUPER_ADMIN: "/",
};

interface PrivateRouteProps {
  children?: ReactNode;
  allowedRoles?: AccessRole[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, initialized, currentEmployee } = useAppSelector(
    (state) => state.user,
  );
  const location = useLocation();

  // Step 1 — initialization check
  if (!initialized) {
    return (
      <FullScreenLoader
        variant="colorful"
        message="Preparing your workspace..."
      />
    );
  }

  // Step 2 — authentication check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const userRole = (currentEmployee?.access_role as AccessRole) ?? "EMPLOYEE";
  const dashboardRoute = ROLE_DASHBOARD_MAP[userRole] ?? "/employee-dashboard";

  // Step 3 — agar "/" pe aaya aur SUPER_ADMIN nahi hai toh apne dashboard pe bhejo
  if (location.pathname === "/" && userRole !== "SUPER_ADMIN") {
    return <Navigate to={dashboardRoute} replace />;
  }

  // Step 4 — role check (only if allowedRoles provided)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(userRole);
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
