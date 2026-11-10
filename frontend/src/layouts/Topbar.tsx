import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Menu, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { markAllRead, markAsRead } from "@/redux/notificationSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import sarthi from "../assets/aaaaaa.png";
import urbanLogo from "../assets/LOGO.png";
import { toast } from "sonner";
import EmployeeDropdown from "@/components/dropdown/EmployeeDropdown";
import OpsDropdown from "@/components/dropdown/opsDropdown";
import PolicieDropdown from "@/components/dropdown/PolicieDropdown";
import axiosInstance, { baseApi } from "@/utils/axiosInstance";
import {
  currentEmployeeThunk,
  logoutEmployeeThunk,
} from "@/redux/features/userSlice";
import { ChangePasswordModal } from "@/components/Changepasswordmodal";
import AsetDropdown from "@/components/dropdown/asetsDropdown";
import DocumentDropdown from "@/components/dropdown/documentDropdown";
import axios from "axios";
import { useAccessControl } from "@/utils/Accesscontrol";

interface TopbarProps {
  onMenuClick?: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { can } = useAccessControl();
  const canSeeFilters = can("POLICY_FILTERS");
  const currentEmployee = useAppSelector((s) => s.user.currentEmployee);
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unread = notifications.filter((n) => !n.read);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    dispatch(currentEmployeeThunk());
  }, [dispatch]);

  const notifIconColors: Record<string, string> = {
    submission: "hsl(var(--primary))",
    approved: "hsl(var(--success))",
    rejected: "hsl(var(--destructive))",
    resubmitted: "hsl(var(--warning))",
  };

  const generateLink = async () => {
    try {
      const res = await axios.get(`${baseApi}link/generate-onboarding-link`);

      const link = res.data.link;
      await navigator.clipboard.writeText(link);
      toast.success("Link copied successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate link");
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutEmployeeThunk()).unwrap();
      toast.success("Logout successfully");
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <header className="h-16 flex items-center px-4 md:px-6 border-b border-border bg-card shadow-sm sticky top-0 z-10">
        {/* LEFT — Logo */}
        <div className="flex items-center gap-5 w-[300px] shrink-0">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer   "
          >
            <img
              src={urbanLogo}
              alt="SARTHI HRMS Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer border-x-2 rounded-full px-3 border-orange-300"
          >
            <img
              src={sarthi}
              alt="SARTHI HRMS Logo"
              className="h-16 w-auto object-contain py-1"
            />
          </div>
        </div>

        {/* CENTER — Dropdowns */}

        <div className="flex-1 flex items-center justify-center gap-2">
          {canSeeFilters && (
            <>
              <EmployeeDropdown generateLink={generateLink} />
              <OpsDropdown />
              <PolicieDropdown />
              <AsetDropdown />
              <DocumentDropdown />
            </>
          )}
        </div>

        {/* RIGHT — Notifications + Profile */}
        <div className="flex items-center gap-2 w-[220px] justify-end shrink-0">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Bell size={18} />
                {unread.length > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{ background: "hsl(var(--destructive))" }}
                  >
                    {unread.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unread.length > 0 && (
                  <button
                    onClick={() => dispatch(markAllRead())}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => dispatch(markAsRead(n.id))}
                    className={cn(
                      "flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-muted/50 border-b",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-2"
                      style={{ background: notifIconColors[n.type] }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {format(new Date(n.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu onOpenChange={setProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-all duration-200">
                {/* Circle hamesha dikhega */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-primary shrink-0">
                  {currentEmployee?.fullName?.slice(0, 2).toUpperCase() || "HR"}
                </div>

                {/* ✅ Name/Email — smoothly hide jab dropdown open ho */}
                <div
                  className={cn(
                    "hidden md:block text-left overflow-hidden transition-all duration-300 ease-in-out",
                    profileOpen ? "max-w-0 opacity-0" : "max-w-xs opacity-100",
                  )}
                >
                  <p className="text-sm font-medium leading-tight whitespace-nowrap">
                    {currentEmployee?.fullName || "HR Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {currentEmployee?.officeEmail}
                  </p>
                </div>

                {/* Chevron rotate on open */}
                <ChevronDown
                  size={14}
                  className={cn(
                    "hidden md:block text-muted-foreground transition-transform duration-300 ease-in-out",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              {/* Name + Email + Details */}
              <div className="px-3 py-3 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-primary shrink-0">
                    {currentEmployee?.fullName?.slice(0, 2).toUpperCase() ||
                      "HR"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {currentEmployee?.fullName || "HR Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentEmployee?.officeEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {currentEmployee?.access_role && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Role
                      </span>
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {currentEmployee.role}
                      </span>
                    </div>
                  )}
                  {currentEmployee?.department_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Department
                      </span>
                      <span className="text-xs font-medium">
                        {currentEmployee.department_name}
                      </span>
                    </div>
                  )}
                  {currentEmployee?.subDepartment_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Sub Dept
                      </span>
                      <span className="text-xs font-medium">
                        {currentEmployee.subDepartment_name}
                      </span>
                    </div>
                  )}
                  {currentEmployee?.region_names?.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Region
                      </span>
                      <span className="text-xs font-medium">
                        {currentEmployee.region_names.join(", ")}
                      </span>
                    </div>
                  )}
                  {currentEmployee?.zone_names?.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Zone
                      </span>
                      <span className="text-xs font-medium">
                        {currentEmployee.zone_names.join(", ")}
                      </span>
                    </div>
                  )}
                  {currentEmployee?.city_names?.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        City
                      </span>
                      <span className="text-xs font-medium">
                        {currentEmployee.city_names.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenuItem
                className="gap-2 mt-1"
                onClick={() => navigate("/self-profile")}
              >
                <User size={14} /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 mt-1"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock size={14} /> Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive"
                onClick={handleLogout}
              >
                <LogOut size={14} /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
