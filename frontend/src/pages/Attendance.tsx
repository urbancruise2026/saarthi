import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

import {
  Users,
  Clock,
  CalendarDays,
  ArrowLeft,
  Timer,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchAttendance,
  markEmployeeAttendance,
  updateEmployeeAttendanceStatus,
  AttendanceRecord,
  updateEmployeeEarlyExit,
} from "@/redux/features/Attendance/attendanceSlice";
import { getAttendance } from "@/redux/features/Attendance/attendanceApi";
import ShiftAssignment from "@/components/addFromModels/Shiftassignment";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import DepartmentFilter from "@/components/FilterComponent/DepartmentFilter";
import EmployeeFilter from "@/components/FilterComponent/EmployeeFilter";

import { toast } from "sonner";

// Agar shadcn ka purana useToast hai, to ye alag tarika hai (neeche likha hai)
import {
  ModalState,
  Override,
  toDisplayRow,
  LEAVE_TYPES,
} from "../components/Attendance/Attendanceutils";
import AttendanceStatsCards from "../components/Attendance/Attendancestatscards";
import AttendanceTable from "../components/Attendance/Attendancetable";
import LeaveModal from "../components/Attendance/Leavemodal";

import PunchButton from "@/components/Attendance/Punchbutton";
import { useAccessControl } from "@/utils/Accesscontrol";
import Monthlyattendancetable from "@/components/Attendance/Monthlyattendancetable";
import AttendanceStatusModal from "@/components/Attendance/Halfdaymodal";
import StatusMultiSelect from "@/components/FilterComponent/StatusMultiSelect";

const TAB_CONTENT: Record<string, { title: string; subtitle: string }> = {
  attendance: {
    title: "Attendance Management",
    subtitle: "Attendance tracking & workforce operations",
  },
  weekoff: {
    title: "Monthly Attendance",
    subtitle: "Month-wise attendance sheet & summary",
  },
  shift: {
    title: "Shift Assignment",
    subtitle: "Assign and manage employee shifts",
  },
};

