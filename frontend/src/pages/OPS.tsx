import { useState } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  Search,
  TrendingUp,
} from "lucide-react";

type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Holiday";

const STATUS_COLORS: Record<AttendanceStatus, { bg: string; color: string }> = {
  Present: {
    bg: "hsl(var(--success) / 0.12)",
    color: "hsl(var(--success))",
  },
  Absent: {
    bg: "hsl(var(--destructive) / 0.12)",
    color: "hsl(var(--destructive))",
  },
  "Half Day": {
    bg: "hsl(var(--warning) / 0.12)",
    color: "hsl(var(--warning))",
  },
  Leave: {
    bg: "hsl(var(--primary) / 0.12)",
    color: "hsl(var(--primary))",
  },
  Holiday: {
    bg: "hsl(var(--muted))",
    color: "hsl(var(--muted-foreground))",
  },
};

const STATUSES: AttendanceStatus[] = [
  "Present",
  "Absent",
  "Half Day",
  "Leave",
  "Holiday",
];

const SHIFTS = [
  { name: "Morning Shift", time: "09:00 AM – 06:00 PM", type: "General" },
  { name: "Night Shift", time: "10:00 PM – 07:00 AM", type: "Night" },
  { name: "Rotational", time: "Varies", type: "Rotational" },
];

export default function OPS() {
  const employees = useAppSelector((s) =>
    s.employees.employees.filter((e) => e.status === "approved"),
  );

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"attendance" | "shifts" | "leave">(
    "attendance",
  );

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const attendanceData = filtered.map((emp) => {
    const seed = emp.id.charCodeAt(emp.id.length - 1) % 5;
    const status = STATUSES[seed];
    const inTime =
      status === "Present" || status === "Half Day" ? "09:02 AM" : "—";
    const outTime =
      status === "Present"
        ? "06:15 PM"
        : status === "Half Day"
          ? "01:30 PM"
          : "—";

    return { ...emp, status, inTime, outTime };
  });

  const presentCount = attendanceData.filter(
    (e) => e.status === "Present",
  ).length;
  const absentCount = attendanceData.filter(
    (e) => e.status === "Absent",
  ).length;
  const leaveEmployees = attendanceData.filter((e) => e.status === "Leave");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            OPS — Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Attendance tracking, shift management & workforce operations
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg">
          {["attendance", "shifts", "leave"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`p-5 py-1.5 text-sm rounded-md transition ${
                tab === t
                  ? " text-white shadow-sm"
                  : " text-white hover:bg-orange-950"
              }`}
              style={{ background: "var(--gradient-primary)" }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Date",
            value: today,
            icon: CalendarDays,
            color: "primary",
          },
          {
            label: "Present Today",
            value: presentCount,
            icon: CheckCircle,
            color: "success",
          },
          {
            label: "Absent Today",
            value: absentCount,
            icon: Users,
            color: "destructive",
          },
          {
            label: "On Leave",
            value: leaveEmployees.length,
            icon: Clock,
            color: "warning",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `hsl(var(--${color}) / 0.12)`,
              }}
            >
              <Icon size={18} style={{ color: `hsl(var(--${color}))` }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-base font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Tab */}
      {tab === "attendance" && (
        <>
          <div className="relative max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees…"
              className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm"
            />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {[
                      "Employee",
                      "Department",
                      "Shift",
                      "Check-In",
                      "Check-Out",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((emp) => {
                    const sc = STATUS_COLORS[emp.status];
                    return (
                      <tr
                        key={emp.id}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="px-4 py-3">{emp.department}</td>
                        <td className="px-4 py-3">
                          {emp.shiftTiming || "Morning"}
                        </td>
                        <td className="px-4 py-3">{emp.inTime}</td>
                        <td className="px-4 py-3">{emp.outTime}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Shifts Tab */}
      {tab === "shifts" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SHIFTS.map((shift) => (
            <div
              key={shift.name}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {shift.type}
                </span>
                <TrendingUp size={14} />
              </div>
              <h3 className="font-semibold">{shift.name}</h3>
              <p className="text-sm text-muted-foreground">{shift.time}</p>
            </div>
          ))}
        </div>
      )}

      {/* Leave Tab */}
      {tab === "leave" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Employee", "Department", "Leave Type", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {leaveEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No employees on leave today
                    </td>
                  </tr>
                ) : (
                  leaveEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-4 py-3">{emp.department}</td>
                      <td className="px-4 py-3">Casual Leave</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Approved
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
