import { AttendanceRecord } from "@/redux/features/Attendance/attendanceSlice";

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Half Day"
  | "Leave"
  | "WeekOff"
  | "Holiday"
  | "Pending"
  | "CompOff"
  | "Extra Work";

export const STATUS_COLORS: Record<
  AttendanceStatus,
  { bg: string; text: string }
> = {
  Present: {
    bg: "bg-green-600",
    text: "text-white",
  },

  Absent: {
    bg: "bg-red-600",
    text: "text-white",
  },

  "Half Day": {
    bg: "bg-amber-600",
    text: "text-white",
  },

  Leave: {
    bg: "bg-pink-600",
    text: "text-white",
  },

  WeekOff: {
    bg: "bg-blue-600",
    text: "text-white",
  },

  Holiday: {
    bg: "bg-violet-600",
    text: "text-white",
  },

  Pending: {
    bg: "bg-orange-500",
    text: "text-white",
  },

  CompOff: {
    bg: "bg-teal-600",
    text: "text-white",
  },

  "Extra Work": {
    bg: "bg-orange-600",
    text: "text-white",
  },
};

export const LEAVE_TYPES = [
  "Sick Leave",
  "Casual Leave",
  "Earned Leave",
  "Unpaid Leave",
];

export type Override = { status: AttendanceStatus; leaveType?: string };

export type ModalState =
  | { type: "halfday"; empId: string; empName: string }
  | { type: "leave"; empId: string; empName: string; leaveType: string }
  | null;

export function parseTimeToMinutes(time?: string | null): number | null {
  if (!time) return null;

  const ampm = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampm) {
    let hours = parseInt(ampm[1], 10);
    const minutes = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const h24 = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (h24) {
    const hours = parseInt(h24[1], 10);
    const minutes = parseInt(h24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

export function formatTime12h(time?: string | null): string {
  const mins = parseTimeToMinutes(time);
  if (mins === null) return "—";
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDuration(totalMinutes?: number | null): string {
  if (totalMinutes === null || totalMinutes === undefined) return "—";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export type DisplayRow = ReturnType<typeof toDisplayRow>;

export function toDisplayRow(r: AttendanceRecord, override?: Override) {
  const empId = String(r.employee_id);

  const status: AttendanceStatus =
    override?.status ?? (r.status as AttendanceStatus) ?? "Absent";

  const leaveType = override?.leaveType ?? r.leave_type ?? undefined;

  const inTime = formatTime12h(r.punch_in);
  const outTime = formatTime12h(r.punch_out);

  const effectiveShift = r.shift_timing || "—";

  const todayShiftTiming = r.attendance_shift_timing || null;

  // ---- Backend se aa rahi values seedhi use karo, dobara calculate mat karo ----
  const workingMinutes = r.worked_minutes ?? null;
  const overtimeMinutes = r.overtime_minutes ?? 0;
  const shortfallMinutes = r.short_minutes ?? 0;
  const lateMinutes = r.late_minutes ?? 0;
  const earlyMinutes = r.early_exit_minutes ?? 0;

  const isLate = lateMinutes > 0;
  const isEarlyOut = earlyMinutes > 0;

  const workingHours =
    workingMinutes !== null ? formatDuration(workingMinutes) : null;

  const shortfall =
    shortfallMinutes > 0 ? formatDuration(shortfallMinutes) : null;
  const overtime = overtimeMinutes > 0 ? formatDuration(overtimeMinutes) : null;

  return {
    id: empId,
    attendanceId: r.attendance_id ?? null, // NEW
    attendanceDate: r.attendance_date,
    fullName: r.full_name,
    department: r.department_name || "—",
    branchName: r.branch_name || "—",

    shiftTiming: effectiveShift,
    todayShiftTiming,

    permanentShiftTiming: r.permanent_shift_timing,
    temporaryShiftTiming: r.temporary_shift_timing,

    isTemporaryShift: r.shift_source === "Temporary",

    branchOfficeId: r.branchOffice_id,

    status,
    leaveType,

    inTime,
    outTime,

    isLate,
    lateMinutes,

    isEarlyOut,
    earlyMinutes,

    workingMinutes,
    workingHours,

    shortfallMinutes,
    overtimeMinutes,
    shortfall,
    overtime,

    earlyExitReason: r.early_exit_reason ?? null, // NEW
  };
}
