import { useState } from "react";
import { Timer, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  markEmployeeAttendance,
  updateEmployeeAttendance,
} from "@/redux/features/Attendance/attendanceSlice";

interface PunchButtonProps {
  attendanceId?: number | null;
  attendanceDate: string;
  isPunchedIn: boolean;
  punchInTime?: string | null;
  onSuccess?: () => void;
}

const getCurrentTimeString = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");

  return `${h}:${m}`;
};

export default function PunchButton({
  attendanceId,
  attendanceDate,
  isPunchedIn,
  punchInTime,
  onSuccess,
}: PunchButtonProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const handlePunch = async () => {
    if (loading) return;

    setLoading(true);

    const timeStr = getCurrentTimeString();

    try {
      if (isPunchedIn) {
        // Punch Out
        await dispatch(
          updateEmployeeAttendance({
            attendanceId,
            attendanceDate,
            punchOut: timeStr,
          } as any),
        ).unwrap();
      } else {
        // Punch In
        await dispatch(
          markEmployeeAttendance({
            attendanceDate,
            punchIn: timeStr,
          } as any),
        ).unwrap();
      }

      toast({
        title: isPunchedIn
          ? "Punched Out Successfully"
          : "Punched In Successfully",
        description: `${isPunchedIn ? "Punch Out" : "Punch In"} recorded at ${timeStr}`,
      });

      onSuccess?.();
    } catch (err: any) {
      toast({
        title: "Attendance Failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      disabled={loading}
      onClick={handlePunch}
      className="h-9 gap-1.5 font-semibold"
      style={{
        background: isPunchedIn ? "#DC2626" : "#16A34A",
        color: "#fff",
      }}
    >
      {loading ? (
        "Please wait..."
      ) : isPunchedIn ? (
        <>
          <TimerReset size={14} />
          Punch Out
          {punchInTime ? ` (${punchInTime})` : ""}
        </>
      ) : (
        <>
          <Timer size={14} />
          Punch In
        </>
      )}
    </Button>
  );
}
