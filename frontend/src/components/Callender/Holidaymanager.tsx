import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
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

export interface Holiday {
  id: string | number;
  branch_id: string | number;
  date: string;
  name: string;
}

interface HolidayManagerProps {
  /** Currently active branch id (used to default the "Add Holiday" branch) */
  branch: string;
  /** Display label for the active branch, e.g. "Mumbai" */
  branchLabel: string;
  /** Holidays already filtered for the active branch (passed down from parent) */
  holidays: Holiday[];
  /** True while the holiday list is being fetched */
  loading: boolean;
  /** True while a new holiday is being created */
  creating: boolean;
  /** Selectable years for the "Add Holiday" form */
  yearOptions: number[];
  /** Called with the new holiday's data — parent owns the actual dispatch */
  onAddHoliday: (data: {
    branchId: string;
    date: string;
    name: string;
  }) => Promise<void> | void;
  /** Called with the updated holiday's data — parent owns the actual dispatch */
  onEditHoliday: (data: {
    id: string;
    branchId: string;
    date: string;
    name: string;
  }) => Promise<void> | void;
  /** Called with the holiday id to delete — parent owns the actual dispatch */
  onRemoveHoliday: (id: string) => void;
}

export default function HolidayManager({
  branch,
  branchLabel,
  holidays,
  loading,
  creating,
  yearOptions,
  onAddHoliday,
  onEditHoliday,
  onRemoveHoliday,
}: HolidayManagerProps) {
  const currentYear = new Date().getFullYear();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHolidayBranch, setNewHolidayBranch] = useState<string>(branch);
  const [newHolidayYear, setNewHolidayYear] = useState<number>(currentYear);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");

  // Keep the form's branch in sync with the active branch whenever it
  // changes (e.g. user switches branch from the calendar's branch filter).
  useEffect(() => {
    setNewHolidayBranch(branch);
  }, [branch]);

  const handleYearChange = (y: number) => {
    setNewHolidayYear(y);
    if (newHolidayDate) {
      const [, month, day] = newHolidayDate.split("-");
      setNewHolidayDate(`${y}-${month}-${day}`);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewHolidayBranch(branch);
    setNewHolidayYear(currentYear);
    setNewHolidayDate("");
    setNewHolidayName("");
    setModalOpen(true);
  };

  const openEditModal = (h: Holiday) => {
    setEditingId(String(h.id));
    setNewHolidayBranch(String(h.branch_id));
    setNewHolidayYear(new Date(h.date).getFullYear());
    setNewHolidayDate(h.date);
    setNewHolidayName(h.name);
    setModalOpen(true);
  };

  const handleAdd = async () => {
    if (!newHolidayDate || !newHolidayName.trim() || !newHolidayBranch) return;

    if (editingId) {
      await onEditHoliday({
        id: editingId,
        branchId: newHolidayBranch,
        date: newHolidayDate,
        name: newHolidayName.trim(),
      });
    } else {
      await onAddHoliday({
        branchId: newHolidayBranch,
        date: newHolidayDate,
        name: newHolidayName.trim(),
      });
    }

    setEditingId(null);
    setNewHolidayDate("");
    setNewHolidayName("");
    setNewHolidayYear(currentYear);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {branchLabel} Branch Holidays
        </h3>
        <Button
          size="sm"
          className="h-9 gap-1.5 text-white border-none"
          style={{ background: "var(--gradient-primary)" }}
          onClick={openAddModal}
        >
          <Plus size={14} />
          Add Holiday
        </Button>
      </div>

      {/* ---------------- Holidays table ---------------- */}
      <div
        className="rounded-xl border-2 bg-card overflow-hidden"
        style={{ borderColor: "#BBF7D0" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[43%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr style={{ background: "#166534" }}>
                {["Date", "Branch", "Year", "Holiday Name", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-white uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading && holidays.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      Loading holidays…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && holidays.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No holidays added yet for {branchLabel}.
                  </td>
                </tr>
              )}

              {[...holidays]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 truncate">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap"
                        style={{
                          background: "hsl(var(--muted-foreground) / 0.15)",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        {new Date(h.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 truncate text-foreground">
                      {branchLabel}
                    </td>
                    <td className="px-4 py-3 truncate text-foreground">
                      {new Date(h.date).getFullYear()}
                    </td>
                    <td className="px-4 py-3 truncate text-foreground">
                      {h.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(h)}
                          className="text-muted-foreground hover:text-primary transition"
                          title="Edit holiday"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onRemoveHoliday(String(h.id))}
                          className="text-muted-foreground hover:text-destructive transition"
                          title="Delete holiday"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Add Holiday form (modal) ---------------- */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Branch Holiday" : "Add Branch Holiday"}
            </DialogTitle>
            <DialogDescription>
              This holiday will apply only to the selected branch's employees.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Branch
              </label>
              <BranchFilter
                value={newHolidayBranch}
                onChange={setNewHolidayBranch}
                includeAllOption={false}
                placeholder="Select branch"
                className="w-full h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Year
              </label>
              <Select
                value={String(newHolidayYear)}
                onValueChange={(v) => handleYearChange(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Date
              </label>
              <Input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Holiday Name
              </label>
              <Input
                placeholder="e.g. Independence Day"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEditingId(null);
                setModalOpen(false);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 text-white border-none"
              style={{ background: "var(--gradient-primary)" }}
              onClick={handleAdd}
              disabled={!newHolidayDate || !newHolidayName.trim() || creating}
            >
              {creating
                ? editingId
                  ? "Saving..."
                  : "Adding..."
                : editingId
                  ? "Save"
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
