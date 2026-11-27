import { CheckCircle2, XCircle, Eye, HelpCircle } from "lucide-react";
import type { DayReview } from "./types";

export default function DayNumberCell({
  day,
  date,
  review,
  onOpen,
  onQuery,
}: {
  day: number;
  date: string;
  review?: DayReview;
  onOpen: (day: number) => void;
  onQuery?: (day: number) => void;
}) {
  const buttonStyle = !review
    ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
    : review.understood === "yes"
      ? "border-green-300 bg-green-50 text-green-700"
      : "border-red-300 bg-red-50 text-red-700";

  return (
    <td className="border-b border-r border-slate-200 px-3 py-3 align-middle">
      <div className="grid grid-cols-2 items-center gap-x-3 gap-y-2">
        {/* ROW 1: Day (left) | Date (right) */}
        <div className="text-center text-3xl font-black leading-none text-slate-900">
          Day {day}
        </div>
        <div className="whitespace-nowrap text-center text-xl font-bold leading-none text-slate-700">
          {date}
        </div>

        {/* ROW 2: Review (left) | Arise Query (right) */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onOpen(day)}
            title={review?.learned || "Module review dein"}
            className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold transition ${buttonStyle}`}
          >
            {!review && <Eye size={12} />}
            {review?.understood === "yes" && <CheckCircle2 size={12} />}
            {review?.understood === "no" && <XCircle size={12} />}
            {!review
              ? "Review"
              : review.understood === "yes"
                ? "Samajh Aaya"
                : "Nahi Aaya"}
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onQuery?.(day)}
            title="Query raise karein"
            className="flex items-center gap-1 whitespace-nowrap rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700 transition hover:bg-purple-100"
          >
            <HelpCircle size={12} />
            Raise Query{" "}
          </button>
        </div>
      </div>
    </td>
  );
}
