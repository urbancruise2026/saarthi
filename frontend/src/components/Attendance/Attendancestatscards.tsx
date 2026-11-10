import {
  Users,
  CheckCircle,
  CalendarOff,
  TimerReset,
  CalendarDays,
} from "lucide-react";
import { DisplayRow } from "./Attendanceutils";
import { AttendanceSummary } from "@/redux/features/Attendance/attendanceSlice";

interface AttendanceStatsCardsProps {
  rows: DisplayRow[];
  isDrillDown: boolean;
  currentMonthStr: string;
  selectedDateLabel: string;
  summary?: AttendanceSummary | null;
}

export default function AttendanceStatsCards({
  rows,
  isDrillDown,
  currentMonthStr,
  selectedDateLabel,
  summary,
}: AttendanceStatsCardsProps) {
  const totalEmployee = summary ? summary.totalEmployee : rows.length;
  const presentCount = summary
    ? summary.present
    : rows.filter((e) => e.status === "Present").length;
  const absentCount = summary
    ? summary.absent
    : rows.filter((e) => e.status === "Absent").length;
  const leaveCount = summary
    ? summary.leave
    : rows.filter((e) => e.status === "Leave").length;
  const compOffCount = summary ? summary.compOff : 0;
  const lwpCount = summary ? summary.lwp : 0;

  const cards = [
    {
      label: isDrillDown ? "This Month" : "Date",
      value: isDrillDown ? currentMonthStr : selectedDateLabel,
      icon: CalendarDays,
      bg: "bg-orange-200",
    },
    {
      label: "Total Employee",
      value: totalEmployee,
      icon: Users,
      bg: "bg-sky-200",
    },
    {
      label: "Present",
      value: presentCount,
      icon: CheckCircle,
      bg: "bg-green-200",
    },
    {
      label: "Absent",
      value: absentCount,
      icon: Users,
      bg: "bg-red-200",
    },
    {
      label: "Leave",
      value: leaveCount,
      icon: CalendarOff,
      bg: "bg-blue-200",
    },
    {
      label: "Comp Off",
      value: compOffCount,
      icon: TimerReset,
      bg: "bg-violet-200",
    },
    {
      label: "LWP",
      value: lwpCount,
      icon: TimerReset,
      bg: "bg-yellow-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-7 xl:grid-cols-7 gap-4">
      {cards.map(({ label, value, icon: Icon, bg }) => (
        <div
          key={label}
          className={`${bg} rounded-2xl p-3 flex items-center gap-4 shadow-md hover:shadow-xl transition-all`}
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/40">
            <Icon size={28} className="text-gray-700" />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide text-gray-700">
              {label}
            </p>

            <p className="text-xl font-extrabold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
