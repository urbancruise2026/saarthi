import { LeaveFilters } from "./../components/Leave/Leaveutils";
import { useAppSelector } from "@/hooks/useRedux";

export enum Role {
  EMPLOYEE = "EMPLOYEE",
  TEAM_LEADER = "TEAM_LEADER",
  MANAGER = "MANAGER",
  REGIONAL_HEAD = "REGIONAL_HEAD",

  SUPER_ADMIN = "SUPER_ADMIN",
}

const HR_SUB_DEPARTMENT_NAME = "HR Department";

const FEATURE_ACCESS: Record<string, Role[]> = {
  ATTENDANCE_FILTERS: [Role.SUPER_ADMIN, Role.MANAGER],
  LEAVE_FILTERS: [Role.SUPER_ADMIN, Role.MANAGER],
  COMP_OFF_FILTERS: [Role.SUPER_ADMIN, Role.MANAGER],
  POLICY_FILTERS: [Role.SUPER_ADMIN, Role.MANAGER],
};

export type FeatureKey = keyof typeof FEATURE_ACCESS;

export function hasAccess(
  role: string | null | undefined,
  feature: FeatureKey,
  subDepartmentName?: string | null,
): boolean {
  if (!role) return false;

  const normalizedRole = role.toUpperCase();
  const allowedRoles = FEATURE_ACCESS[feature] ?? [];

  if (allowedRoles.includes(normalizedRole as Role)) return true;

  if (
    normalizedRole === Role.MANAGER &&
    allowedRoles.includes(Role.MANAGER) &&
    subDepartmentName === HR_SUB_DEPARTMENT_NAME
  ) {
    return true;
  }

  return false;
}

export function useAccessControl() {
  const role = useAppSelector(
    (s: any) => s.user?.currentEmployee?.access_role ?? null,
  );
  const subDepartmentName = useAppSelector(
    (s: any) => s.user?.currentEmployee?.subDepartment_name ?? null,
  );

  const normalizedRole = role ? String(role).toUpperCase() : null;

  const isHRManager =
    normalizedRole === Role.MANAGER ||
    (normalizedRole === Role.MANAGER &&
      subDepartmentName === HR_SUB_DEPARTMENT_NAME);

  return {
    role: normalizedRole as Role | null,
    subDepartmentName,
    isSuperAdmin: normalizedRole === Role.SUPER_ADMIN,
    isHRManager,
    isManager: normalizedRole === Role.MANAGER,
    isTeamLeader: normalizedRole === Role.TEAM_LEADER,
    isRegionalHead: normalizedRole === Role.REGIONAL_HEAD,
    isEmployee: normalizedRole === Role.EMPLOYEE,
    can: (feature: FeatureKey) =>
      hasAccess(normalizedRole, feature, subDepartmentName),
  };
}
