import {
  CalendarDays,
  CalendarMinus,
  CalendarCheck,
  TimerReset,
} from "lucide-react";

interface LeaveBalanceCardsProps {
  totalLeave: number; // is saal/period ki total leave (accrued)
  leavesTaken: number; // ab tak li hui leave
  compOffBalance: number; // bacha hua comp off
  leavesRemaining?: number; // na do to total - taken khud nikal lega
  loading?: boolean;
}

// 1.25 jaise decimals ke liye: 2 decimal tak, bekar zeros hata do
const fmt = (n: number) => String(Number(n.toFixed(2)));

export default function LeaveBalanceCards({
  totalLeave,
  leavesTaken,
  compOffBalance,
  leavesRemaining,
  loading = false,
}: LeaveBalanceCardsProps) {
  const remaining = leavesRemaining ?? Math.max(totalLeave - leavesTaken, 0);
  const usedPercent =
    totalLeave > 0 ? Math.min((leavesTaken / totalLeave) * 100, 100) : 0;

  const cards = [
    {
      label: "Total Leave",
      value: fmt(totalLeave),
      icon: CalendarDays,
      bg: "#B8E6FE", // light blue
    },
    {
      label: "Leave Taken",
      value: fmt(leavesTaken),
      icon: CalendarMinus,
      bg: "#FFD8A8", // peach
    },
    {
      label: "Remaining",
      value: fmt(remaining),
      icon: CalendarCheck,
      bg: "#B9F5D0", // mint green
      showUsage: true, // is card ke andar usage bar dikhegi
    },
    {
      label: "Comp Off",
      value: fmt(compOffBalance),
      icon: TimerReset,
      bg: "#DDD6FE", // lavender
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="flex flex-col justify-center gap-3 rounded-2xl px-4 py-4 shadow-md"
            style={{ background: c.bg }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/60 text-gray-800">
                <Icon size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">{c.label}</p>
                {loading ? (
                  <div className="mt-1 h-6 w-12 animate-pulse rounded bg-white/70" />
                ) : (
                  <p className="text-xl font-bold leading-tight text-gray-900">
                    {c.value}
                  </p>
                )}
              </div>
            </div>

            {/* Usage bar: sirf Remaining card ke andar */}
            {c.showUsage && !loading && (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                  <span>{Math.round(usedPercent)}% used</span>
                  <span>
                    {fmt(leavesTaken)} / {fmt(totalLeave)} days
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${usedPercent}%`,
                      background: "#FB923C",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
