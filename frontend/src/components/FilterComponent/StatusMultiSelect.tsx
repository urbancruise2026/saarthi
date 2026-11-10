import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Leave",
  "Half Day",
  "LWP",
  "Holiday",
  "Week Off",
];

interface StatusMultiSelectProps {
  value: string[]; // empty array = "All Status"
  onChange: (value: string[]) => void;
}

export default function StatusMultiSelect({
  value,
  onChange,
}: StatusMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // dropdown ke bahar click karne par close ho jaye
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAllSelected = value.length === 0;

  const toggleStatus = (status: string) => {
    if (value.includes(status)) {
      onChange(value.filter((s) => s !== status));
    } else {
      onChange([...value, status]);
    }
  };

  const toggleAll = () => {
    onChange([]); // empty = all status
  };

  const label = isAllSelected
    ? "All Status"
    : value.length === 1
      ? value[0]
      : `${value.length} Selected`;

  return (
    <div className="relative w-[170px]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm flex items-center justify-between"
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border bg-white shadow-lg py-1 max-h-64 overflow-y-auto">
          <div
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
            onClick={toggleAll}
          >
            <span
              className="w-4 h-4 rounded flex items-center justify-center border"
              style={{
                background: isAllSelected ? "#166534" : "transparent",
                borderColor: isAllSelected ? "#166534" : "#D1D5DB",
              }}
            >
              {isAllSelected && <Check size={12} className="text-white" />}
            </span>
            All Status
          </div>

          <div className="border-t my-1" />

          {STATUS_OPTIONS.map((status) => {
            const checked = value.includes(status);
            return (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => toggleStatus(status)}
              >
                <span
                  className="w-4 h-4 rounded flex items-center justify-center border"
                  style={{
                    background: checked ? "#166534" : "transparent",
                    borderColor: checked ? "#166534" : "#D1D5DB",
                  }}
                >
                  {checked && <Check size={12} className="text-white" />}
                </span>
                {status}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}