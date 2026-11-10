import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchShiftAssignments,
  createShiftAssignmentThunk,
  updateShiftAssignmentThunk,
  deleteShiftAssignmentThunk,
  clearShiftAssignmentError,
} from "@/redux/features/Shiftassignment/shiftassignmentSlice";

import { RootState } from "@/redux/store";
import { fetchEmployeeListThunk } from "@/redux/features/userSlice";
import EmployeeFilter from "../FilterComponent/EmployeeFilter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmployeeOption = { id: number; full_name: string };

type FormState = {
  id: number | null;
  employeeId: string;
  fromDate: string;
  toDate: string;
  shiftType: string;
  shiftTiming: string;
  weekOff: string;
  reason: string;
  isActive: boolean;
};

const SHIFT_TYPES = ["Temporary"];

const WEEK_DAYS = [
  { label: "Keep Existing", value: "KEEP_EXISTING" },
  { label: "Sunday", value: "Sunday" },
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
];

const EMPTY_FORM: FormState = {
  id: null,
  employeeId: "",
  fromDate: "",
  toDate: "",
  shiftType: "Temporary",
  shiftTiming: "",
  weekOff: "", // default blank
  reason: "",
  isActive: true,
};

function formatDateLabel(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ShiftAssignment({
  employees = [],
}: {
  employees?: EmployeeOption[];
}) {
  const dispatch = useAppDispatch();
  const {
    list: rows,
    loading,
    error,
  } = useAppSelector((state: RootState) => state.shiftAssignment);
  const { employeeList } = useAppSelector((state: RootState) => state.user);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = form.id !== null;

  useEffect(() => {
    dispatch(
      fetchShiftAssignments(
        statusFilter !== "all" ? { isActive: statusFilter } : undefined,
      ),
    );
  }, [dispatch, statusFilter]);

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase();
    return rows.filter((r) => {
      const name = (r.employee_name ?? r.full_name ?? "").toLowerCase();
      const type = (r.shift_type ?? "").toLowerCase();

      const matchesSearch = name.includes(keyword) || type.includes(keyword);

      const matchesEmployee =
        employeeFilter === "all" ||
        String(r.employee_id ?? "") === employeeFilter;

      return matchesSearch && matchesEmployee;
    });
  }, [rows, search, employeeFilter]);

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (row: ShiftAssignmentRecord) => {
    setForm({
      id: row.id,
      employeeId: String(row.employee_id),
      fromDate: row.from_date?.slice(0, 10) ?? "",
      toDate: row.to_date?.slice(0, 10) ?? "",
      shiftType: "Temporary",
      shiftTiming: row.shift_timing ?? "",
      weekOff: row.week_off ?? "",
      reason: row.reason ?? "",
      isActive: !!row.is_active,
    });

    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
  };

  const validateForm = (): string | null => {
    if (!form.employeeId) return "Please select an employee.";
    if (!form.fromDate) return "From date is required.";
    if (!form.toDate) return "To date is required.";
    if (form.toDate < form.fromDate)
      return "To date cannot be earlier than from date.";
    if (!form.shiftType) return "Please select a shift type.";
    if (!form.shiftTiming.trim()) return "Shift timing is required.";
    return null;
  };

  const submitForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      employeeId: Number(form.employeeId),
      fromDate: form.fromDate,
      toDate: form.toDate,
      shiftType: form.shiftType,
      shiftTiming: form.shiftTiming.trim() || null,
      weekOff: form.weekOff === "KEEP_EXISTING" ? null : form.weekOff,
      reason: form.reason.trim() || null,
      isActive: (form.isActive ? 1 : 0) as 0 | 1,
    };

    try {
      if (isEditing && form.id !== null) {
        await dispatch(
          updateShiftAssignmentThunk({ id: form.id, payload }),
        ).unwrap();
      } else {
        await dispatch(createShiftAssignmentThunk(payload)).unwrap();
      }

      setFormOpen(false);
      dispatch(
        fetchShiftAssignments(
          statusFilter !== "all" ? { isActive: statusFilter } : undefined,
        ),
      );
    } catch (err: any) {
      setFormError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to save shift assignment",
      );
    } finally {
      setSaving(false);
    }
  };

  const dismissError = () => dispatch(clearShiftAssignmentError());

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        {/* Left Side */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee or shift type…"
              className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <EmployeeFilter value={employeeFilter} onChange={setEmployeeFilter} />
        </div>

        {/* Right Side */}
        <Button
          className="gap-2 text-white border-none hover:opacity-90"
          style={{ background: "#16A34A" }}
          onClick={openCreateForm}
        >
          <Plus size={16} />
          New Assignment
        </Button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border-2 bg-card overflow-hidden"
        style={{ borderColor: "#BBF7D0" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#166534" }}>
                {[
                  "Employee",
                  "From",
                  "To",
                  "Shift Type",
                  "Timing",
                  "Week Off",
                  "Reason",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-white uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      Loading shift assignments…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No shift assignments found.
                  </td>
                </tr>
              )}

              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">
                    {row.full_name ||
                      row.employee_name ||
                      `#${row.employee_id ?? "-"}`}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.from_date ? formatDateLabel(row.from_date) : "-"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.to_date ? formatDateLabel(row.to_date) : "-"}
                  </td>

                  <td className="px-4 py-3">{row.shift_type || "-"}</td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.shift_timing || "-"}
                  </td>

                  <td className="px-4 py-3">{row.week_off || "-"}</td>

                  {/* Reason Column */}
                  <td className="px-4 py-3">{row.reason?.trim() || "-"}</td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={
                        Number(row.is_active) === 1
                          ? {
                              background: "hsl(var(--success) / 50)",
                              color: "#FFFFFF",
                            }
                          : {
                              background: "#EF4444", // Red background
                              color: "#FFFFFF", // White text
                            }
                      }
                    >
                      {Number(row.is_active) === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => openEditForm(row)}
                      >
                        <Pencil size={13} />
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <X className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div
            className="h-20 w-full relative"
            style={{ background: "#16A34A" }}
          >
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-white border-2 border-border shadow-lg flex items-center justify-center">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "#DCFCE7" }}
              >
                <CalendarClock size={22} style={{ color: "#16A34A" }} />
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-center text-xl font-bold">
                {isEditing ? "Edit Shift Assignment" : "New Shift Assignment"}
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-muted-foreground">
                {isEditing
                  ? "Update the schedule for this employee."
                  : "Assign a shift schedule to an employee."}
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

            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select
                value={form.employeeId}
                onValueChange={(v) => setForm((f) => ({ ...f, employeeId: v }))}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeList.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From Date</Label>
                <Input
                  type="date"
                  className="h-10 rounded-xl"
                  value={form.fromDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fromDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>To Date</Label>
                <Input
                  type="date"
                  className="h-10 rounded-xl"
                  value={form.toDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, toDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Shift Type</Label>
                <Input
                  value="Temporary"
                  disabled
                  className="h-10 rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Week Off</Label>

                <Select
                  value={form.weekOff}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      weekOff: v,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Keep Existing" />
                  </SelectTrigger>

                  <SelectContent>
                    {WEEK_DAYS.map((day) => (
                      <SelectItem key={day.label} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Shift Timing</Label>
              <Input
                placeholder="e.g. 09:00 AM - 06:00 PM"
                className="h-10 rounded-xl"
                value={form.shiftTiming}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shiftTiming: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Reason for this shift change or assignment"
                className="rounded-xl min-h-[72px]"
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive assignments are kept for history but won't apply.
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
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl gap-2 text-white border-none"
                style={{ background: "#16A34A" }}
                onClick={submitForm}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Modal */}
    </div>
  );
}
