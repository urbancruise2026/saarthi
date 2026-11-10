// components/UpdateLeaveStatusDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type LeaveAction = "Approved" | "Rejected";

interface UpdateLeaveStatusDialogProps {
  open: boolean;
  employeeName?: string;
  onClose: () => void;
  onConfirm: (status: LeaveAction, rejectionReason: string | null) => void;
  loading?: boolean;
}

export default function UpdateLeaveStatusDialog({
  open,
  employeeName,
  onClose,
  onConfirm,
  loading = false,
}: UpdateLeaveStatusDialogProps) {
  const [action, setAction] = useState<LeaveAction | null>(null);
  const [reason, setReason] = useState("");

  const isReject = action === "Rejected";
  const canConfirm =
    action === "Approved" ||
    (action === "Rejected" && reason.trim().length > 0);

  const handleClose = () => {
    setAction(null);
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    if (!action || !canConfirm) return;
    onConfirm(action, action === "Rejected" ? reason.trim() : null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Update Leave Request{employeeName ? ` — ${employeeName}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction("Approved")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors",
                action === "Approved"
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-input text-muted-foreground hover:bg-muted/50",
              )}
            >
              <CheckCircle2 size={16} />
              Approve
            </button>

            <button
              type="button"
              onClick={() => setAction("Rejected")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors",
                action === "Rejected"
                  ? "border-red-600 bg-red-50 text-red-700"
                  : "border-input text-muted-foreground hover:bg-muted/50",
              )}
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>

          {/* Reason field — sirf Reject select hone par khulta hai */}
          {isReject && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Reason for rejection
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejection…"
                rows={4}
                autoFocus
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="text-white border-none hover:opacity-90"
            style={{
              background: isReject ? "#DC2626" : "#16A34A",
            }}
            disabled={!action || !canConfirm || loading}
            onClick={handleConfirm}
          >
            {loading && <Loader2 size={14} className="animate-spin mr-1" />}
            {action === "Rejected" ? "Confirm Reject" : "Confirm Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
