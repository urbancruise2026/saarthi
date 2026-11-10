import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
  DollarSign,
  Activity,
  FileText,
  BookOpen,
  GraduationCap,
  Package,
  CalendarDays,
  CalendarCheck,
} from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { cn } from "@/lib/utils";

type AccessRole =
  | "EMPLOYEE"
  | "TEAM_LEAD"
  | "MANAGER"
  | "ZONAL_HEAD"
  | "HOD"
  | "SUPER_ADMIN";

const ALL_ACCESS_ROLES: AccessRole[] = [
  "EMPLOYEE",
  "TEAM_LEAD",
  "MANAGER",
  "ZONAL_HEAD",
  "HOD",
  "SUPER_ADMIN",
];

const isAccessRole = (role: string): role is AccessRole =>
  ALL_ACCESS_ROLES.includes(role as AccessRole);

type Department =
  | "Sales"
  | "Finance"
  | "IT"
  | "HR"
  | "VEH OPS"
  | "Digital Marketing"
  | "General";

type SubDepartment =
  // Sales (department_id 1)
  | "Pre-Sales"
  | "Corp. Sales"
  | "Tele-Sales"
  // Finance (department_id 2)
  | "Statutory"
  | "Finance"
  | "Accounting"
  | "Audit"
  // IT (department_id 3)
  | "Website"
  | "Web App"
  | "Mobile App"
  | "MIS & Analytics"
  | "Recruitment"
  | "Ops & Admin"
  // VEH OPS (department_id 5)
  | "Vendor REL"
  | "CUS Care"
  | "Veh. Design"
  // Digital Marketing (department_id 6)
  | "SEO"
  | "SMO"
  | "Ads"
  | "GA/E"
  // Fallback
  | "General";

// ─── Department → Sub-Department Map (mirrors your `sub_departments` table) ──
export const DEPARTMENT_SUB_MAP: Record<Department, SubDepartment[]> = {
  Sales: ["Pre-Sales", "Corp. Sales", "Tele-Sales"],
  Finance: ["Statutory", "Finance", "Accounting", "Audit"],
  IT: ["Website", "Web App", "Mobile App", "MIS & Analytics"],
  HR: ["Recruitment", "Ops & Admin"],
  "VEH OPS": ["Vendor REL", "CUS Care", "Veh. Design"],
  "Digital Marketing": ["SEO", "SMO", "Ads", "GA/E"],
  General: ["General"],
};

const ALL_ROUTES = [
  "/approvals",
  "/documents",
  "/payroll",
  "/ops",
  "/hr-policies",
  "/access",
  "/assets",
  "/background-verification",
  "/attendance",
  "/leave",
  "/calendar",
];

type RouteAccessMap = Partial<Record<AccessRole, string[]>>;

// ─── Access is resolved by SUB-DEPARTMENT, same as the original file ────────
export const SUB_DEPT_ACCESS: Record<SubDepartment, RouteAccessMap> = {
  // ── Sales ───────────────────────────────────────────────────────────────────
  "Pre-Sales": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "Corp. Sales": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "Tele-Sales": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  // ── Finance ─────────────────────────────────────────────────────────────────
  Statutory: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  Finance: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  Accounting: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  Audit: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  // ── IT ──────────────────────────────────────────────────────────────────────
  Website: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "Web App": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "Mobile App": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "MIS & Analytics": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "Ops & Admin": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  Recruitment: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  // ── VEH OPS ─────────────────────────────────────────────────────────────────
  "Vendor REL": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "CUS Care": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "Veh. Design": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  // ── Digital Marketing ───────────────────────────────────────────────────────
  SEO: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  SMO: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  Ads: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  "GA/E": {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },

  General: {
    EMPLOYEE: ["/attendance", "/leave", "/hr-policies"],
    TEAM_LEAD: ["/attendance", "/leave", "/hr-policies"],
    MANAGER: ["/attendance", "/leave", "/hr-policies"],
    ZONAL_HEAD: ["/attendance", "/leave", "/hr-policies"],
    HOD: ALL_ROUTES,
    SUPER_ADMIN: ALL_ROUTES,
  },
};

const ROLE_DASHBOARD_MAP: Record<AccessRole, string> = {
  EMPLOYEE: "/employee-dashboard",
  TEAM_LEAD: "/teamlead-dashboard",
  MANAGER: "/manager-dashboard",
  ZONAL_HEAD: "/zonal-dashboard",
  HOD: "/hod-dashboard",
  SUPER_ADMIN: "/",
};