export default function Attendance() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { list, summary, loading, error } = useAppSelector((s) => s.attendance);
  const currentEmployeeId = useAppSelector((s) => s.user.currentEmployee.id);

  const { can } = useAccessControl();
  const canSeeFilters = can("ATTENDANCE_FILTERS");

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [modal, setModal] = useState<ModalState>(null);

  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState("attendance");

  const headerContent = TAB_CONTENT[activeTab] ?? TAB_CONTENT.attendance;

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonthStr = useMemo(() => todayISO.slice(0, 7), [todayISO]);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  const selectedDateLabel = useMemo(
    () =>
      new Date(selectedDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [selectedDate],
  );

  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [employeeMonthRecords, setEmployeeMonthRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [employeeMonthLoading, setEmployeeMonthLoading] = useState(false);
  const [employeeMonthError, setEmployeeMonthError] = useState<string | null>(
    null,
  );
  const myAttendance = useMemo(() => {
    return list.find(
      (item) => Number(item.employee_id) === Number(currentEmployeeId),
    );
  }, [list, currentEmployeeId]);

  // CHANGED: status filter ab client-side hoga (multi-select), isliye API call
  // sirf date pe depend karti hai, statusFilter ko dependency se hata diya
  useEffect(() => {
    if (!selectedEmployee) {
      dispatch(fetchAttendance({ date: selectedDate }));
    }
  }, [dispatch, selectedDate, selectedEmployee]);

  const handleTabChange = (value: string) => {
    if (value === "calendar") {
      navigate("/calendar");
      return;
    }

    setActiveTab(value);

    if (value === "attendance") {
      setSelectedEmployee(null);
      setEmployeeMonthRecords([]);
      setEmployeeMonthError(null);

      dispatch(fetchAttendance({ date: selectedDate }));
    }
  };

  const attendanceData = useMemo(() => {
    return list
      .filter((r) => {
        const fullName = (r.full_name ?? "").toLowerCase();
        const department = (r.department_name ?? "").toLowerCase();
        const keyword = search.toLowerCase();

        const matchesSearch =
          fullName.includes(keyword) || department.includes(keyword);

        const matchesBranch =
          branchFilter === "all" ||
          String(r.branchOffice_id ?? "") === branchFilter;

        const matchesDepartment =
          departmentFilter === "all" ||
          String(r.department_id ?? "") === departmentFilter;

        const matchesEmployee =
          employeeFilter === "all" ||
          String(r.employee_id ?? "") === employeeFilter;

        const matchesStatus =
          statusFilter.length === 0 ||
          statusFilter.includes((r as any).status ?? "");

        return (
          matchesSearch &&
          matchesBranch &&
          matchesDepartment &&
          matchesEmployee &&
          matchesStatus
        );
      })
      .map((r) => toDisplayRow(r, overrides[String(r.employee_id)]));
  }, [
    list,
    search,
    branchFilter,
    departmentFilter,
    employeeFilter,
    statusFilter,
    overrides,
  ]);

  const employeeMonthData = useMemo(() => {
    return employeeMonthRecords
      .slice()
      .sort((a, b) =>
        (b.attendance_date ?? "").localeCompare(a.attendance_date ?? ""),
      )
      .map((r) => toDisplayRow(r));
  }, [employeeMonthRecords]);

  const isDrillDown = !!selectedEmployee;
  const rowsToRender = isDrillDown ? employeeMonthData : attendanceData;

  // CHANGED: ab ye backend se aayi overtime_minutes/short_minutes ka sum hai,
  // frontend pe koi hardcoded expected-minutes (510) calculation nahi ho raha
  const totalOvertimeMinutes = rowsToRender.reduce(
    (total, emp) => total + (emp.overtimeMinutes ?? 0),
    0,
  );

  const totalShortMinutes = rowsToRender.reduce(
    (total, emp) => total + (emp.shortfallMinutes ?? 0),
    0,
  );

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;
    return `${mins}m`;
  };

  const totalOvertime = formatDuration(totalOvertimeMinutes);
  const totalShortTime = formatDuration(totalShortMinutes);

  const openStatusModal = (empId: string, empName: string) => {
    setModal({ type: "status", empId, empName });
  };

  const openLeaveModal = (empId: string, empName: string, current?: string) => {
    setModal({
      type: "leave",
      empId,
      empName,
      leaveType: current || LEAVE_TYPES[0],
    });
  };

  const loadEmployeeMonth = async (empId: string) => {
    setEmployeeMonthLoading(true);
    setEmployeeMonthError(null);
    try {
      const records = await getAttendance({
        employeeId: empId,
        month: currentMonthStr,
      });
      setEmployeeMonthRecords(records?.data ?? []);
    } catch (err: any) {
      setEmployeeMonthError(err?.message || "Failed to load attendance");
    } finally {
      setEmployeeMonthLoading(false);
    }
  };

  const openEmployeeMonth = (empId: string, empName: string) => {
    setSelectedEmployee({ id: empId, name: empName });
    loadEmployeeMonth(empId);
  };

  const backToAllEmployees = () => {
    setSelectedEmployee(null);
    setEmployeeMonthRecords([]);
    setEmployeeMonthError(null);
  };

  const refetchCurrentView = () => {
    if (selectedEmployee) {
      loadEmployeeMonth(selectedEmployee.id);
    } else {
      dispatch(fetchAttendance({ date: selectedDate }));
    }
  };

  const confirmStatusUpdate = async (status: string) => {
    if (!modal || modal.type !== "status") return;
    const empId = modal.empId;

    setOverrides((prev) => ({
      ...prev,
      [empId]: { status },
    }));
    setModal(null);

    try {
      await dispatch(
        updateEmployeeAttendanceStatus({
          employeeId: empId,
          attendanceDate: selectedDate,
          status,
        }),
      ).unwrap();
      refetchCurrentView();
    } catch {
      // request failed — local override still reflects the intended change;
    }
  };

  const confirmLeave = async () => {
    if (!modal || modal.type !== "leave") return;
    const empId = modal.empId;
    const leaveType = modal.leaveType;

    setOverrides((prev) => ({
      ...prev,
      [empId]: { status: "Leave", leaveType },
    }));
    setModal(null);

    try {
      await dispatch(
        markEmployeeAttendance({
          employee_id: Number(empId),
          attendance_date: selectedDate,
          status: "Leave",
          leave_type: leaveType,
        } as any),
      ).unwrap();
      refetchCurrentView();
    } catch {
      // request failed — local override still reflects the intended change;
    }
  };

  const handleSaveNote = async (attendanceId: number, note: string) => {
    try {
      await dispatch(
        updateEmployeeEarlyExit({
          attendanceId,
          earlyExitReason: note,
        }),
      ).unwrap();

      toast.success("Note saved successfully");
      refetchCurrentView(); // drill-down view me bhi nayi value dikhane ke liye
    } catch (err: any) {
      const message =
        typeof err === "string" ? err : err?.message || "Failed to save note";
      toast.error(message);
      throw err; // taaki modal khula rahe aur user dobara try kar sake
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl p-4 border-l-4"
          style={{ background: "#FFF7ED", borderColor: "#F97316" }}
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>
              {headerContent.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#EA580C" }}>
              {headerContent.subtitle}
            </p>
          </div>

          <TabsList className="inline-flex w-fit bg-white border border-orange-200 rounded-xl p-1 gap-1">
            <TabsTrigger
              value="attendance"
              className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Users size={14} />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="weekoff"
              className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Users size={14} />
              Monthly Attendance
            </TabsTrigger>

            {canSeeFilters && (
              <>
                <TabsTrigger
                  value="shift"
                  className="gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Clock size={14} />
                  Shift Assignment
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="gap-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <CalendarDays size={14} />
                  Calendar
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        {/* ---------- Attendance Tab ---------- */}
        <TabsContent value="attendance" className="space-y-6 mt-6">
          {error && !isDrillDown && (
            <div
              className="rounded-lg px-4 py-2.5 text-sm font-medium"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}
            >
              {error}
            </div>
          )}

          {employeeMonthError && isDrillDown && (
            <div
              className="rounded-lg px-4 py-2.5 text-sm font-medium"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}
            >
              {employeeMonthError}
            </div>
          )}

          {isDrillDown && (
            <div
              className="flex items-center justify-between rounded-xl p-4 border-l-4"
              style={{ background: "#F0FDF4", borderColor: "#16A34A" }}
            >
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={backToAllEmployees}
                >
                  <ArrowLeft size={14} />
                  Back
                </Button>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "#166534" }}
                  >
                    {selectedEmployee?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Attendance for {currentMonthStr}
                  </p>
                </div>
              </div>
            </div>
          )}

          <AttendanceStatsCards
            rows={rowsToRender}
            summary={isDrillDown ? undefined : summary}
            isDrillDown={isDrillDown}
            currentMonthStr={currentMonthStr}
            selectedDateLabel={selectedDateLabel}
          />

          {!isDrillDown && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {canSeeFilters && (
                <>
                  <BranchFilter
                    value={branchFilter}
                    onChange={setBranchFilter}
                  />

                  <DepartmentFilter
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                  />

                  <EmployeeFilter
                    value={employeeFilter}
                    onChange={setEmployeeFilter}
                    branchId={branchFilter}
                  />

                  {/* CHANGED: single-select <select> ki jagah checklist-style multi-select */}
                  <StatusMultiSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </>
              )}

              <div className="relative w-full sm:w-[170px]">
                <CalendarDays
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 rounded-lg border border-input bg-background text-sm"
                />
              </div>

              {selectedDate !== todayISO && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9"
                  onClick={() => setSelectedDate(todayISO)}
                >
                  Today
                </Button>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 h-9">
                  <Timer size={16} className="text-rose-600" />
                  <span className="text-sm font-medium text-rose-700">
                    Short Time:
                  </span>
                  <span className="font-bold text-rose-800">
                    {totalShortTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 h-9">
                  <TimerReset size={16} className="text-violet-600" />
                  <span className="text-sm font-medium text-violet-700">
                    Overtime:
                  </span>
                  <span className="font-bold text-violet-800">
                    {totalOvertime}
                  </span>
                </div>
              </div>

              <div className="hidden sm:ml-auto">
                <PunchButton
                  attendanceId={myAttendance?.attendance_id}
                  attendanceDate={selectedDate}
                  isPunchedIn={
                    !!myAttendance?.punch_in && !myAttendance?.punch_out
                  }
                  punchInTime={myAttendance?.punch_in}
                  onSuccess={refetchCurrentView}
                />
              </div>
            </div>
          )}

          <AttendanceTable
            rows={rowsToRender}
            isDrillDown={isDrillDown}
            loading={isDrillDown ? employeeMonthLoading : loading}
            onRowClick={openEmployeeMonth}
            onUpdateStatus={openStatusModal}
            onSaveNote={handleSaveNote}
          />
        </TabsContent>

        <TabsContent value="weekoff" className="mt-6">
          <Monthlyattendancetable />
        </TabsContent>
        <TabsContent value="shift" className="mt-6">
          <ShiftAssignment />
        </TabsContent>
      </Tabs>

      <AttendanceStatusModal
        open={modal?.type === "status"}
        empName={modal?.type === "status" ? modal.empName : ""}
        dateLabel={selectedDateLabel}
        onOpenChange={(open) => !open && setModal(null)}
        onConfirm={confirmStatusUpdate}
      />

      <LeaveModal
        open={modal?.type === "leave"}
        empName={modal?.type === "leave" ? modal.empName : ""}
        leaveType={modal?.type === "leave" ? modal.leaveType : LEAVE_TYPES[0]}
        onOpenChange={(open) => !open && setModal(null)}
        onLeaveTypeChange={(value) =>
          setModal((prev) =>
            prev?.type === "leave" ? { ...prev, leaveType: value } : prev,
          )
        }
        onConfirm={confirmLeave}
      />
    </div>
  );
}
