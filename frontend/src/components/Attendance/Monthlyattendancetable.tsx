import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlarmClock,
  CalendarClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import DepartmentFilter from "@/components/FilterComponent/DepartmentFilter";
import EmployeeFilter from "@/components/FilterComponent/EmployeeFilter";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  AttendanceRecord,
  fetchMonthlyAttendance,
} from "@/redux/features/Attendance/attendanceSlice";
import { RootState } from "@/redux/store";

const MONTH_MAP: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const ALL_MONTHS = Object.keys(MONTH_MAP);
const YEARS = ["2024", "2025", "2026"];
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

const STATUS_TO_CODE: Record<string, string> = {
  Present: "P",
  Absent: "A",
  Pending: "PD",
  "Half Day": "HD",
  Leave: "L",
  "Week Off": "WO",
  WeekOff: "WO",
  "Comp Off": "COF",
  Holiday: "HOL",
  "Extra Work": "XW",
};

const CODE_STYLE: Record<string, string> = {
  P: "bg-green-100 text-green-700",
  A: "bg-red-100 text-red-700",
  PD: "bg-amber-100 text-amber-700",
  HD: "bg-yellow-100 text-yellow-700",
  L: "bg-emerald-600 text-white",
  WO: "bg-sky-100 text-sky-700",
  COF: "bg-[#5b3a22] text-white",
  HOL: "bg-purple-100 text-purple-700",
  XW: "bg-orange-100 text-orange-700",
};

const AVATAR_COLORS = [
  "bg-pink-400",
  "bg-indigo-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-sky-400",
  "bg-rose-400",
  "bg-lime-400",
  "bg-violet-400",
];

const ROW_TYPES = ["Status", "IN", "OUT", "WH", "OT", "F"] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function minutesToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
}

function toISTParts(isoStr: string) {
  const d = new Date(isoStr);
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth() + 1,
    day: ist.getUTCDate(),
    dow: ist.getUTCDay(),
  };
}

function hhmmss(t: string | null | undefined) {
  if (!t) return null;
  return t.slice(0, 5);
}

function timeToMinutes(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Generic "hh:mm am/pm" -> minutes-from-midnight parser
function parseTimeStringToMinutes(timeStr: string | null | undefined) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return null;
  let [, hStr, mStr, ampm] = match;
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (ampm.toLowerCase() === "pm" && h !== 12) h += 12;
  if (ampm.toLowerCase() === "am" && h === 12) h = 0;
  return h * 60 + m;
}

function parseShiftStartMinutes(shiftTiming: string | null | undefined) {
  if (!shiftTiming) return null;
  const start = shiftTiming.split("-")[0];
  return parseTimeStringToMinutes(start);
}

// NEW: shift ke start aur end dono minutes-from-midnight me nikalta hai
// e.g. "11:30 am - 8:00 pm" -> { startMinutes: 690, endMinutes: 1200 }
function parseShiftRange(shiftTiming: string | null | undefined) {
  if (!shiftTiming) return { startMinutes: null, endMinutes: null };
  const parts = shiftTiming.split("-");
  const startMinutes = parseTimeStringToMinutes(parts[0]);
  const endMinutes = parts[1] ? parseTimeStringToMinutes(parts[1]) : null;
  return { startMinutes, endMinutes };
}

interface ApiAttendanceRecord {
  attendance_id: number | null;
  employee_id: number;
  full_name: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  department_id: number | null;
  department_name: string | null;
  branchOffice_id: string | null;
  branch_name: string | null;
  permanent_shift_timing: string | null;
  permanent_shift_type?: string | null;
  temporary_shift_timing: string | null;
  temporary_shift_type?: string | null;
  shift_timing?: string | null;
  shift_type?: string | null;
  shift_source?: string | null;

  // Us din attendance mark hote waqt jo shift freeze ho chuka tha
  stored_shift_timing?: string | null;

  attendance_date: string | null;
  status: string;
  punch_in: string | null;
  punch_out: string | null;
  leave_type: string | null;
  remarks: string | null;
  from_date?: string | null;
  to_date?: string | null;
  week_off?: string | null;

  late_minutes?: number | null;
  early_exit_minutes?: number | null;
  worked_minutes?: number | null;
  overtime_minutes?: number | null;
  short_minutes?: number | null;
  worked_time?: string | null;
  overtime_time?: string | null;
  short_time?: string | null;
  is_late?: boolean;

