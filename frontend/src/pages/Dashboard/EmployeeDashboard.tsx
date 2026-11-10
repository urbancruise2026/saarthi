import {
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Plane,
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

const attendanceTrend = [
  { month: "Feb", present: 22, absent: 1, leave: 1 },
  { month: "Mar", present: 24, absent: 0, leave: 2 },
  { month: "Apr", present: 21, absent: 2, leave: 1 },
  { month: "May", present: 23, absent: 1, leave: 0 },
  { month: "Jun", present: 25, absent: 0, leave: 1 },
  { month: "Jul", present: 20, absent: 1, leave: 2 },
];

const weeklyHours = [
  { day: "Mon", hours: 8.5 },
  { day: "Tue", hours: 8 },
  { day: "Wed", hours: 9 },
  { day: "Thu", hours: 8.5 },
  { day: "Fri", hours: 7.5 },
  { day: "Sat", hours: 4 },
];

const leaveBalance = [
  { name: "Casual", value: 6, fill: CHART_COLORS.primary },
  { name: "Sick", value: 4, fill: CHART_COLORS.orange },
  { name: "Earned", value: 8, fill: CHART_COLORS.yellow },
];

const recentAttendance = [
  {
    date: "2026-07-25",
    punchIn: "10:05 AM",
    punchOut: "06:35 PM",
    status: "approved",
  },
  {
    date: "2026-07-24",
    punchIn: "10:12 AM",
    punchOut: "06:40 PM",
    status: "approved",
  },
  {
    date: "2026-07-23",
    punchIn: "10:00 AM",
    punchOut: "06:30 PM",
    status: "approved",
  },
  { date: "2026-07-22", punchIn: "-", punchOut: "-", status: "pending" },
  {
    date: "2026-07-21",
    punchIn: "10:20 AM",
    punchOut: "06:25 PM",
    status: "rejected",
  },
];

const recentLeaveRequests = [
  {
    id: 1,
    type: "Sick Leave",
    from: "2026-07-22",
    to: "2026-07-22",
    status: "pending",
  },
  {
    id: 2,
    type: "Casual Leave",
    from: "2026-07-10",
    to: "2026-07-11",
    status: "approved",
  },
  {
    id: 3,
    type: "Earned Leave",
    from: "2026-06-18",
    to: "2026-06-20",
    status: "approved",
  },
];
// ──────────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppSelector((state) => state.user);

  const totalLeaveBalance = leaveBalance.reduce((s, l) => s + l.value, 0);

  const monthPresent =
    attendanceTrend[attendanceTrend.length - 1]?.present ?? 0;
  const monthAbsent = attendanceTrend[attendanceTrend.length - 1]?.absent ?? 0;
  const monthLeave = attendanceTrend[attendanceTrend.length - 1]?.leave ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {currentEmployee?.fullName}! Here's your attendance and
          leave overview.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Present This Month"
          value={monthPresent}
          gradient
          change="Days worked"
          changeType="positive"
          onClick={() => navigate("/attendance")}
        />
        <StatCard
          icon={XCircle}
          label="Absent This Month"
          value={monthAbsent}
          color="hsl(var(--destructive))"
          change="Needs attention"
          changeType={monthAbsent > 0 ? "negative" : "neutral"}
          onClick={() => navigate("/attendance")}
        />
        <StatCard
          icon={Plane}
          label="Leave Balance"
          value={totalLeaveBalance}
          color="hsl(var(--warning))"
          change="Days remaining"
          changeType="neutral"
          onClick={() => navigate("/leave")}
        />
        <StatCard
          icon={CalendarDays}
          label="Leaves Taken"
          value={monthLeave}
          color="hsl(var(--success))"
          change="This month"
          changeType="positive"
          onClick={() => navigate("/leave")}
        />
      </div>

      {/* ── Charts Row 1 ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <ChartCard
          title="Attendance Trend"
          subtitle="Last 6 months"
          icon={TrendingUp}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
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
                  <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.destructive}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.destructive}
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
                  dataKey="present"
                  stroke={CHART_COLORS.primary}
                  fill="url(#gradPresent)"
                  strokeWidth={2}
                  name="Present Days"
                />
                <Area
                  type="monotone"
                  dataKey="absent"
                  stroke={CHART_COLORS.destructive}
                  fill="url(#gradAbsent)"
                  strokeWidth={2}
                  name="Absent Days"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Weekly Hours Bar Chart */}
        <ChartCard
          title="This Week's Hours"
          subtitle="Hours worked per day"
          icon={BarChart3}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHours} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
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
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} name="Hours">
                  {weeklyHours.map((_, i) => (
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
        {/* Leave Balance Pie */}
        <ChartCard
          title="Leave Balance"
          subtitle={`${totalLeaveBalance} days remaining`}
          icon={PieChart}
        >
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={leaveBalance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {leaveBalance.map((entry, i) => (
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

        {/* Punctuality Trend */}
        <ChartCard
          title="Punch-In Punctuality"
          subtitle="On-time vs late (last 4 weeks)"
          icon={Clock}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { week: "W1", onTime: 4, late: 1 },
                  { week: "W2", onTime: 5, late: 0 },
                  { week: "W3", onTime: 3, late: 2 },
                  { week: "W4", onTime: 5, late: 1 },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="week"
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
                <Line
                  type="monotone"
                  dataKey="onTime"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="On Time"
                />
                <Line
                  type="monotone"
                  dataKey="late"
                  stroke={CHART_COLORS.destructive}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Late"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Circular Progress */}
        <ChartCard
          title="Key Metrics"
          subtitle="Your performance"
          icon={Activity}
        >
          <div className="flex items-center justify-around h-64">
            <CircularProgress
              value={94}
              label="Attendance"
              sublabel="This month"
              color={CHART_COLORS.primary}
            />
            <CircularProgress
              value={88}
              label="Punctuality"
              sublabel="This month"
              color={CHART_COLORS.orange}
            />
          </div>
        </ChartCard>
      </div>

      {/* ── Recent Attendance & Leave ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title="Recent Attendance"
            action={
              <button
                onClick={() => navigate("/attendance")}
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
                      Date
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Punch In
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Punch Out
                    </th>
                    <th className="text-left pb-3 text-muted-foreground font-medium text-xs">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 text-foreground text-xs">
                        {format(new Date(row.date), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {row.punchIn}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {row.punchOut}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Recent Leave Requests */}
        <ChartCard
          title="Recent Leave Requests"
          action={
            <button
              onClick={() => navigate("/leave")}
              className="text-xs text-primary font-medium hover:underline"
            >
              View all
            </button>
          }
        >
          <div className="space-y-3">
            {recentLeaveRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.status === "approved"
                      ? "bg-success"
                      : item.status === "pending"
                        ? "bg-warning"
                        : "bg-destructive"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {item.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.from), "MMM d")} –{" "}
                    {format(new Date(item.to), "MMM d, yyyy")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => navigate("/leave/apply")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 [background-size:200%_100%] [background-position:left] hover:[background-position:right]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, hsl(145 63% 42%), hsl(28 90% 52%), hsl(45 96% 54%), hsl(145 63% 42%))",
                backgroundSize: "200% 100%",
                boxShadow: "0 4px 14px -3px hsl(28 90% 52% / 0.4)",
              }}
            >
              <FileText size={16} /> Apply for Leave
            </button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
