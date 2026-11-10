import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { markAllRead, markAsRead } from "@/redux/notificationSlice";
import { Bell, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  submission: "hsl(var(--primary))",
  approved: "hsl(var(--success))",
  rejected: "hsl(var(--destructive))",
  resubmitted: "hsl(var(--warning))",
};

const typeLabels: Record<string, string> = {
  submission: "New Submission",
  approved: "Approved",
  rejected: "Rejected",
  resubmitted: "Re-Submitted",
};

export default function Notifications() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unread > 0 ? `${unread} unread` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => dispatch(markAllRead())}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => dispatch(markAsRead(n.id))}
            className={cn(
              "stat-card cursor-pointer hover:scale-[1.005] transition-all",
              !n.read && "border-l-4"
            )}
            style={!n.read ? { borderLeftColor: typeColors[n.type] } : {}}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${typeColors[n.type]}18` }}>
                <Bell size={16} style={{ color: typeColors[n.type] }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn("text-sm font-semibold", !n.read ? "text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${typeColors[n.type]}18`, color: typeColors[n.type] }}
                  >
                    {typeLabels[n.type]}
                  </span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  {format(new Date(n.createdAt), "MMMM d, yyyy · h:mm a")}
                </p>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="stat-card text-center py-16">
            <Bell size={32} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
