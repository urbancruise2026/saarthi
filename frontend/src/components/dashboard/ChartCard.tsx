import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, icon: Icon, children, className, action }: ChartCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/60 bg-card p-6 transition-shadow duration-300 hover:shadow-elevated",
      className
    )}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
              <Icon size={16} className="text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}