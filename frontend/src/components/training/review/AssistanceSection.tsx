import { LifeBuoy } from "lucide-react";
import type { Assistance } from "../types";

type Props = {
  day: number;
  value: Assistance | "";
  details: string;
  onChange: (v: Assistance) => void;
  onDetailsChange: (v: string) => void;
};

export default function AssistanceSection({
  day,
  value,
  details,
  onChange,
  onDetailsChange,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h4 className="flex items-center gap-2 text-base font-extrabold text-blue-950">
        <LifeBuoy size={20} className="text-blue-700" />
        Additional Assistance
      </h4>
      <p className="mt-0.5 text-xs text-slate-500">
        Do you require any assistance or clarification from a trainer or team
        member? <span className="text-red-500">*</span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("yes")}
          className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
            value === "yes"
              ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
              : "border-slate-300 text-slate-600 hover:border-blue-400"
          }`}
        >
          Yes, I need assistance
        </button>

        <button
          type="button"
          onClick={() => onChange("no")}
          className={`rounded-lg border px-3 py-3 text-sm font-bold transition ${
            value === "no"
              ? "border-green-600 bg-green-50 text-green-700 ring-2 ring-green-100"
              : "border-slate-300 text-slate-600 hover:border-green-400"
          }`}
        >
          No, I&apos;m clear
        </button>
      </div>

      {value === "yes" && (
        <div className="mt-4">
          <label
            htmlFor={`assist-${day}`}
            className="mb-1.5 block text-sm font-bold text-slate-800"
          >
            Please specify what assistance you require.{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`assist-${day}`}
            rows={3}
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="Mention the topic, process, or question for which you need assistance..."
            className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}
    </section>
  );
}
