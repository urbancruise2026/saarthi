import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEAVE_TYPES, LeaveRequest } from "./Leaveutils";


export interface AssignLeaveFormData {
  employeeName: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

interface AssignLeaveTabProps {
  onAssign: (data: AssignLeaveFormData) => void;
  recentlyAssigned: LeaveRequest[];
}

const EMPTY_FORM: AssignLeaveFormData = {
  employeeName: "",
  department: "",
  leaveType: LEAVE_TYPES[0],
  fromDate: "",
  toDate: "",
  reason: "",
};

const inputClass =
  "w-full h-9 px-3 rounded-lg border border-input bg-background text-sm";

export default function AssignLeaveTab({
  onAssign,
  recentlyAssigned,
}: AssignLeaveTabProps) {
  const [form, setForm] = useState<AssignLeaveFormData>(EMPTY_FORM);

  const updateForm = (field: keyof AssignLeaveFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.employeeName.trim() &&
    form.fromDate &&
    form.toDate &&
    form.toDate >= form.fromDate;

  const handleSubmit = () => {
    if (!isValid) return;
    onAssign(form);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border-2 bg-card p-5 space-y-4"
        style={{ borderColor: "#BFDBFE" }}
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Assign Leave to Employee
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Employee Name
            </label>
            <input
              value={form.employeeName}
              onChange={(e) => updateForm("employeeName", e.target.value)}
              placeholder="e.g. Rahul Mehta"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Department
            </label>
            <input
              value={form.department}
              onChange={(e) => updateForm("department", e.target.value)}
              placeholder="e.g. Operations"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Leave Type
            </label>
            <select
              value={form.leaveType}
              onChange={(e) => updateForm("leaveType", e.target.value)}
              className={inputClass}
            >
              {LEAVE_TYPES.map((lt) => (
                <option key={lt} value={lt}>
                  {lt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              From Date
            </label>
            <input
              type="date"
              value={form.fromDate}
              onChange={(e) => updateForm("fromDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              To Date
            </label>
            <input
              type="date"
              value={form.toDate}
              onChange={(e) => updateForm("toDate", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-medium text-muted-foreground">
              Reason (optional)
            </label>
            <input
              value={form.reason}
              onChange={(e) => updateForm("reason", e.target.value)}
              placeholder="e.g. Approved compensatory off"
              className={inputClass}
            />
          </div>
        </div>

        <Button
          className="gap-2 text-white border-none hover:opacity-90"
          style={{ background: "#2563EB" }}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          <UserPlus size={16} />
          Assign Leave
        </Button>
      </div>

      {recentlyAssigned.length > 0 && (
        <div
          className="rounded-xl border-2 bg-card overflow-hidden"
          style={{ borderColor: "#BFDBFE" }}
        >
          <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
            Recently Assigned
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#1D4ED8" }}>
                  {["Employee", "Leave Type", "From", "To", "Days"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentlyAssigned.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="px-4 py-2.5 font-medium">
                      {r.employeeName}
                    </td>
                    <td className="px-4 py-2.5">{r.leaveType}</td>
                    <td className="px-4 py-2.5">
                      {new Date(r.fromDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      {new Date(r.toDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-2.5">{r.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
