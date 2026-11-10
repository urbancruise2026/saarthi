import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: boolean;
  color?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient,
  color,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer group overflow-hidden",
        "hover:shadow-elevated hover:-translate-y-1",
        gradient ? "text-white border-transparent" : "bg-card border-border/60",
      )}
      style={
        gradient
          ? {
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-gradient)",
            }
          : undefined
      }
    >
      {/* Subtle gradient border on hover */}
      {!gradient && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            padding: "1.5px",
            background: "var(--gradient-primary-lr)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs font-medium tracking-wide uppercase",
              gradient ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "text-3xl font-bold tracking-tight",
              gradient ? "text-white" : "text-foreground",
            )}
          >
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1 mt-1",
                gradient
                  ? "text-white/60"
                  : changeType === "positive"
                    ? "text-success"
                    : changeType === "negative"
                      ? "text-destructive"
                      : "text-muted-foreground",
              )}
            >
              {changeType === "positive" && "↑"}
              {changeType === "negative" && "↓"}
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
          )}
          style={
            gradient
              ? { background: "rgba(255,255,255,0.2)" }
              : {
                  background: color
                    ? `${color}12`
                    : "hsl(var(--primary) / 0.1)",
                  color: color || "hsl(var(--primary))",
                }
          }
        >
          <Icon
            size={20}
            className={gradient ? "text-white" : ""}
            style={!gradient ? { color: color || undefined } : {}}
          />
        </div>
      </div>
    </div>
  );
}
