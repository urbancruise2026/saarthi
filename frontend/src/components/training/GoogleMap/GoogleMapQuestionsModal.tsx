import { useEffect, useState } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import { getModuleQuestions } from "@/redux/features/TrainingMapQuery/trainingMapQuerySlice";

type Props = {
  open: boolean;
  onClose: () => void;
  department: string;
  subDepartment: string;
  moduleKey: "google_map_1" | "google_map_2" | null;
};

const TITLE = {
  google_map_1: "Google Map 1",
  google_map_2: "Google Map 2",
};

export default function GoogleMapQuestionsModal({
  open,
  onClose,
  department,
  subDepartment,
  moduleKey,
}: Props) {
  const dispatch = useAppDispatch();
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !moduleKey) return;
    let active = true;

    setLoading(true);
    setQuestions([]);

    dispatch(getModuleQuestions({ department, subDepartment, moduleKey }))
      .unwrap()
      .then((list: any) => {
        if (!active) return;
        const texts = (Array.isArray(list) ? list : [])
          .map((q: any) => (typeof q === "string" ? q : (q?.text ?? "")))
          .filter((t: string) => typeof t === "string" && t.trim() !== "");
        setQuestions(texts);
      })
      .catch(() => active && setQuestions([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [open, department, subDepartment, moduleKey, dispatch]);

  if (!open || !moduleKey) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <MapPin size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {TITLE[moduleKey]} – Questions
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <p className="py-10 text-center text-sm font-semibold text-slate-400">
              Is Google Map ke liye abhi koi question add nahi hai.
            </p>
          ) : (
            questions.map((q, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-xs font-extrabold text-green-800">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-slate-800">{q}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}