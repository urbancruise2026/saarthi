import {
  Users,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  TrendingUp,
  UserPlus,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  monthlyTrends,
  departmentStats,
  genderData,
  recentActivity,
  payrollSummary,
} from "@/utils/mockChartData";
import { useEffect } from "react";
import { fetchEmployeesThunk } from "@/redux/features/userSlice";

const CHART_COLORS = {
  primary: "hsl(145, 63%, 42%)",
  orange: "hsl(28, 90%, 52%)",
  yellow: "hsl(45, 96%, 54%)",
  success: "hsl(158, 64%, 40%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(215, 16%, 47%)",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { employees, currentEmployee } = useAppSelector((state) => state.user);

  const stats = {
    total: employees.length,
    pending: employees.filter(
      (e) => e.status === "pending" || e.status === "resubmitted",
    ).length,
    approved: employees.filter((e) => e.status === "approved").length,
    rejected: employees.filter((e) => e.status === "rejected").length,
  };

  const recent = [...employees]
    .filter((e) => e.submittedAt)
    .sort(
      (a, b) =>
        new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime(),
    )
    .slice(0, 5);

  const totalGender = genderData.reduce((s, g) => s + g.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {currentEmployee?.fullName} ! Here's your organization
          overview.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Employees"
          value={stats.total}
          gradient
          change="+2 this month"
          changeType="positive"
          onClick={() => navigate("/employees")}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pending Approvals"
          value={stats.pending}
          color="hsl(var(--warning))"
          change="Needs review"
          changeType="neutral"
          onClick={() => navigate("/approvals")}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={stats.approved}
          color="hsl(var(--success))"
          change="Active employees"
          changeType="positive"
          onClick={() => navigate("/employees")}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="hsl(var(--destructive))"
          change="Needs attention"
          changeType="negative"
          onClick={() => navigate("/approvals")}
        />
      </div>

      {/* ── Charts Row 1 ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Overview Line Chart */}
        <ChartCard
          title="Monthly Overview"
          subtitle="Attendance & task trends"
          icon={TrendingUp}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient
                    id="gradAttendance"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.orange}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.orange}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke={CHART_COLORS.primary}
                  fill="url(#gradAttendance)"
                  strokeWidth={2}
                  name="Attendance %"
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke={CHART_COLORS.orange}
                  fill="url(#gradTasks)"
                  strokeWidth={2}
                  name="Tasks %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Department Strength Bar Chart */}
        <ChartCard
          title="Department Strength"
          subtitle="Employee count by department"
          icon={BarChart3}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="employees" radius={[6, 6, 0, 0]} name="Employees">
                  {departmentStats.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i % 2 === 0 ? CHART_COLORS.primary : CHART_COLORS.orange
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2 ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gender Distribution Pie */}
        <ChartCard
          title="Gender Distribution"
          subtitle={`${totalGender} total employees`}
          icon={PieChart}
        >
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Payroll Trend */}
        <ChartCard
          title="Payroll Summary"
          subtitle="Gross vs net trend"
          icon={DollarSign}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollSummary}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `₹${v.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="gross"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Gross"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke={CHART_COLORS.orange}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Circular Progress */}
        <ChartCard
          title="Key Metrics"
          subtitle="Organization health"
          icon={Activity}
        >
          <div className="flex items-center justify-around h-64">
            <CircularProgress
              value={92}
              label="Attendance"
              sublabel="Org avg."
              color={CHART_COLORS.primary}
            />
            <CircularProgress
              value={85}
              label="Tasks Done"
              sublabel="This month"
              color={CHART_COLORS.orange}
            />
          </div>
        </ChartCard>
      </div>

      {/* ── Recent Activity ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title="Recent Submissions"
            action={
              <button
                onClick={() => navigate("/employees")}
                className="text-xs text-primary font-medium hover:underline"
              >
                View all
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Employee
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Department
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Submitted
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Status
                    </th>
                  </tr>
                </thead>
                {/* <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate("/employees")}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emp.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {emp.department_Name}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {emp.submittedAt
                          ? format(new Date(emp.submittedAt), "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={emp.status} />
                      </td>
                    </tr>
                  ))}
                </tbody> */}
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Recent Activity Feed */}
        <ChartCard title="Recent Activity">
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === "success" ? "bg-success" : item.type === "warning" ? "bg-warning" : "bg-primary"}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {item.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.name} · {item.department}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => navigate("/add-employee")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 [background-size:200%_100%] [background-position:left] hover:[background-position:right]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, hsl(145 63% 42%), hsl(28 90% 52%), hsl(45 96% 54%), hsl(145 63% 42%))",
                backgroundSize: "200% 100%",
                boxShadow: "0 4px 14px -3px hsl(28 90% 52% / 0.4)",
              }}
            >
              <UserPlus size={16} /> Add New Employee
            </button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}