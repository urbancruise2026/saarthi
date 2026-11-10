// components/RouteGuard.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import { SUB_DEPT_ACCESS } from "@/layouts/Sidebar";


type SubDepartment = keyof typeof SUB_DEPT_ACCESS;
type AccessRole = "EMPLOYEE" | "TEAM_LEAD" | "MANAGER" | "ZONAL_HEAD" | "HOD" | "SUPER_ADMIN";

export function RouteGuard({ allowedPath }: { allowedPath: string }) {
  const { currentEmployee } = useAppSelector((s) => s.user);

  const role = (currentEmployee?.access_role as AccessRole) ?? "EMPLOYEE";
  const rawSubDept = currentEmployee?.subDepartment_name ?? "";
  const subDept: SubDepartment =
    rawSubDept in SUB_DEPT_ACCESS ? (rawSubDept as SubDepartment) : "General";

  if (role === "SUPER_ADMIN") return <Outlet />;

  const allowedRoutes = SUB_DEPT_ACCESS[subDept]?.[role] ?? [];
  return allowedRoutes.includes(allowedPath)
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
}