interface NavItem {
  label: string;
  icon: any;
  to: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "DYNAMIC",
    color: "text-blue-600",
  },
  {
    label: "Employees",
    icon: Users,
    to: "/approvals",
    color: "text-purple-600",
  },
  {
    label: "Documentation",
    icon: FileText,
    to: "/documents",
    color: "text-yellow-600",
  },
  {
    label: "Payroll",
    icon: DollarSign,
    to: "/payroll",
    color: "text-green-700",
  },
  { label: "HR OPS", icon: Activity, to: "/ops", color: "text-pink-600" },
  {
    label: "HR Policies",
    icon: BookOpen,
    to: "/hr-policies",
    color: "text-indigo-600",
  },
  {
    label: "Training",
    icon: GraduationCap,
    to: "/access",
    color: "text-teal-600",
  },
  {
    label: "Asset Management",
    icon: Package,
    to: "/assets",
    color: "text-red-600",
  },
  {
    label: "Attendance",
    icon: CalendarCheck,
    to: "/attendance",
    color: "text-emerald-600",
  },
  {
    label: "Leave",
    icon: CalendarDays,
    to: "/leave",
    color: "text-orange-600",
  },
  {
    label: "Calendar",
    icon: CalendarDays,
    to: "/calendar",
    color: "text-cyan-600",
  },
];

// ─── Helper: resolve allowed nav items ───────────────────────────────────────
function resolveNavItems(
  role: AccessRole,
  subDept: SubDepartment,
  dashboardRoute: string,
): NavItem[] {
  // SUPER_ADMIN bypasses all restrictions
  const allowedRoutes: Set<string> =
    role === "SUPER_ADMIN"
      ? new Set(ALL_ROUTES)
      : new Set(SUB_DEPT_ACCESS[subDept]?.[role] ?? []);

  return NAV_ITEMS.filter((item) => {
    if (item.to === "DYNAMIC") return true; // Dashboard always visible
    return allowedRoutes.has(item.to);
  }).map((item) =>
    item.to === "DYNAMIC" ? { ...item, to: dashboardRoute } : item,
  );
}

// ─── Sidebar Component ────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [hovered, setHovered] = useState(false);

  const pendingCount = useAppSelector(
    (s) =>
      s.employees.employees.filter(
        (e) => e.status === "pending" || e.status === "resubmitted",
      ).length,
  );

  const { currentEmployee } = useAppSelector((state) => state.user);

  const rawRole = currentEmployee?.access_role ?? "";
  const currentRole: AccessRole = isAccessRole(rawRole) ? rawRole : "EMPLOYEE";

  const rawSubDept = currentEmployee?.subDepartment_name ?? "";
  const currentSubDept: SubDepartment =
    rawSubDept in SUB_DEPT_ACCESS ? (rawSubDept as SubDepartment) : "General";

  // ── Build filtered nav ────────────────────────────────────────────────────
  const dashboardRoute = ROLE_DASHBOARD_MAP[currentRole];

  const filteredNavItems = resolveNavItems(
    currentRole,
    currentSubDept,
    dashboardRoute,
  );

  const isCollapsed = collapsed && !hovered;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "absolute top-0 left-0 z-40 flex flex-col h-full transition-all duration-300 ease-in-out",
        "border-r border-green-200 bg-green-50 text-green-900",
        "shadow-lg shadow-green-900/5",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-green-200",
          isCollapsed && "justify-center",
        )}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-r from-green-600 to-orange-500 shadow-md">
          <Building2 size={40} className="text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <p className="text-sm font-bold text-green-700">SAARTHI HRMS</p>
            <p className="text-xs text-orange-500 uppercase font-semibold">
              URBAN CRUISE
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-3 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                "hover:bg-green-600 hover:text-white",
                isActive && "bg-green-600 text-white font-semibold",
                isCollapsed && "justify-center",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={30}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-white"
                      : `${item.color} group-hover:text-white`,
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span
                      className={cn(
                        "flex-1 text-md transition-colors",
                        isActive
                          ? "text-white"
                          : `${item.color} group-hover:text-white`,
                      )}
                    >
                      {item.label}
                    </span>
                    {item.label === "Employees" && pendingCount > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-green-200">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-md font-medium hover:bg-green-600 hover:text-white transition"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
