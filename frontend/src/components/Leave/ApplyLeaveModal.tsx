import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEAVE_TYPES } from "./Leaveutils";

const COMP_OFF_TYPE = "Comp Off";
const COMP_OFF_NOTICE_HOURS = 24;

const LEAVE_START_HOUR = 9;

const HOUR_MS = 60 * 60 * 1000;

const getLeaveStart = (date: string) =>
  new Date(`${date}T${String(LEAVE_START_HOUR).padStart(2, "0")}:00:00`);

const getMinCompOffDate = () => {
  const earliest = new Date(Date.now() + COMP_OFF_NOTICE_HOURS * HOUR_MS);

  if (earliest.getHours() >= LEAVE_START_HOUR) {
    earliest.setDate(earliest.getDate() + 1);
  }
  const y = earliest.getFullYear();
  const m = String(earliest.getMonth() + 1).padStart(2, "0");
  const d = String(earliest.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

interface ApplyLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason: string;
  }) => void;
}

const EMPTY_FORM = {
  leaveType: LEAVE_TYPES[0],
  fromDate: "",
  toDate: "",
  reason: "",
};

export default function ApplyLeaveModal({
  open,
  onClose,
  onSubmit,
}: ApplyLeaveModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  if (!open) return null;

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isCompOff = form.leaveType === COMP_OFF_TYPE;

  const compOffError =
    isCompOff &&
    form.fromDate &&
    getLeaveStart(form.fromDate).getTime() - Date.now() <
      COMP_OFF_NOTICE_HOURS * HOUR_MS
      ? `Comp Off must be applied at least ${COMP_OFF_NOTICE_HOURS} hours before the leave starts.`
      : "";

  const isValid =
    form.fromDate &&
    form.toDate &&
    form.toDate >= form.fromDate &&
    !compOffError;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(form);
    setForm(EMPTY_FORM);
  };

  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-input bg-background text-sm";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "#166534" }}>
            Apply Leave
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                From Date
              </label>
              <input
                type="date"
                value={form.fromDate}
                min={isCompOff ? getMinCompOffDate() : undefined}
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
                min={form.fromDate || undefined}
                onChange={(e) => updateForm("toDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {compOffError && (
            <p className="text-xs text-red-600">{compOffError}</p>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Reason
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => updateForm("reason", e.target.value)}
              placeholder="e.g. Family function"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="text-white border-none hover:opacity-90"
            style={{ background: "#16A34A" }}
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