  early_exit_reason?: string | null; // NEW
}

type DayCell = {
  day: number;
  code: string;
  in: string;
  out: string;
  wh: string;
  ot: string;
  f: string;
  isEarlyIn: boolean; // NEW — punch-in shift start se 10 min PEHLE hua (BLUE)
  isLateIn: boolean; // NEW — punch-in shift start se 10 min grace ke baad hua (RED)
  isOnTimeIn: boolean; // NEW — early window aur grace ke beech (GRAY)
  isEarlyOut: boolean; // NEW — punch-out shift end se pehle hua (RED)
  isOnTimeOut: boolean; // NEW — punch-out shift end se OUT_GRACE_MINUTES ke andar (GREEN)
  isExtendedOut: boolean; // NEW — punch-out shift end se OUT_GRACE_MINUTES se zyada baad (BLUE)
  note: string | null;
};

type ProcessedEmployee = {
  id: number;
  name: string;
  departmentId: number | null;
  branchOfficeId: string | null;
  avatarColor: string;
  days: DayCell[];
  totalHours: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  extraWork: number;
  compOff: number;
  leave: number;
  totalOT: string;
  totalShort: string;
};

const EMPTY_DAY_CELL_BASE = {
  code: "-",
  in: "-",
  out: "-",
  wh: "-",
  ot: "-",
  f: "-",
  isEarlyIn: false,
  isLateIn: false,
  isOnTimeIn: false,
  isEarlyOut: false,
  isOnTimeOut: false,
  isExtendedOut: false,
  note: null,
};

const LATE_GRACE_MINUTES = 10; // shift start ke baad kitni der tak grace (gray/red boundary for IN)
const EARLY_ARRIVAL_MINUTES = 10; // shift start se kitna pehle aana "early/blue" maana jaayega
const OUT_GRACE_MINUTES = 10; // shift end ke baad kitni der tak "on-time" (green), uske baad "extended" (blue)

