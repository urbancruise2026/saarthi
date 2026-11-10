import { useState } from "react";
import {
  Loader2,
  ClipboardCheck,
  NotebookPen,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AttendanceStatus,
  DisplayRow,
  STATUS_COLORS,
  formatDuration,
} from "./Attendanceutils";
import { useAccessControl } from "@/utils/Accesscontrol";

interface AttendanceTableProps {
  rows: DisplayRow[];
  isDrillDown: boolean;
  loading: boolean;
  onRowClick: (empId: string, empName: string) => void;
  onUpdateStatus: (empId: string, empName: string) => void;
  onSaveNote: (attendanceId: number, note: string) => Promise<void>;
}

export default function AttendanceTable({
  rows,
  isDrillDown,
  loading,
  onRowClick,
  onUpdateStatus,
  onSaveNote,
}: AttendanceTableProps) {
  const { can } = useAccessControl();
  const canSeeFilters = can("ATTENDANCE_FILTERS");
  const canAddNote = canSeeFilters;

  // ---- Note modal state ----
  const [noteTarget, setNoteTarget] = useState<{
    attendanceId: number;
    name: string;
    date: string | null;
    hasNote: boolean;
  } | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const openNote = (emp: DisplayRow) => {
    if (!emp.attendanceId) return;
    setNoteTarget({
      attendanceId: emp.attendanceId,
      name: emp.fullName,
      date: emp.attendanceDate,
      hasNote: !!emp.earlyExitReason,
    });
    setDraft(emp.earlyExitReason ?? "");
  };

  const closeNote = () => {
    if (saving) return;
    setNoteTarget(null);
    setDraft("");
  };

  const saveNote = async () => {
    if (!noteTarget || !draft.trim()) return;
    try {
      setSaving(true);
      await onSaveNote(noteTarget.attendanceId, draft.trim());
      setSaving(false);
      setNoteTarget(null);
      setDraft("");
    } catch {
      // error toast parent me dikh raha hai, modal khula rehne do
      setSaving(false);
    }
  };

  const columnCount =
    (isDrillDown ? 9 : 8) + (canAddNote ? 1 : 0) + (canSeeFilters ? 1 : 0);

  const headers = [
    "Employee",
    "Department",
    "Branch Office",
    "Shift",
    ...(isDrillDown ? ["Date"] : []),
    "Punch-In",
    "Punch-Out",
    "Working Hrs",
    "Status",
    ...(canAddNote ? ["Note"] : []),
    ...(canSeeFilters ? ["Actions"] : []),
  ];

  return (
    <div
      className="rounded-xl border-2 bg-card"
      style={{ borderColor: "#BBF7D0" }}
    >
      <div className="overflow-auto max-h-[65vh] rounded-xl">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            {isDrillDown ? (
              <>
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                {canAddNote && <col className="w-[14%]" />}
                {canSeeFilters && <col className="w-[9%]" />}
              </>
            ) : (
              <>
                <col className="w-[15%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                {canAddNote && <col className="w-[14%]" />}
                {canSeeFilters && <col className="w-[8%]" />}
              </>
            )}
          </colgroup>
          <thead className="sticky top-0 z-20">
            <tr style={{ background: "#166534" }}>
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={
                    "text-left px-3 py-2 text-xs font-semibold text-white uppercase" +
                    (i === 0 ? " rounded-tl-xl" : "") +
                    (i === headers.length - 1 ? " rounded-tr-xl" : "")
                  }
                  style={{ background: "#166534" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-3 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Loading attendance…
                  </div>
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  {isDrillDown
                    ? "No attendance records found for this month."
                    : "No attendance records found."}
                </td>
              </tr>
            )}

            {rows.map((emp, idx) => {
              const sc = STATUS_COLORS[emp.status as AttendanceStatus] ?? {
                bg: "#F3F4F6",
                color: "#6B7280",
              };
              const hasPunchIn = emp.inTime !== "—";
              const hasPunchOut = emp.outTime !== "—";
              const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";

              const isShort = (emp.shortfallMinutes ?? 0) > 0;

              return (
                <tr
                  key={
                    isDrillDown
                      ? `${emp.id}-${emp.attendanceDate ?? "no-date"}-${idx}`
                      : `${emp.id}-${idx}`
                  }
                  className={
                    "hover:bg-muted/30 transition-colors" +
                    (isDrillDown ? "" : " cursor-pointer")
                  }
                  style={{
                    background: rowBg,
                  }}
                  onClick={
                    isDrillDown
                      ? undefined
                      : () => onRowClick(emp.id, emp.fullName)
                  }
                  title={
                    isDrillDown
                      ? undefined
                      : "Click to view this month's full attendance"
                  }
                >
                  <td
                    className={
                      "px-3 py-2 truncate text-blue-800" +
                      (isDrillDown ? "" : " font-medium hover:underline")
                    }
                  >
                    {emp.fullName}
                  </td>
                  <td className="px-3 py-2 truncate">{emp.department}</td>
                  <td className="px-3 py-2 truncate">{emp.branchName}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">
                        {emp.todayShiftTiming || emp.permanentShiftTiming}
                      </span>

                      {emp.temporaryShiftTiming && (
                        <span className="text-[13px] font-medium text-orange-600">
                          {emp.temporaryShiftTiming}
                        </span>
                      )}

                      {emp.todayShiftTiming &&
                        emp.todayShiftTiming !== emp.permanentShiftTiming &&
                        !emp.temporaryShiftTiming && (
                          <span className="text-[11px] text-muted-foreground">
                            Usual: {emp.permanentShiftTiming}
                          </span>
                        )}
                    </div>
                  </td>

                  {isDrillDown && (
                    <td className="px-3 py-2 truncate">
                      {emp.attendanceDate
                        ? new Date(emp.attendanceDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )
                        : "—"}
                    </td>
                  )}

                  <td className="px-3 py-2">
                    {hasPunchIn ? (
                      <div className="flex flex-col leading-tight">
                        <span
                          className="font-medium"
                          style={{
                            color: emp.isLate
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--success))",
                          }}
                        >
                          {emp.inTime}
                        </span>
                        {emp.isLate && (
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: "hsl(var(--destructive))" }}
                          >
                            {formatDuration(emp.lateMinutes)} late
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {emp.inTime}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {hasPunchOut ? (
                      <div className="flex flex-col leading-tight">
                        <span
                          className="font-medium"
                          style={{
                            color: emp.isEarlyOut
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--success))",
                          }}
                        >
                          {emp.outTime}
                        </span>
                        {emp.isEarlyOut && (
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: "hsl(var(--destructive))" }}
                          >
                            {formatDuration(emp.earlyMinutes)} early
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {emp.outTime}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {emp.workingHours ? (
                      <div className="flex flex-col">
                        <span
                          className="font-medium"
                          style={{
                            color: isShort
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--success))",
                          }}
                        >
                          {emp.workingHours}
                        </span>

                        {emp.shortfallMinutes > 0 && (
                          <span className="text-xs text-red-600">
                            Short: {emp.shortfall}
                          </span>
                        )}

                        {emp.overtimeMinutes > 0 && (
                          <span className="text-xs text-green-600">
                            OT: {emp.overtime}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${sc.bg} ${sc.text}`}
                    >
                      {emp.status}
                      {emp.status === "Leave" && emp.leaveType
                        ? ` · ${emp.leaveType}`
                        : ""}
                    </span>
                  </td>

                  {canAddNote && (
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!emp.attendanceId ? (
                        <span className="text-muted-foreground">—</span>
                      ) : emp.earlyExitReason ? (
                        <button
                          type="button"
                          onClick={() => openNote(emp)}
                          className="group flex w-full items-center gap-1.5 text-left"
                          title={emp.earlyExitReason}
                        >
                          <span className="text-xs truncate">
                            {emp.earlyExitReason}
                          </span>
                          <NotebookPen
                            size={14}
                            className="shrink-0 text-muted-foreground group-hover:text-green-700"
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openNote(emp)}
                          className="inline-flex items-center gap-1 rounded-md border border-green-700/30 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-50 transition-colors"
                        >
                          <MessageSquarePlus size={13} />
                          Add note
                        </button>
                      )}
                    </td>
                  )}

                  {canSeeFilters && (
                    <td className="px-3 py-2">
                      <div
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1.5 text-white border-none hover:opacity-90"
                          style={{ background: "#F97316" }}
                          onClick={() => onUpdateStatus(emp.id, emp.fullName)}
                        >
                          <ClipboardCheck size={13} />
                          Update Status
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---- Note Modal ---- */}
      <Dialog open={!!noteTarget} onOpenChange={(open) => !open && closeNote()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {noteTarget?.hasNote ? "Edit Note" : "Add Note"}
            </DialogTitle>
            <DialogDescription>
              {noteTarget?.name}
              {noteTarget?.date
                ? ` · ${new Date(noteTarget.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write note here… (e.g. Doctor appointment, approved by manager)"
              rows={4}
              maxLength={255}
              disabled={saving}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {draft.length}/255
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeNote} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={saveNote}
              disabled={saving || !draft.trim()}
              className="text-white"
              style={{ background: "#166534" }}
            >
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
