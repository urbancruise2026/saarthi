import {
  Users,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  TrendingUp,
  Building2,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
} from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
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

const CHART_COLORS = {
  primary: "hsl(145, 63%, 42%)",
  orange: "hsl(28, 90%, 52%)",
  yellow: "hsl(45, 96%, 54%)",
  success: "hsl(158, 64%, 40%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(215, 16%, 47%)",
};

const monthlyTrends = [
  { month: "Feb", attendance: 91, tasks: 84 },
  { month: "Mar", attendance: 93, tasks: 86 },
  { month: "Apr", attendance: 89, tasks: 81 },
  { month: "May", attendance: 92, tasks: 88 },
  { month: "Jun", attendance: 94, tasks: 90 },
  { month: "Jul", attendance: 90, tasks: 85 },
];

const teamStats = [
  { name: "Frontend", employees: 8 },
  { name: "Backend", employees: 10 },
  { name: "QA", employees: 5 },
  { name: "Design", employees: 4 },
  { name: "DevOps", employees: 3 },
];

const approvalStatusData = [
  { name: "Approved", value: 24, fill: CHART_COLORS.success },
  { name: "Pending", value: 6, fill: CHART_COLORS.orange },
  { name: "Rejected", value: 2, fill: CHART_COLORS.destructive },
];

const payrollSummary = [
  { month: "Feb", gross: 480000, net: 410000 },
  { month: "Mar", gross: 495000, net: 421000 },
  { month: "Apr", gross: 500000, net: 425000 },
  { month: "May", gross: 510000, net: 432000 },
  { month: "Jun", gross: 520000, net: 440000 },
  { month: "Jul", gross: 515000, net: 437000 },
];

const teamLeadPerformance = [
  {
    id: 1,
    teamLead: "Ananya Rao",
    team: "Frontend",
    attendancePct: 95,
    pendingApprovals: 1,
  },
  {
    id: 2,
    teamLead: "Vikram Singh",
    team: "Backend",
    attendancePct: 91,
    pendingApprovals: 3,
  },
  {
    id: 3,
    teamLead: "Isha Kapoor",
    team: "QA",
    attendancePct: 89,
    pendingApprovals: 0,
  },
  {
    id: 4,
    teamLead: "Farhan Ali",
    team: "Design",
    attendancePct: 97,
    pendingApprovals: 2,
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Leave approved",
    name: "Karan Mehta",
    department: "Backend",
    time: "1h ago",
    type: "success",
  },
  {
    id: 2,
    action: "New leave request",
    name: "Rohan Verma",
    department: "QA",
    time: "3h ago",
    type: "warning",
  },
  {
    id: 3,
    action: "Attendance flagged",
    name: "Sneha Patil",
    department: "Design",
    time: "5h ago",
    type: "warning",
  },
  {
    id: 4,
    action: "Employee onboarded",
    name: "Ritu Sen",
    department: "Frontend",
    time: "1d ago",
    type: "success",
  },
];

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppSelector((state) => state.user);

  const totalEmployees = teamStats.reduce((s, t) => s + t.employees, 0);
  const totalPending =
    approvalStatusData.find((a) => a.name === "Pending")?.value ?? 0;
  const totalApproved =
    approvalStatusData.find((a) => a.name === "Approved")?.value ?? 0;
  const totalRejected =
    approvalStatusData.find((a) => a.name === "Rejected")?.value ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {currentEmployee?.fullName}! Here's how your teams are
          performing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Employees"
          value={totalEmployees}
          gradient
          change={`${teamStats.length} teams`}
          changeType="positive"
          onClick={() => navigate("/employees")}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pending Approvals"
          value={totalPending}
          color="hsl(var(--warning))"
          change="Needs review"
          changeType="neutral"
          onClick={() => navigate("/approvals")}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={totalApproved}
          color="hsl(var(--success))"
          change="This month"
          changeType="positive"
          onClick={() => navigate("/approvals")}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={totalRejected}
          color="hsl(var(--destructive))"
          change="This month"
          changeType="negative"
          onClick={() => navigate("/approvals")}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Overview */}
        <ChartCard
          title="Monthly Overview"
          subtitle="Attendance & task trends across teams"
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

        {/* Team Strength Bar Chart */}
        <ChartCard
          title="Team Strength"
          subtitle="Employee count by team"
          icon={BarChart3}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamStats} barSize={32}>
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
                  {teamStats.map((_, i) => (
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
        {/* Approval Status Pie */}
        <ChartCard
          title="Approval Status"
          subtitle={`${totalApproved + totalPending + totalRejected} requests this month`}
          icon={PieChart}
        >
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={approvalStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {approvalStatusData.map((entry, i) => (
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
          subtitle="Org health under you"
          icon={Activity}
        >
          <div className="flex items-center justify-around h-64">
            <CircularProgress
              value={91}
              label="Attendance"
              sublabel="Avg. across teams"
              color={CHART_COLORS.primary}
            />
            <CircularProgress
              value={86}
              label="Tasks Done"
              sublabel="This month"
              color={CHART_COLORS.orange}
            />
          </div>
        </ChartCard>
      </div>

      {/* ── Team Leads & Activity ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title="Team Lead Performance"
            icon={Building2}
            action={
              <button
                onClick={() => navigate("/teams")}
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
                      Team Lead
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Team
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Attendance %
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Pending Approvals
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamLeadPerformance.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate("/teams")}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {row.teamLead
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <p className="font-medium text-foreground">
                            {row.teamLead}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {row.team}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {row.attendancePct}%
                      </td>
                      <td className="py-3">
                        {row.pendingApprovals > 0 ? (
                          <StatusBadge status="pending" />
                        ) : (
                          <StatusBadge status="approved" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
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
              onClick={() => navigate("/approvals")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 [background-size:200%_100%] [background-position:left] hover:[background-position:right]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, hsl(145 63% 42%), hsl(28 90% 52%), hsl(45 96% 54%), hsl(145 63% 42%))",
                backgroundSize: "200% 100%",
                boxShadow: "0 4px 14px -3px hsl(28 90% 52% / 0.4)",
              }}
            >
              <ClipboardCheck size={16} /> Review Approvals
            </button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
