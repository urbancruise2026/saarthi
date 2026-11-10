import { Check, CalendarOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LEAVE_TYPES } from "./Attendanceutils";

interface LeaveModalProps {
  open: boolean;
  empName: string;
  leaveType: string;
  onOpenChange: (open: boolean) => void;
  onLeaveTypeChange: (value: string) => void;
  onConfirm: () => void;
}

export default function LeaveModal({
  open,
  empName,
  leaveType,
  onOpenChange,
  onLeaveTypeChange,
  onConfirm,
}: LeaveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
          <X className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="h-24 w-full relative" style={{ background: "#16A34A" }}>
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-2xl bg-white border-2 border-border shadow-lg flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "#DCFCE7" }}
            >
              <CalendarOff size={24} style={{ color: "#16A34A" }} />
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 pb-6 space-y-6">
          <DialogHeader className="space-y-2.5">
            <DialogTitle className="text-center text-xl font-bold">
              Mark Leave
            </DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
              Select a leave type for{" "}
              <span className="font-semibold text-foreground">{empName}</span>
            </DialogDescription>
          </DialogHeader>

          <Select value={leaveType} onValueChange={onLeaveTypeChange}>
            <SelectTrigger className="w-full h-11 rounded-xl border-2 focus:ring-2 focus:ring-primary/20 transition-all">
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((lt) => (
                <SelectItem key={lt} value={lt}>
                  {lt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter className="flex-row justify-center gap-3 sm:justify-center pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl text-sm font-medium border-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl gap-2 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-none"
              style={{ background: "#16A34A" }}
              onClick={onConfirm}
            >
              <Check size={16} />
              Confirm
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
