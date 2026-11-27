import { Check, Loader2, X } from "lucide-react";
import { DAY_INFO } from "../constants";
import { formatDateTime } from "../utils";
import type { DayReview } from "../types";
import { useReviewForm, type ReviewFormValues } from "./useReviewForm";
import ReviewHero from "./ReviewHero";
import ModuleSummaryBar from "./ModuleSummaryBar";
import UnderstoodSection from "./UnderstoodSection";
import FeedbackSection from "./FeedbackSection";
import AssistanceSection from "./AssistanceSection";

export default function ReviewModal({
  day,
  initial,
  onSave,
  onClose,
}: {
  day: number;
  initial?: DayReview;
  onSave: (day: number, values: ReviewFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const info = DAY_INFO[day];
  const { form, update, error, saving, submit } = useReviewForm(
    initial,
    (values) => onSave(day, values),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={saving ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Day ${day} module review`}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        >
          <X size={22} />
        </button>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto pb-5">
          <ReviewHero alreadySaved={!!initial} />

          <ModuleSummaryBar
            moduleName={info.module}
            completionDate={formatDateTime(
              initial?.completedAt ?? new Date().toISOString(),
            )}
            dayLabel={`Day ${day} · ${info.date}`}
            completed={!!initial}
          />

          <div className="space-y-4 px-6 pt-4">
            <UnderstoodSection
              value={form.understood}
              onChange={(understood) => update({ understood })}
            />

            <FeedbackSection
              day={day}
              learned={form.learned}
              suggestions={form.suggestions}
              onLearnedChange={(learned) => update({ learned })}
              onSuggestionsChange={(suggestions) => update({ suggestions })}
            />

            <AssistanceSection
              day={day}
              value={form.assistance}
              details={form.assistanceDetails}
              onChange={(assistance) => update({ assistance })}
              onDetailsChange={(assistanceDetails) =>
                update({ assistanceDetails })
              }
            />

            {error && (
              <p className="text-sm font-semibold text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-center gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-blue-700 px-7 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            {saving ? "Saving..." : "Submit Feedback & Complete"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-slate-300 bg-white px-7 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
