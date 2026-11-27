import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, Clock, MessageSquareText, X } from "lucide-react";

import { getMyTrainingQueries } from "@/redux/features/trainingQuery/trainingQuerySlice";

type Props = {
  open: boolean;
  onClose: () => void;
  subDepartment: "presales" | "telesales";
  day: number | null;
};

export default function AnswersModal({
  open,
  onClose,
  subDepartment,
  day,
}: Props) {
  const dispatch = useDispatch<any>();

  const { myQueries, fetchingMyQueries, myQueriesError } = useSelector(
    (s: any) => s.trainingQuery,
  );

  // Only logged-in employee's questions
  useEffect(() => {
    if (open && day) {
      dispatch(getMyTrainingQueries());
    }
  }, [open, day, subDepartment, dispatch]);

  // Filter questions for selected day and sub-department
  const modules = useMemo(() => {
    const filtered = (myQueries || []).filter(
      (q: any) =>
        Number(q.day) === Number(day) && q.sub_department === subDepartment,
    );

    const grouped = new Map<string, any[]>();

    filtered.forEach((q: any) => {
      const moduleName = q.module_name || "General";

      if (!grouped.has(moduleName)) {
        grouped.set(moduleName, []);
      }

      grouped.get(moduleName)!.push(q);
    });

    return Array.from(grouped.entries()).map(([moduleName, questions]) => ({
      moduleName,
      total: questions.length,
      questions,
    }));
  }, [myQueries, day, subDepartment]);

  if (!open || !day) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-900 px-5 py-4 text-white">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <MessageSquareText size={20} />
            Day {day} – Questions & Answers
          </h3>

          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {fetchingMyQueries && (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading your questions...
            </p>
          )}

          {myQueriesError && (
            <p className="text-center text-sm text-red-600">{myQueriesError}</p>
          )}

          {!fetchingMyQueries && !myQueriesError && modules.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              You haven't raised any questions for this day yet.
            </p>
          )}

          {!fetchingMyQueries &&
            modules.map((m: any) => (
              <div key={m.moduleName}>
                <h4 className="mb-3 text-base font-extrabold text-blue-800">
                  {m.moduleName}
                  <span className="ml-1 text-xs font-semibold text-slate-400">
                    ({m.total})
                  </span>
                </h4>

                <div className="space-y-3">
                  {m.questions.map((q: any, i: number) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-bold text-slate-800">
                        Q{i + 1}. {q.question}
                      </p>

                      {q.answer ? (
                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                          <span className="flex items-center gap-1 text-xs font-bold text-green-700">
                            <CheckCircle2 size={14} />
                            Answer
                          </span>

                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                            {q.answer}
                          </p>
                        </div>
                      ) : (
                        <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Clock size={14} />
                          Answer pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
