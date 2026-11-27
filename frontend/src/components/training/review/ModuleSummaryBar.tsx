import { CalendarDays, CheckCircle2, Clock, PlayCircle } from "lucide-react";

type Props = {
  moduleName: string;
  completionDate: string;
  dayLabel: string;
  completed: boolean;
};

function Item({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm font-extrabold text-slate-900">{children}</div>
      </div>
    </div>
  );
}

export default function ModuleSummaryBar({
  moduleName,
  completionDate,
  dayLabel,
  completed,
}: Props) {
  return (
    <div className="mx-6 mt-4 grid grid-cols-1 divide-y divide-blue-200 rounded-xl border border-blue-200 bg-blue-50/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      <Item
        label="Module Name"
        icon={<PlayCircle size={30} className="text-blue-900" />}
      >
        <span className="block truncate">{moduleName}</span>
      </Item>

      <Item
        label="Completion Date"
        icon={<CalendarDays size={26} className="text-blue-900" />}
      >
        {completionDate}
      </Item>

      <Item
        label="Training Day"
        icon={<Clock size={26} className="text-blue-900" />}
      >
        {dayLabel}
      </Item>

      <Item
        label="Status"
        icon={
          <CheckCircle2
            size={26}
            className={completed ? "text-green-600" : "text-slate-400"}
          />
        }
      >
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs ${
            completed
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {completed ? "Completed" : "Pending"}
        </span>
      </Item>
    </div>
  );
}
