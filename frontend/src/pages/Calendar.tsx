import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import { RootState } from "@/redux/store";
import {
  fetchHolidays,
  createHolidayThunk,
  updateHolidayThunk,
  deleteHolidayThunk,
} from "@/redux/features/Calendar/calendarSlice";
import HolidayManager from "@/components/Callender/Holidaymanager";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const normalizeDateKey = (dateStr: string) => {
  const match = dateStr?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : dateStr;
};

const buildMonthGrid = (monthDate: Date): (Date | null)[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export default function AttendanceCalendar() {
  const dispatch = useAppDispatch();

  const branches = useAppSelector((s: RootState) => s.branch.branches) ?? [];
  console.log("------branches----------", branches);
  const {
    list: holidays,
    loading: holidaysLoading,
    creating,
  } = useAppSelector((s: RootState) => s.holiday);

  const today = new Date();
  const currentYear = today.getFullYear();
  const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

  const [activeTab, setActiveTab] = useState("calendar");
  const [branch, setBranch] = useState<string>("");
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // Default to the first available branch once branches have loaded.
  useEffect(() => {
    if (!branch && branches.length > 0) {
      setBranch(String(branches[0].id));
    }
  }, [branches, branch]);

  const branchLabel =
    branches.find((b: any) => String(b.id) === branch)?.branch_name ??
    branches.find((b: any) => String(b.id) === branch)?.name ??
    "Branch";

  // Fetch holidays whenever branch or the calendar's visible year changes.
  useEffect(() => {
    if (!branch) return;
    dispatch(
      fetchHolidays({ branchId: branch, year: calendarMonth.getFullYear() }),
    );
  }, [dispatch, branch, calendarMonth]);

  const branchHolidays = useMemo(
    () => holidays.filter((h) => String(h.branch_id) === branch),
    [holidays, branch],
  );

  const holidayMap = useMemo(() => {
    const m = new Map<string, string>();
    branchHolidays.forEach((h) => m.set(normalizeDateKey(h.date), h.name));
    return m;
  }, [branchHolidays]);

  const secondMonth = useMemo(
    () =>
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
    [calendarMonth],
  );
  const visibleMonths = [calendarMonth, secondMonth];

  const goPrevMonth = () =>
    setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleBranchChange = (b: string) => {
    setBranch(b);
  };

  const handleAddHoliday = async (data: {
    branchId: string;
    date: string;
    name: string;
  }) => {
    try {
      await dispatch(
        createHolidayThunk({
          branchId: data.branchId,
          date: data.date,
          name: data.name,
        }),
      ).unwrap();

      // Refresh the list for whichever branch/year is currently active.
      dispatch(
        fetchHolidays({ branchId: branch, year: calendarMonth.getFullYear() }),
      );
    } catch (err) {
      console.error("Failed to add holiday:", err);
    }
  };

  const handleEditHoliday = async (data: {
    id: string;
    branchId: string;
    date: string;
    name: string;
  }) => {
    try {
      await dispatch(
        updateHolidayThunk({
          id: data.id,
          branchId: data.branchId,
          date: data.date,
          name: data.name,
        }),
      ).unwrap();

      // Refresh the list for whichever branch/year is currently active.
      dispatch(
        fetchHolidays({ branchId: branch, year: calendarMonth.getFullYear() }),
      );
    } catch (err) {
      console.error("Failed to update holiday:", err);
    }
  };

  const handleRemoveHoliday = (id: string) => {
    dispatch(deleteHolidayThunk(id));
  };

  const renderMonth = (monthDate: Date) => {
    const grid = buildMonthGrid(monthDate);
    const label = monthDate.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    return (
      <div key={toKey(monthDate)} className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-2 text-center">
          {label}
        </h4>

        {/* Weekday header */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center text-xs font-semibold text-muted-foreground py-2"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((date, idx) => {
            if (!date) return <div key={idx} className="h-18 sm:h-20" />;

            const key = toKey(date);
            const holidayName = holidayMap.get(key);
            const isToday = toKey(date) === toKey(today);

            // Background priority: Holiday > Normal
            let bg = "transparent";
            if (holidayName) {
              bg = "#FFEDD5"; // light orange tint — company holiday
            }

            // Border color priority: Today > Holiday > Normal
            let borderColor = "#86efac"; // light green — normal working day
            if (holidayName) borderColor = "#f97316"; // orange — company holiday
            if (isToday) borderColor = "#15803d"; // dark green — current day

            return (
              <div
                key={idx}
                title={holidayName || undefined}
                className="h-12 sm:h-20 rounded-md border flex flex-col items-center justify-center gap-0.5 relative shadow-sm hover:shadow transition-shadow"
                style={{ background: bg, borderColor }}
              >
                <span className="text-[11px] sm:text-xs font-medium">
                  {date.getDate()}
                </span>
                {holidayName && (
                  <span className="text-[12px] leading-tight text-muted-foreground text-center px-0.5 truncate w-full">
                    {holidayName}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Attendance Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Branch holidays & working-day overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Branch filter */}
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-muted-foreground" />
              <BranchFilter
                value={branch}
                onChange={handleBranchChange}
                includeAllOption={false}
                placeholder="Select branch"
                className="w-[160px] h-9 text-sm"
              />
            </div>

            <TabsList className="bg-muted/40">
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarDays size={14} />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="holidays" className="gap-1.5">
                <ListChecks size={14} />
                Holidays
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ---------------- Calendar Tab ---------------- */}
        <TabsContent value="calendar" className="space-y-6 mt-6">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm border-2"
                style={{ borderColor: "#15803d" }}
              />
              Today
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm border-2"
                style={{ borderColor: "#f97316", background: "#FFEDD5" }}
              />
              {branchLabel} Holiday
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm border-2"
                style={{ borderColor: "#86efac" }}
              />
              Working Day
            </div>
          </div>

          {/* Calendar card - two months side by side */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goPrevMonth}
              >
                <ChevronLeft size={16} />
              </Button>
              <h3 className="text-sm font-semibold text-foreground">
                {visibleMonths[0].toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                –{" "}
                {visibleMonths[1].toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {branchLabel} Branch
                </span>
              </h3>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goNextMonth}
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            {/* Two months side by side (stacks on small screens) */}
            <div className="flex flex-col md:flex-row gap-6">
              {visibleMonths.map((m) => renderMonth(m))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6 mt-6">
          <HolidayManager
            branch={branch}
            branchLabel={branchLabel}
            holidays={branchHolidays}
            loading={holidaysLoading}
            creating={creating}
            yearOptions={YEAR_OPTIONS}
            onAddHoliday={handleAddHoliday}
            onEditHoliday={handleEditHoliday}
            onRemoveHoliday={handleRemoveHoliday}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
