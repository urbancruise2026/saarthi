import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ClipboardList,
  X,
  Check,
  Loader2,
  Users,
  CheckCircle2,
  Circle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import DepartmentFilter from "@/components/FilterComponent/DepartmentFilter";
import EmployeeFilter from "../FilterComponent/EmployeeFilter";
import { Holiday } from "../Callender/Holidaymanager";

export type DeptEmployee = {
  id: string | number;
  firstName: string;
  lastName?: string;
};

export type FormState = {
  id: number | null;
  branchId: string;
  departmentId: string;
  holidayId: string;
  employeeId: string; // only used in edit (single-entry) mode
  dutyDate: string;
  status: string; // "Present" | "Absent" — only used in edit mode
  isActive: boolean;

  presentEmployeeIds: string[];
};

export const STATUS_OPTIONS = ["Present", "Absent"];

export const EMPTY_FORM: FormState = {
  id: null,
  branchId: "",
  departmentId: "",
  employeeId: "",
  holidayId: "",
  dutyDate: "",
  status: "",
  isActive: true,
  presentEmployeeIds: [],
};

export function formatDateLabel(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toDateInputValue(date?: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function employeeName(e: DeptEmployee) {
  return [e.firstName, e.lastName].filter(Boolean).join(" ");
}

type HolidayRecord = {
  branch_id: number | string;
  date?: string;
  name: string;
} | null;

type DutyRosterFormProps = {
  open: boolean;
  onClose: () => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  onSubmit: () => void;
  saving: boolean;
  formError: string | null;
  matchedHoliday: HolidayRecord;
  branchHolidays: Holiday[];
  onSelectHoliday: (holidayId: string) => void;
  isEditing: boolean;

  departmentEmployees?: DeptEmployee[];
  departmentEmployeesLoading?: boolean;
};

// Holiday / Duty Date select ke jaisa hi plain look — Branch aur Department
// dono filters ko isi class se render karenge taaki sab match ho.
const PLAIN_FILTER_TRIGGER_CLASS =
  "h-10 rounded-xl border border-input bg-background text-foreground shadow-sm";

export default function DutyRosterForm({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  saving,
  formError,
  matchedHoliday,
  branchHolidays,
  onSelectHoliday,
  isEditing,
  departmentEmployees,
  departmentEmployeesLoading,
}: DutyRosterFormProps) {
  const [employeeSearch, setEmployeeSearch] = useState("");

  const employees = useMemo(() => {
    const source = departmentEmployees ?? [];

    if (!employeeSearch.trim()) return source;
    const q = employeeSearch.toLowerCase();
    return source.filter((e) => employeeName(e).toLowerCase().includes(q));
  }, [departmentEmployees, employeeSearch]);

  const presentSet = useMemo(
    () => new Set(form.presentEmployeeIds.map(String)),
    [form.presentEmployeeIds],
  );

  const presentCount = form.presentEmployeeIds.length;
  const absentCount = Math.max(
    (departmentEmployees?.length ?? employees.length) - presentCount,
    0,
  );

  const toggleEmployee = (id: string | number) => {
    const idStr = String(id);
    setForm((f) => {
      const has = f.presentEmployeeIds.includes(idStr);
      return {
        ...f,
        presentEmployeeIds: has
          ? f.presentEmployeeIds.filter((x) => x !== idStr)
          : [...f.presentEmployeeIds, idStr],
      };
    });
  };

  const markAllPresent = () => {
    const allIds = (departmentEmployees ?? employees).map((e) => String(e.id));
    setForm((f) => ({ ...f, presentEmployeeIds: allIds }));
  };

  const markAllAbsent = () => {
    setForm((f) => ({ ...f, presentEmployeeIds: [] }));
  };

  const showBulkPicker = !isEditing;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
          <X className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="h-20 w-full relative" style={{ background: "#9333EA" }}>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-white border-2 border-border shadow-lg flex items-center justify-center">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "#F3E8FF" }}
            >
              <ClipboardList size={22} style={{ color: "#9333EA" }} />
            </div>
          </div>
        </div>

        <div className="pt-12 px-6 pb-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-center text-xl font-bold">
              {isEditing ? "Edit Duty Roster Entry" : "New Duty Roster Entry"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {isEditing
                ? "Update the duty assignment for this employee."
                : "Pick a branch and department, then mark who's present — everyone else is marked absent."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}
            >
              {formError}
            </div>
          )}

          {/* Branch + Department (create mode) / Branch + Employee (edit mode) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <BranchFilter
                className={PLAIN_FILTER_TRIGGER_CLASS}
                value={form.branchId}
                onChange={(v: string) =>
                  setForm((f) => ({
                    ...f,
                    branchId: v,
                    employeeId: "",
                    departmentId: "",
                    holidayId: "",
                    presentEmployeeIds: [],
                  }))
                }
              />
            </div>

            {isEditing ? (
              <div className="space-y-1.5">
                <Label>Employee</Label>

                <EmployeeFilter
                  value={form.employeeId}
                  onChange={(v: string) =>
                    setForm((f) => ({ ...f, employeeId: v }))
                  }
                  branchId={form.branchId}
                  departmentId={form.departmentId}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Department</Label>
                <DepartmentFilter
                  className={PLAIN_FILTER_TRIGGER_CLASS}
                  value={form.departmentId}
                  onChange={(v: string) =>
                    setForm((f) => ({
                      ...f,
                      departmentId: v,
                      presentEmployeeIds: [],
                    }))
                  }
                />
              </div>
            )}
          </div>

          {/* Holiday (auto-fills Duty Date) + Duty Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Holiday</Label>

              <Select
                value={form.holidayId}
                onValueChange={(id) => {
                  setForm((f) => ({ ...f, holidayId: id }));
                  onSelectHoliday(id);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select Holiday" />
                </SelectTrigger>

                <SelectContent>
                  {branchHolidays.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No holidays found for this branch.
                    </div>
                  ) : (
                    branchHolidays.map((holiday) => (
                      <SelectItem key={holiday.id} value={String(holiday.id)}>
                        {holiday.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Duty Date</Label>

              <Input
                type="date"
                value={form.dutyDate}
                className="h-10 rounded-xl"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dutyDate: e.target.value,
                    holidayId: "",
                  }))
                }
              />
            </div>
          </div>

          {/* EDIT MODE: single Present / Absent select, same as before */}
          {isEditing && (
            <div className="space-y-1.5">
              <Label>Attendance Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select present or absent" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* CREATE MODE: department-wise employee list with individual
              present toggles + bulk mark-all actions */}
          {showBulkPicker && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Users size={14} />
                  Employees
                </Label>

                {form.departmentId && (
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#DCFCE7", color: "#14532D" }}
                    >
                      {presentCount} Present
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#FEE2E2", color: "#7F1D1D" }}
                    >
                      {absentCount} Absent
                    </span>
                  </div>
                )}
              </div>

              {!form.departmentId ? (
                <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Select a branch and department to load employees.
                </div>
              ) : departmentEmployeesLoading ? (
                <div className="rounded-xl border p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Loading employees…
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  {/* search + bulk actions */}
                  <div className="flex flex-col sm:flex-row gap-2 p-2.5 border-b bg-muted/30">
                    <div className="relative flex-1">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        placeholder="Search employee…"
                        className="w-full pl-7 pr-3 h-8 rounded-lg border border-input bg-background text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={markAllPresent}
                      >
                        <CheckCircle2 size={13} style={{ color: "#16A34A" }} />
                        Mark All Present
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={markAllAbsent}
                      >
                        <Circle size={13} style={{ color: "#DC2626" }} />
                        Mark All Absent
                      </Button>
                    </div>
                  </div>

                  {/* employee rows */}
                  <div className="max-h-56 overflow-y-auto divide-y">
                    {employees.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No employees found for this department.
                      </div>
                    ) : (
                      employees.map((emp) => {
                        const isPresent = presentSet.has(String(emp.id));
                        return (
                          <button
                            type="button"
                            key={emp.id}
                            onClick={() => toggleEmployee(emp.id)}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                                style={{
                                  background: isPresent ? "#DCFCE7" : "#F3F4F6",
                                  color: isPresent ? "#14532D" : "#6B7280",
                                }}
                              >
                                {emp.firstName?.[0]?.toUpperCase()}
                                {emp.lastName?.[0]?.toUpperCase() ?? ""}
                              </div>
                              <span className="text-sm font-medium">
                                {employeeName(emp)}
                              </span>
                            </div>

                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                              style={
                                isPresent
                                  ? { background: "#DCFCE7", color: "#14532D" }
                                  : { background: "#FEE2E2", color: "#7F1D1D" }
                              }
                            >
                              {isPresent ? "Present" : "Absent"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive entries are kept for history but won't apply.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
          </div>

          <DialogFooter className="flex-row justify-center gap-3 sm:justify-center pt-1">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl gap-2 text-white border-none"
              style={{ background: "#9333EA" }}
              onClick={onSubmit}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isEditing
                ? "Save Changes"
                : `Create (${employees.length || 0} ${
                    employees.length === 1 ? "entry" : "entries"
                  })`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