function processRecords(
  records: ApiAttendanceRecord[],
  monthNum: number,
  yearNum: number,
  daysInMonth: number,
): ProcessedEmployee[] {
  const byEmployee = new Map<number, ApiAttendanceRecord[]>();

  let maxDataDay = 0;

  for (const r of records) {
    if (!r.attendance_date) {
      if (!byEmployee.has(r.employee_id)) {
        byEmployee.set(r.employee_id, [r]);
      }
      continue;
    }

    const { year, month, day } = toISTParts(r.attendance_date);

    if (year !== yearNum || month !== monthNum) continue;

    if (day > maxDataDay) {
      maxDataDay = day;
    }

    const list = byEmployee.get(r.employee_id) ?? [];
    list.push(r);
    byEmployee.set(r.employee_id, list);
  }

  const employees: ProcessedEmployee[] = [];
  let colorIdx = 0;

  for (const [employeeId, recs] of byEmployee.entries()) {
    const byDay = new Map<number, ApiAttendanceRecord>();
    for (const r of recs) {
      if (!r.attendance_date) continue;
      const { day } = toISTParts(r.attendance_date);
      byDay.set(day, r);
    }

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let extraWorkCount = 0;
    let compOffCount = 0;
    let leaveCount = 0;
    let totalWorkMinutes = 0;
    let totalOTMinutes = 0;
    let totalShortMinutes = 0;

    const days: DayCell[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;

      if (maxDataDay > 0 && day > maxDataDay) {
        return { day, ...EMPTY_DAY_CELL_BASE };
      }

      const rec = byDay.get(day);

      if (!rec || !rec.attendance_date) {
        return { day, ...EMPTY_DAY_CELL_BASE };
      }
      const code =
        STATUS_TO_CODE[rec.status] ??
        rec.status?.slice(0, 3).toUpperCase() ??
        "-";

      if (rec.status === "Present") presentCount += 1;
      if (rec.status === "Absent") absentCount += 1;
      if (rec.status === "Half Day") halfDayCount += 1;
      if (rec.status === "Extra Work") extraWorkCount += 1;
      if (rec.status === "Comp Off" || rec.status === "CompOff")
        compOffCount += 1;
      if (rec.status === "Leave") leaveCount += 1;

      const inMin = timeToMinutes(rec.punch_in);
      const outMin = timeToMinutes(rec.punch_out);

      const isZeroTime = (t: string | null | undefined) =>
        !t || t.slice(0, 5) === "00:00";

      let wh = "-";
      let ot = "-";

      if (!isZeroTime(rec.worked_time)) {
        wh = (rec.worked_time as string).slice(0, 5);
      } else if (
        typeof rec.worked_minutes === "number" &&
        rec.worked_minutes > 0
      ) {
        wh = minutesToHHMM(rec.worked_minutes);
      }

      if (typeof rec.worked_minutes === "number") {
        totalWorkMinutes += rec.worked_minutes;
      }

      if (!isZeroTime(rec.overtime_time)) {
        ot = (rec.overtime_time as string).slice(0, 5);
        const parsedOTMin = timeToMinutes(ot);
        if (parsedOTMin) totalOTMinutes += parsedOTMin;
      } else if (
        typeof rec.overtime_minutes === "number" &&
        rec.overtime_minutes > 0
      ) {
        ot = minutesToHHMM(rec.overtime_minutes);
        totalOTMinutes += rec.overtime_minutes;
      }

      // is_late field ko primary source maanenge, agar wo undefined/missing ho
      // to late_minutes > 0 ko fallback ke roop me use karenge
      const isLateRecord =
        typeof rec.is_late === "boolean"
          ? rec.is_late
          : (rec.late_minutes ?? 0) > 0;

      if (rec.status === "Present" && isLateRecord) {
        lateCount += 1;
      }

      // ------------------------------------------------
      // NEW: IN / OUT cell red highlight logic
      // Us din ka FROZEN shift (stored_shift_timing) use karo,
      // warna current/live shift pe fallback karo.
      // ------------------------------------------------
      const shiftForCellCheck = rec.stored_shift_timing || rec.shift_timing;
      const { startMinutes: shiftStartMin, endMinutes: shiftEndMin } =
        parseShiftRange(shiftForCellCheck);

      // IN: 3 states
      // - shift start se EARLY_ARRIVAL_MINUTES (10) min ya usse zyada PEHLE -> GREEN
      // - us window (start-10) se lekar grace (start+10) tak -> BLUE
      // - grace (start+10) se zyada baad -> RED
      const isEarlyIn =
        rec.status === "Present" &&
        shiftStartMin != null &&
        inMin != null &&
        inMin < shiftStartMin - EARLY_ARRIVAL_MINUTES;

      const isLateIn =
        rec.status === "Present" &&
        shiftStartMin != null &&
        inMin != null &&
        inMin > shiftStartMin + LATE_GRACE_MINUTES;

      const isOnTimeIn =
        rec.status === "Present" &&
        shiftStartMin != null &&
        inMin != null &&
        !isEarlyIn &&
        !isLateIn;

      // OUT: 3 states
      // - shift end se PEHLE gaya -> RED
      // - shift end se OUT_GRACE_MINUTES (10) ke andar gaya -> GREEN
      // - shift end se OUT_GRACE_MINUTES se ZYADA baad gaya -> BLUE
      const isEarlyOut =
        rec.status === "Present" &&
        shiftEndMin != null &&
        outMin != null &&
        outMin < shiftEndMin;

      const isExtendedOut =
        rec.status === "Present" &&
        shiftEndMin != null &&
        outMin != null &&
        outMin > shiftEndMin + OUT_GRACE_MINUTES;

      const isOnTimeOut =
        rec.status === "Present" &&
        shiftEndMin != null &&
        outMin != null &&
        !isEarlyOut &&
        !isExtendedOut;

      let f = "-";

      if (!isZeroTime(rec.short_time)) {
        f = (rec.short_time as string).slice(0, 5);
        const parsedShortMin = timeToMinutes(f);
        if (parsedShortMin) totalShortMinutes += parsedShortMin;
      } else if (
        typeof rec.short_minutes === "number" &&
        rec.short_minutes > 0
      ) {
        f = minutesToHHMM(rec.short_minutes);
        totalShortMinutes += rec.short_minutes;
      }

      return {
        day,
        code,
        in: hhmmss(rec.punch_in) ?? "-",
        out: hhmmss(rec.punch_out) ?? "-",
        wh,
        ot,
        f,
        isEarlyIn,
        isLateIn,
        isOnTimeIn,
        isEarlyOut,
        isOnTimeOut,
        isExtendedOut,
        note: rec.early_exit_reason?.trim() || null,
      };
    });

    const firstRec = recs[0];

    employees.push({
      id: employeeId,
      name: (firstRec.full_name || "").replace(/\s+/g, " ").trim(),
      departmentId: firstRec.department_id,
      branchOfficeId: firstRec.branchOffice_id,
      avatarColor: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
      days,
      totalHours: minutesToHHMM(totalWorkMinutes),
      totalPresent: presentCount,
      totalAbsent: absentCount,
      totalLate: lateCount,
      totalHalfDay: halfDayCount,
      extraWork: extraWorkCount,
      compOff: compOffCount,
      leave: leaveCount,
      totalOT: minutesToHHMM(totalOTMinutes),
      totalShort: minutesToHHMM(totalShortMinutes),
    });
    colorIdx += 1;
  }

  return employees.sort((a, b) => a.name.localeCompare(b.name));
}

