import { MessageSquare } from "lucide-react";

type Props = {
  day: number;
  learned: string;
  suggestions: string;
  onLearnedChange: (v: string) => void;
  onSuggestionsChange: (v: string) => void;
};

const textareaClass =
  "w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function FeedbackSection({
  day,
  learned,
  suggestions,
  onLearnedChange,
  onSuggestionsChange,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h4 className="flex items-center gap-2 text-base font-extrabold text-blue-950">
        <MessageSquare size={20} className="text-blue-700" />
        Your Feedback
      </h4>
      <p className="mt-0.5 text-xs text-slate-500">
        Please share your feedback about this training. Your input helps us
        improve future training sessions.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor={`learned-${day}`}
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            What did you learn from this training?{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`learned-${day}`}
            rows={3}
            value={learned}
            onChange={(e) => onLearnedChange(e.target.value)}
            placeholder="e.g. I learned about vehicle features and lead handling..."
            className={textareaClass}
          />
        </div>

        <div>
          <label
            htmlFor={`suggestions-${day}`}
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            Any Suggestions or Additional Comments{" "}
            <span className="font-normal text-slate-500">(Optional)</span>
          </label>
          <textarea
            id={`suggestions-${day}`}
            rows={2}
            value={suggestions}
            onChange={(e) => onSuggestionsChange(e.target.value)}
            placeholder="Share your suggestions..."
            className={textareaClass}
          />
        </div>
      </div>
    </section>
  );
}
