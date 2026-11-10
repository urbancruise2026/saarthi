import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  fetchDutyRosters,
  createDutyRosterThunk,
  updateDutyRosterThunk,
  deleteDutyRosterThunk,
  clearDutyRosterError,
  fetchDutyRosterEmployees, // ADD
  DutyRosterRecord,
} from "@/redux/features/Dutyroster/Dutyrosterslice";
import { fetchHolidays } from "@/redux/features/Calendar/calendarSlice";

import { RootState } from "@/redux/store";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import DepartmentFilter from "@/components/FilterComponent/DepartmentFilter";

import DutyRosterForm, {
  EMPTY_FORM,
  FormState,
  formatDateLabel,
  toDateInputValue,
} from "../addFromModels/Dutyrosterform";

export default function DutyRoster() {
  const dispatch = useAppDispatch();
  const {
    list: rows,
    loading,
    error,
    employees,
    employeesLoading,
  } = useAppSelector((state: RootState) => state.dutyRoster);
  const { list: holidays } = useAppSelector((s: RootState) => s.holiday);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DutyRosterRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const isEditing = form.id !== null;

  useEffect(() => {
    dispatch(
      fetchDutyRosters(
        activeFilter !== "all" ? { isActive: activeFilter } : undefined,
      ),
    );
  }, [dispatch, activeFilter]);

  useEffect(() => {
    if (!form.branchId) return;
    const year = form.dutyDate
      ? new Date(form.dutyDate).getFullYear()
      : new Date().getFullYear();
    if (Number.isNaN(year)) return;
    dispatch(fetchHolidays({ branchId: form.branchId, year }));
  }, [dispatch, form.branchId, form.dutyDate]);

  useEffect(() => {
    if (!formOpen) return;

    if (!form.branchId || !form.departmentId) return;

    dispatch(
      fetchDutyRosterEmployees({
        branchId: form.branchId,
        departmentId: form.departmentId,
      }),
    );
  }, [dispatch, formOpen, form.branchId, form.departmentId]);

  const branchHolidays = useMemo(() => {
    if (!form.branchId) return [];
    return holidays.filter((h) => String(h.branch_id) === form.branchId);
  }, [holidays, form.branchId]);

  const matchedHoliday = useMemo(() => {
    if (!form.branchId || !form.dutyDate) return null;
    return (
      branchHolidays.find((h) => toDateInputValue(h.date) === form.dutyDate) ??
      null
    );
  }, [branchHolidays, form.dutyDate]);

  const handleSelectHoliday = (holidayId: string) => {
    const holiday = branchHolidays.find((h) => String(h.id) === holidayId);
    if (holiday?.date) {
      setForm((f) => ({ ...f, dutyDate: toDateInputValue(holiday.date) }));
    }
  };

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase();
    return rows.filter((r) => {
      const anyRow = r as any;
      const name = (r.employee_name ?? r.full_name ?? "").toLowerCase();
      const department = (anyRow.department_name ?? "").toLowerCase();

      const matchesSearch =
        name.includes(keyword) ||
        department.includes(keyword) ||
        (r.duty_type ?? "").toLowerCase().includes(keyword);

      const matchesBranch =
        branchFilter === "all" ||
        String(anyRow.branch_id ?? "") === branchFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        String(anyRow.department_id ?? "") === departmentFilter;

      const matchesEmployee =
        employeeFilter === "all" ||
        String(r.employee_id ?? "") === employeeFilter;

      const matchesDate =
        !dateFilter || r.duty_date?.slice(0, 10) === dateFilter;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesDepartment &&
        matchesEmployee &&
        matchesDate
      );
    });
  }, [
    rows,
    search,
    branchFilter,
    departmentFilter,
    employeeFilter,
    dateFilter,
  ]);

  const groupedByDepartment = useMemo(() => {
    const groups: Record<string, DutyRosterRecord[]> = {};
    filteredRows.forEach((row) => {
      const anyRow = row as any;
      const deptName = anyRow.department_name || "Unassigned";
      if (!groups[deptName]) groups[deptName] = [];
      groups[deptName].push(row);
    });
    return groups;
  }, [filteredRows]);

  // Finds the holiday (if any) matching a given row's branch + duty date, so
  // each card can show a holiday badge when the duty date falls on one.
  const getHolidayForRow = (row: DutyRosterRecord) => {
    const anyRow = row as any;
    if (!row.duty_date || !anyRow.branch_id) return null;
    const dutyDateValue = toDateInputValue(row.duty_date);
    return (
      holidays.find(
        (h) =>
          String(h.branch_id) === String(anyRow.branch_id) &&
          toDateInputValue(h.date) === dutyDateValue,
      ) ?? null
    );
  };

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (row: DutyRosterRecord) => {
    const anyRow = row as any;
    const dutyDate = toDateInputValue(row.duty_date);
    const branchId = String(anyRow.branch_id ?? "");
    const departmentId = String(anyRow.department_id ?? "");

    const matched = holidays.find(
      (h) =>
        String(h.branch_id) === branchId &&
        toDateInputValue(h.date) === dutyDate,
    );

    // Edit mode is single-entry: only fields defined on FormState are used.
    setForm({
      id: row.id,
      branchId,
      departmentId,
      employeeId: String(row.employee_id),
      dutyDate,
      holidayId: matched ? String(matched.id) : "",
      status: anyRow.status ?? "",
      isActive: Number(row.is_active) === 1,
      presentEmployeeIds: [],
    });

    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
  };

  // Bulk-create mode uses departmentId + presentEmployeeIds instead of a
  // single employeeId, so validation must branch on isEditing.
  const validateForm = (): string | null => {
    if (!form.branchId) return "Please select a branch.";
    if (!form.dutyDate) return "Duty date is required.";

    if (isEditing) {
      if (!form.employeeId) return "Please select an employee.";
      if (!form.status) return "Please select present or absent.";
    } else {
      if (!form.departmentId) return "Please select a department.";
      if (!employees || employees.length === 0) {
        return "No employees found for this department.";
      }
    }

    return null;
  };

  const refetchList = () =>
    dispatch(
      fetchDutyRosters(
        activeFilter !== "all" ? { isActive: activeFilter } : undefined,
      ),
    );

  const submitForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (isEditing && form.id !== null) {
        const payload = {
          branchId: Number(form.branchId),
          employeeId: Number(form.employeeId),
          dutyDate: form.dutyDate,
          status: form.status,
          isActive: form.isActive ? 1 : 0,
        };

        await dispatch(
          updateDutyRosterThunk({ id: form.id, payload }),
        ).unwrap();
      } else {
        // Bulk create: one entry per department employee — Present if
        // picked in the form, Absent otherwise (everyone else is absent).
        // Sent as a single request: { entries: [...] } — backend inserts
        // each as an individual row.
        const presentSet = new Set(form.presentEmployeeIds.map(String));

        const entries = (employees ?? []).map((emp: any) => ({
          branchId: Number(form.branchId),
          employeeId: Number(emp.id),
          dutyDate: form.dutyDate,
          status: presentSet.has(String(emp.id)) ? "Present" : "Absent",
          isActive: form.isActive ? 1 : 0,
        }));

        await dispatch(createDutyRosterThunk(entries)).unwrap();
      }

      setFormOpen(false);
      refetchList();
    } catch (err: any) {
      setFormError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to save duty roster entry",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row: DutyRosterRecord, next: boolean) => {
    const anyRow = row as any;
    setTogglingId(row.id);
    try {
      if (!next) {
        // turning OFF -> deactivate
        await dispatch(deleteDutyRosterThunk({ id: row.id })).unwrap();
      } else {
        // turning ON -> reactivate via full update, keeping existing values
        await dispatch(
          updateDutyRosterThunk({
            id: row.id,
            payload: {
              branchId: Number(anyRow.branch_id),
              employeeId: Number(row.employee_id),
              dutyDate: row.duty_date?.slice(0, 10) ?? "",
              status: anyRow.status ?? "",
              isActive: 1,
            },
          }),
        ).unwrap();
      }
      refetchList();
    } catch {
      // error already captured in redux state via `error`
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteDutyRosterThunk({ id: deleteTarget.id })).unwrap();
      setDeleteTarget(null);
      refetchList();
    } catch {
      // error already captured in redux state via `error`
    } finally {
      setDeleting(false);
    }
  };

  const dismissError = () => dispatch(clearDutyRosterError());

  return (
    <div className="space-y-6">
      {/* Filters — same components/pattern as Attendance.tsx */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <BranchFilter
            value={branchFilter}
            onChange={(value) => {
              setBranchFilter(value);
              setDepartmentFilter("all");
              setEmployeeFilter("all");
            }}
          />

          <DepartmentFilter
            value={departmentFilter}
            onChange={(value) => {
              setDepartmentFilter(value);
              setEmployeeFilter("all");
            }}
          />

          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-[170px]">
            <CalendarDays
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 h-9 rounded-lg border border-input bg-background text-sm"
            />
          </div>

          {dateFilter && (
            <Button
              size="sm"
              variant="secondary"
              className="h-9"
              onClick={() => setDateFilter("")}
            >
              Clear Date
            </Button>
          )}
        </div>

        {/* Right Side */}
        <Button
          className="gap-2 text-white border-none hover:opacity-90 bg-green-700"
          onClick={openCreateForm}
        >
          <Plus size={16} />
          New Duty
        </Button>
      </div>

      {error && (
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium"
          style={{ background: "#FEE2E2", color: "#B91C1C" }}
        >
          <span>{error}</span>
          <button onClick={dismissError} className="ml-3">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Department-wise Cards */}
      <div className="space-y-6">
        {loading && filteredRows.length === 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-10">
            <Loader2 size={16} className="animate-spin" />
            Loading duty roster…
          </div>
        )}

        {!loading && filteredRows.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">
            No duty roster entries found.
          </div>
        )}

        {Object.entries(groupedByDepartment).map(([deptName, deptRows]) => {
          const branchNames = Array.from(
            new Set(
              deptRows.map((row) => (row as any).branch_name).filter(Boolean),
            ),
          );
          const isSingleEmployee = deptRows.length === 1;

          return (
            <div
              key={deptName}
              className="rounded-xl border-2 bg-card overflow-hidden"
              style={{ borderColor: "#BBF7D0" }}
            >
              {/* Department header */}
              <div className="px-4 py-2 flex items-center justify-between gap-3 flex-wrap bg-green-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-md font-semibold text-white uppercase tracking-wide">
                    {deptName}
                  </h3>
                  {branchNames.length > 0 && (
                    <span className="text-md font-medium text-white">
                      · {branchNames.join(", ")}
                    </span>
                  )}
                </div>
                <span className="text-md font-medium text-white">
                  {deptRows.length}{" "}
                  {deptRows.length === 1 ? "Entry" : "Entries"}
                </span>
              </div>

              <div
                className={
                  isSingleEmployee
                    ? "p-4"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4"
                }
              >
                {deptRows.map((row) => {
                  const anyRow = row as any;
                  const isActive = Number(row.is_active) === 1;
                  const holiday = getHolidayForRow(row);

                  return (
                    <div
                      key={row.id}
                      className="rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Employee name + branch */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {row.full_name ||
                              row.employee_name ||
                              `#${row.employee_id ?? "-"}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {anyRow.branch_name || "-"}
                          </p>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={
                            anyRow.status === "Present"
                              ? {
                                  background: "hsl(var(--success) / 0.12)",
                                  color: "hsl(var(--success))",
                                }
                              : {
                                  background: "#FEE2E2",
                                  color: "#B91C1C",
                                }
                          }
                        >
                          {anyRow.status || "-"}
                        </span>
                      </div>

                      {/* Duty date + holiday badge */}
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <CalendarDays
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span>
                          {row.duty_date ? formatDateLabel(row.duty_date) : "-"}
                        </span>
                        {holiday && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: "#FEF3C7", color: "#92400E" }}
                          >
                            {holiday.name || "Holiday"}
                          </span>
                        )}
                      </div>

                      {/* Active toggle + Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isActive}
                            disabled={togglingId === row.id}
                            onCheckedChange={(next) =>
                              handleToggleActive(row, next)
                            }
                          />
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: isActive ? "#16A34A" : "#6B7280",
                            }}
                          >
                            {togglingId === row.id
                              ? "..."
                              : isActive
                                ? "Active"
                                : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2"
                            onClick={() => openEditForm(row)}
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 gap-1 px-2 text-white border-none hover:opacity-90"
                            style={{ background: "#DC2626" }}
                            onClick={() => setDeleteTarget(row)}
                            disabled={!isActive}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal — extracted into its own component */}
      <DutyRosterForm
        open={formOpen}
        onClose={closeForm}
        form={form}
        setForm={setForm}
        onSubmit={submitForm}
        saving={saving}
        formError={formError}
        matchedHoliday={matchedHoliday}
        branchHolidays={branchHolidays}
        onSelectHoliday={handleSelectHoliday}
        isEditing={isEditing}
        departmentEmployees={employees ?? []}
        departmentEmployeesLoading={employeesLoading}
      />

      {/* Deactivate Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background hover:opacity-100 z-10">
            <X className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div
            className="h-20 w-full relative"
            style={{ background: "#DC2626" }}
          >
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-white border-2 border-border shadow-lg flex items-center justify-center">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "#FEE2E2" }}
              >
                <Trash2 size={20} style={{ color: "#DC2626" }} />
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6 space-y-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-center text-xl font-bold">
                Deactivate Duty Entry
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-muted-foreground">
                {deleteTarget && (
                  <>
                    This will mark the duty roster entry for{" "}
                    <span className="font-semibold text-foreground">
                      {deleteTarget.employee_name ??
                        `#${deleteTarget.employee_id}`}
                    </span>{" "}
                    as inactive. You can still view it in history.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl gap-2 text-white border-none"
                style={{ background: "#DC2626" }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Deactivate
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