const Monthlyattendancetable = () => {
  const dispatch = useAppDispatch();

  const { monthlyList, loading } = useAppSelector(
    (state: RootState) => state.attendance,
  );
  console.log("monthlyList-----", monthlyList);

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    ALL_MONTHS[new Date().getMonth()],
  );

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const monthNum = MONTH_MAP[selectedMonth];
  const yearNum = Number(selectedYear);

  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    dispatch(
      fetchMonthlyAttendance({
        month: `${yearNum}-${pad(monthNum)}`,
      } as any),
    );
  }, [dispatch, monthNum, yearNum]);

  const allEmployees = useMemo(
    () =>
      processRecords(
        (monthlyList ?? []) as unknown as ApiAttendanceRecord[],
        monthNum,
        yearNum,
        daysInMonth,
      ),
    [monthlyList, monthNum, yearNum, daysInMonth],
  );

  const employees = useMemo(() => {
    return allEmployees.filter((emp) => {
      const matchesSearch = emp.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesEmployee =
        employeeFilter === "all" || String(emp.id) === employeeFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        String(emp.departmentId ?? "") === departmentFilter;

      const matchesBranch =
        branchFilter === "all" ||
        String(emp.branchOfficeId ?? "") === branchFilter;

      return (
        matchesSearch && matchesEmployee && matchesDepartment && matchesBranch
      );
    });
  }, [allEmployees, search, employeeFilter, departmentFilter, branchFilter]);

  const weekdayLetterFor = (day: number) =>
    WEEKDAY_LETTERS[new Date(yearNum, monthNum - 1, day).getDay()];

  const isSundayCol = (day: number) =>
    new Date(yearNum, monthNum - 1, day).getDay() === 0;

  return (
    <div className="">
      <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        height: 14px;   /* horizontal scrollbar height/thickness */
        width: 14px;    /* vertical scrollbar width */
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #4b5563; /* dark gray (tailwind gray-600) */
        border-radius: 8px;
        border: 3px solid #f1f1f1;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #374151; /* gray-700 on hover */
      }

      /* Firefox support */
      .custom-scrollbar {
        scrollbar-width: auto;
        scrollbar-color: #4b5563 #f1f1f1;
      }
    `}</style>
      {/* HEADER (filters) */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-center gap-5 w-full py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-10 justify-center">
            <div className="relative max-w-xs w-full sm:w-[200px]">
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

            <BranchFilter value={branchFilter} onChange={setBranchFilter} />
            <DepartmentFilter
              value={departmentFilter}
              onChange={setDepartmentFilter}
            />
            <EmployeeFilter
              value={employeeFilter}
              onChange={setEmployeeFilter}
            />

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[110px] h-9 text-sm font-medium border-orange-300 text-orange-600 bg-orange-50 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[90px] h-9 text-sm font-medium border-orange-300 text-orange-600 bg-orange-50 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div
        className="custom-scrollbar bg-white rounded-xl mt-2 shadow overflow-auto border border-slate-200"
        style={{ maxHeight: "calc(100vh - 260px)" }}
      >
        {loading && employees.length === 0 ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-16">
            <Loader2 size={16} className="animate-spin" />
            Loading monthly attendance…
          </div>
        ) : (
          <table className="border-collapse text-xs whitespace-nowrap w-full">
            <thead className="sticky top-0 z-40">
              <tr>
                <th className="sticky left-0 top-0 z-50 bg-blue-800 text-white border border-white p-2 min-w-[40px]">
                  #
                </th>
                <th className="sticky left-[40px] top-0 z-50 bg-blue-800 text-white border border-white p-1 w-[62px] min-w-[2px]">
                  Name
                </th>
                <th className="sticky left-[76px] top-0 z-50 bg-emerald-800 text-white border border-white p-1 min-w-[60px]">
                  <div className="flex items-center justify-center gap-1">
                    Days <ChevronDown className="w-3 h-3" />
                  </div>
                </th>

                {daysArray.map((day) => (
                  <th
                    key={day}
                    className={`sticky top-0 z-30 border border-slate-300 text-white p-1 min-w-[46px] text-center ${
                      isSundayCol(day) ? "bg-emerald-900" : "bg-emerald-800"
                    }`}
                  >
                    <div className="text-[11px] leading-tight">
                      {weekdayLetterFor(day)}
                    </div>
                    <div className="leading-tight text-center">
                      <span className="text-[14px] font-bold">{pad(day)}</span>
                      <span className="text-[11px] font-medium">
                        -{pad(monthNum)}
                      </span>
                    </div>
                  </th>
                ))}

                <th className="sticky top-0 z-30 border border-white p-2 bg-orange-700 text-white min-w-[70px]">
                  <span className="font-semibold">Total</span>
                  <br />
                  Hours
                </th>
                <th className="sticky top-0 z-30 border border-white p-2 bg-emerald-900 text-white min-w-[60px]">
                  Present
                </th>
                <th className="sticky top-0 z-30 border border-white p-2 bg-red-800 text-white min-w-[60px]">
                  Absent
                </th>
                <th className="sticky top-0 z-30 border border-white p-2 bg-pink-700 text-white min-w-[70px]">
                  <span className="font-semibold">Late</span>
                  <br />
                  Marks
                </th>

                <th className="sticky top-0 z-30 border border-white p-2 bg-orange-800 text-white min-w-[70px]">
                  <span className="font-semibold">Total</span>
                  <br />
                  Half Day
                </th>
                <th className="sticky top-0 z-30 border border-white p-2 bg-orange-800 text-white min-w-[70px]">
                  <span className="font-semibold">Total</span>
                  <br />
                  extraWork
                </th>
                <th className="sticky top-0 z-30 border border-white p-2 bg-orange-800 text-white min-w-[70px]">
                  <span className="font-semibold">Total</span>
                  <br />
                  compOff
                </th>
                <th className="sticky top-0 z-30 border border-white p-2 bg-orange-800 text-white min-w-[70px]">
                  <span className="font-semibold">Total</span>
                  <br />
                  leave
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={daysInMonth + 8}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No attendance records found for this month.
                  </td>
                </tr>
              )}

              {employees.map((employee, empIndex) => {
                const rowBg = empIndex % 2 === 0 ? "bg-white" : "bg-slate-50";

                return (
                  <React.Fragment key={employee.id}>
                    {ROW_TYPES.map((rowType, rowIdx) => (
                      <tr key={`${employee.id}-${rowType}`} className={rowBg}>
                        {rowIdx === 0 && (
                          <>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className={`sticky left-0 z-10 border font-bold text-center align-middle ${rowBg}`}
                            >
                              {employee.id}
                            </td>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className={`sticky left-[40px] z-10 border w-[50px] min-w-[50px] p-1 text-center align-middle ${rowBg}`}
                            >
                              <div className="flex flex-col items-center justify-center gap-1 py-1.5">
                                <div className="flex flex-col items-center justify-center py-2">
                                  <span
                                    className="text-blue-700 font-semibold text-center leading-4"
                                    title={employee.name}
                                  >
                                    <span className="block text-sm font-bold">
                                      {employee.name.split(" ")[0]}
                                    </span>

                                    <span className="block text-[11px] font-medium">
                                      {employee.name
                                        .split(" ")
                                        .slice(1)
                                        .join(" ")}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </td>
                          </>
                        )}

                        <td
                          className={`sticky left-[76px] z-10 border p-1 font-semibold text-center ${
                            rowType === "OT"
                              ? "bg-green-50"
                              : rowType === "F"
                                ? "bg-red-50 text-red-600"
                                : rowType === "Status"
                                  ? "bg-slate-100"
                                  : "bg-white"
                          }`}
                        >
                          {rowType}
                        </td>

                        {employee.days.map((d) => {
                          if (rowType === "Status") {
                            return (
                              <td
                                key={d.day}
                                className="border text-center p-1"
                              >
                                <div className="group relative">
                                  <Badge
                                    className={`relative rounded-md px-2 py-1 text-[15px] font-extrabold tracking-wide border-none justify-center w-full ${
                                      CODE_STYLE[d.code] ??
                                      "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {d.code}
                                    {d.note && (
                                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
                                    )}
                                  </Badge>

                                  {d.note && (
                                    <div className="pointer-events-none absolute left-1/2 top-full z-[60] mt-1 hidden w-48 -translate-x-1/2 whitespace-normal rounded-md bg-slate-900 px-3 py-2 text-left text-[11px] font-normal leading-snug text-white shadow-lg group-hover:block">
                                      <p className="mb-0.5 font-semibold text-orange-300">
                                        {pad(d.day)}-{pad(monthNum)} Note
                                      </p>
                                      {d.note}
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          }
                          const value =
                            rowType === "IN"
                              ? d.in
                              : rowType === "OUT"
                                ? d.out
                                : rowType === "WH"
                                  ? d.wh
                                  : rowType === "OT"
                                    ? d.ot
                                    : d.f;

                          // IN: early(blue) / on-time-window(gray) / grace ke baad(red)
                          // OUT: shift end se pehle(red) / grace ke andar(green) / grace se zyada baad(blue)
                          let cellClass = "text-slate-700";

                          if (rowType === "F") {
                            cellClass = "text-red-600 font-semibold bg-red-50";
                          } else if (rowType === "OT") {
                            cellClass = "text-green-700 bg-green-50";
                          } else if (rowType === "IN") {
                            if (d.isLateIn) {
                              cellClass = "text-red-600 font-bold bg-red-50";
                            } else if (d.isOnTimeIn) {
                              cellClass =
                                "text-gray-700 font-semibold bg-gray-100";
                            } else if (d.isEarlyIn) {
                              cellClass =
                                "text-blue-700 font-semibold bg-blue-50";
                            }
                          } else if (rowType === "OUT") {
                            if (d.isEarlyOut) {
                              cellClass = "text-red-600 font-bold bg-red-50";
                            } else if (d.isExtendedOut) {
                              cellClass =
                                "text-blue-700 font-semibold bg-blue-50";
                            } else if (d.isOnTimeOut) {
                              cellClass =
                                "text-gray-700 font-semibold bg-gray-100";
                            }
                          }

                          return (
                            <td
                              key={d.day}
                              className={`border text-center ${cellClass}`}
                            >
                              {value || "-"}
                            </td>
                          );
                        })}

                        {(() => {
                          if (rowType === "OT") {
                            return (
                              <td className="border text-center font-bold bg-green-50 text-green-700">
                                {employee.totalOT}
                              </td>
                            );
                          }
                          if (rowType === "F") {
                            return (
                              <td className="border text-center font-bold bg-red-50 text-red-700">
                                {employee.totalShort}
                              </td>
                            );
                          }
                          if (rowType === "Status") {
                            return (
                              <td
                                rowSpan={4}
                                className="border text-center align-middle font-bold bg-orange-50 text-orange-800"
                              >
                                {employee.totalHours}
                              </td>
                            );
                          }
                          return null;
                        })()}

                        {rowIdx === 0 && (
                          <>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold bg-emerald-50 text-emerald-800"
                            >
                              {employee.totalPresent}
                            </td>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold bg-red-50 text-red-700"
                            >
                              {employee.totalAbsent}
                            </td>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold text-pink-700 bg-pink-50"
                            >
                              {employee.totalLate}
                            </td>

                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold text-orange-800 bg-orange-50"
                            >
                              {employee.totalHalfDay}
                            </td>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold text-pink-700 bg-pink-50"
                            >
                              {employee.extraWork}
                            </td>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold text-pink-700 bg-pink-50"
                            >
                              {employee.compOff}
                            </td>
                            <td
                              rowSpan={ROW_TYPES.length}
                              className="border text-center align-middle font-bold text-pink-700 bg-pink-50"
                            >
                              {employee.leave}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Monthlyattendancetable;
