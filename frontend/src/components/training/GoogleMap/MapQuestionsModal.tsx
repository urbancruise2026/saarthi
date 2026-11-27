import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  // backend me save karna ho to yahan se answers mil jayenge
  onSubmit?: (answers: string[]) => void;
};

// TODO: apne actual 5 questions yahan likh do
const QUESTIONS: string[] = [
  "Google Maps me kisi city ya area ko kaise search karte hain?",
  "Distance aur travel time kaise check karte hain?",
  "Satellite view aur Street View kya hote hain?",
  "Kisi location ka pin kaise drop ya share karte hain?",
  "Pre-Sales me Google Maps ka use kyun zaroori hai?",
];

export default function MapQuestionsModal({ open, onClose, onSubmit }: Props) {
  const [answers, setAnswers] = useState<string[]>(() =>
    QUESTIONS.map(() => ""),
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // modal dubara khulne par reset
  useEffect(() => {
    if (open) {
      setAnswers(QUESTIONS.map(() => ""));
      setSubmitted(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const setAnswer = (i: number, value: string) =>
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)));

  const handleSubmit = () => {
    if (answers.some((a) => !a.trim())) {
      setError("Please sabhi 5 questions ke answer do.");
      return;
    }
    setError("");
    onSubmit?.(answers.map((a) => a.trim()));
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between bg-green-600 px-5 py-3 text-white">
          <h3 className="text-lg font-extrabold">Google Maps - Questions</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CheckCircle2 size={56} className="text-green-600" />
            <p className="text-xl font-extrabold text-slate-800">
              Answers submit ho gaye!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-green-600 px-6 py-2 font-bold text-white hover:bg-green-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-5 overflow-auto px-6 py-5">
              {QUESTIONS.map((q, i) => (
                <div key={i}>
                  <label className="mb-2 block font-bold text-slate-800">
                    Q{i + 1}. {q}
                  </label>
                  <textarea
                    rows={3}
                    value={answers[i]}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    placeholder="Apna answer likho..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              ))}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
              <span className="text-sm font-semibold text-red-600">
                {error}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-green-600 px-6 py-2 font-bold text-white hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
