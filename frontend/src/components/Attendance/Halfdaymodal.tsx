import { useState } from "react";
import { X } from "lucide-react";
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

interface AttendanceStatusModalProps {
  open: boolean;
  empName: string;
  dateLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (status: string) => void;
}

export default function AttendanceStatusModal({
  open,
  empName,
  dateLabel,
  onOpenChange,
  onConfirm,
}: AttendanceStatusModalProps) {
  const [attendanceStatus, setAttendanceStatus] = useState("Present");

  // Reset to a sane default each time the modal is opened fresh
  const handleOpenChange = (next: boolean) => {
    if (next) setAttendanceStatus("Present");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] [&>button]:hidden rounded-2xl p-0 overflow-hidden">
        <div className="p-7">
          <DialogClose className="absolute right-5 top-5">
            <X className="h-5 w-5 text-gray-500 hover:text-black" />
          </DialogClose>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-3xl font-bold">
              Update Attendance Status
            </DialogTitle>

            <DialogDescription className="text-gray-500">
              Select attendance status for{" "}
              <span className="font-semibold text-black">{empName}</span> on{" "}
              <span className="font-semibold text-black">{dateLabel}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-7 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Attendance Status
              </label>

              <Select
                value={attendanceStatus}
                onValueChange={setAttendanceStatus}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Week Off">Week Off</SelectItem>
                  <SelectItem value="CompOff">Comp Off</SelectItem>
                  <SelectItem value="Holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-8 flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              className="flex-1 h-12 rounded-xl text-white"
              style={{
                background: "linear-gradient(90deg,#9FD9AE 0%, #FFD978 100%)",
              }}
              onClick={() => onConfirm(attendanceStatus)}
            >
              Update
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
