import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useEffect } from "react";

import { PrivateRoute } from "@/components/PrivateRoute";

import { AppLayout } from "@/layouts/AppLayout";
import { connectSocket, disconnectSocket } from "@/socket";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import AddEmployee from "@/pages/AddEmployee";
import PendingApprovals from "@/pages/PendingApprovals";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Payroll from "@/pages/Payroll";
import AssetManagement from "@/pages/AssetManagement";
import ImprestExpense from "@/pages/ImprestExpense";
import OPS from "@/pages/OPS";
import HRPolicies from "@/pages/HRPolicies";
import CreateLetter from "@/pages/CreateLetter";
import ManageLetters from "@/pages/ManageLetters";
import LetterTemplates from "@/pages/LetterTemplates";
import Training from "./pages/Training";
import OnboardingSubmitted from "./pages/OnboardingSubmitted";
import { currentEmployeeThunk } from "./redux/features/userSlice";
import { PublicRoute } from "./components/PublicRoute";
import { OnboardingVerifyTable } from "./pages/StepActivity";
import NoticeManager from "./pages/Announcement";
import EmployeeManager from "./pages/accessPage";
import { UnauthorizedPage } from "@/pages/Unauthorized";
import EmployeeDashboard from "./pages/Dashboard/EmployeeDashboard";
import TeamLeadDashboard from "./pages/Dashboard/TeamLeadDashboard";
import ManagerDashboard from "./pages/Dashboard/ManagerDashboard";
import ZonalDashboard from "./pages/Dashboard/ZonalDashboard";
import HodDashboard from "./pages/Dashboard/HodDashboard";
import Profile from "./pages/Profile";
import { RouteGuard } from "./components/routeguard";
import BackgroundVerification from "./pages/BackgroundVerification";
import OfferLetter from "./pages/Document/OfferLetter";
import Leave from "./pages/Leave";
import Attendance from "./pages/Attendance";
import AttendanceCalendar from "./pages/Calendar";

const queryClient = new QueryClient();

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialized } = useAppSelector((s) => s.user);

  useEffect(() => {
    if (!initialized) dispatch(currentEmployeeThunk());
  }, []);

  useEffect(() => {
    if (isAuthenticated) connectSocket();
    else disconnectSocket();
  }, [isAuthenticated]);

  return <>{children}</>;
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors />
        <BrowserRouter>
          <AppInitializer>
            <Routes>
              {/* ── Public ── */}
              <Route
                path="/add-employee/onboarding-form"
                element={<AddEmployee />}
              />
              <Route
                path="/onboarding-submitted"
                element={<OnboardingSubmitted />}
              />
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* ── Protected ── */}
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  {/* Always accessible (authenticated users) */}
                  <Route path="/self-profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Dashboards */}
                  <Route path="/" element={<Dashboard />} />
                  <Route
                    path="/employee-dashboard"
                    element={<EmployeeDashboard />}
                  />
                  <Route
                    path="/teamlead-dashboard"
                    element={<TeamLeadDashboard />}
                  />
                  <Route
                    path="/manager-dashboard"
                    element={<ManagerDashboard />}
                  />
                  <Route path="/zonal-dashboard" element={<ZonalDashboard />} />
                  <Route path="/hod-dashboard" element={<HodDashboard />} />

                  {/* ── Documents — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/documents" />}>
                    <Route
                      path="/documents"
                      element={<Navigate to="/documents/create" replace />}
                    />
                    <Route
                      path="/documents/create"
                      element={<CreateLetter />}
                    />
                    <Route
                      path="/documents/manage"
                      element={<ManageLetters />}
                    />
                    <Route path="/offer-letter" element={<OfferLetter />} />
                    <Route
                      path="/documents/templates"
                      element={<LetterTemplates />}
                    />
                  </Route>

                  {/* ── Approvals — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/approvals" />}>
                    <Route path="/approvals" element={<PendingApprovals />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/add-employee" element={<AddEmployee />} />
                    <Route
                      path="/onboardingVerify"
                      element={<OnboardingVerifyTable />}
                    />
                  </Route>

                  {/* ── Payroll — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/payroll" />}>
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/expense" element={<ImprestExpense />} />
                  </Route>

                  {/* ── OPS — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/ops" />}>
                    <Route path="/ops" element={<OPS />} />
                    <Route
                      path="/add-announcement"
                      element={<NoticeManager />}
                    />
                  </Route>

                  {/* ── HR Policies — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/hr-policies" />}>
                    <Route path="/hr-policies" element={<HRPolicies />} />
                  </Route>
                  <Route element={<RouteGuard allowedPath="/leave" />}>
                    <Route path="/leave" element={<Leave />} />
                  </Route>
                  <Route element={<RouteGuard allowedPath="/attendance" />}>
                    <Route path="/attendance" element={<Attendance />} />
                  </Route>
                  <Route element={<RouteGuard allowedPath="/calendar" />}>
                    <Route path="/calendar" element={<AttendanceCalendar />} />
                  </Route>
                  {/* ── Access / Training — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/access" />}>
                    <Route path="/access" element={<EmployeeManager />} />
                    <Route path="/trainig" element={<Training />} />
                  </Route>

                  {/* ── Assets — guarded ── */}
                  <Route element={<RouteGuard allowedPath="/assets" />}>
                    <Route path="/assets" element={<AssetManagement />} />
                    <Route
                      path="/background-verification"
                      element={<BackgroundVerification />}
                    />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppInitializer>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
