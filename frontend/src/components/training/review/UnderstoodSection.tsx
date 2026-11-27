import { CheckCircle2, XCircle } from "lucide-react";
import type { Understood } from "../types";

export default function UnderstoodSection({
  value,
  onChange,
}: {
  value: Understood | "";
  onChange: (v: Understood) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">
        Kya aaj ka module samajh aaya? <span className="text-red-500">*</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("yes")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold transition ${
            value === "yes"
              ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-100"
              : "border-slate-300 text-slate-600 hover:border-green-400"
          }`}
        >
          <CheckCircle2 size={18} />
          Haan, samajh aaya
        </button>

        <button
          type="button"
          onClick={() => onChange("no")}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold transition ${
            value === "no"
              ? "border-red-600 bg-red-50 text-red-800 ring-2 ring-red-100"
              : "border-slate-300 text-slate-600 hover:border-red-400"
          }`}
        >
          <XCircle size={18} />
          Nahi aaya
        </button>
      </div>
    </div>
  );
}
