import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, X } from "lucide-react";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  submitTrainingQuery,
  resetTrainingQuery,
} from "@/redux/features/trainingQuery/trainingQuerySlice";

const MAX_QUESTIONS = 10;

interface QueryModalProps {
  open: boolean;
  onClose: () => void;
  department: string;
  subDepartment: string;
  day: number;
  moduleName: string;
}

export default function QueryModal({
  open,
  onClose,
  department,
  subDepartment,
  day,
  moduleName,
}: QueryModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.trainingQuery);

  const [questions, setQuestions] = useState<string[]>([""]);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (index: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const addRow = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    setQuestions((prev) => [...prev, ""]);
  };

  const removeRow = (index: number) => {
    setQuestions((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index),
    );
  };

  const handleClose = () => {
    setQuestions([""]);
    setLocalError(null);
    dispatch(resetTrainingQuery());
    onClose();
  };

  const handleSubmit = async () => {
    const cleaned = questions.map((q) => q.trim()).filter(Boolean);

    if (cleaned.length === 0) {
      return setLocalError("Kam se kam ek question likhna zaruri hai");
    }
    if (cleaned.some((q) => q.length < 5 || q.length > 1000)) {
      return setLocalError(
        "Har question 5 se 1000 characters ke beech hona chahiye",
      );
    }
    setLocalError(null);

    const result = await dispatch(
      submitTrainingQuery({
        department,
        subDepartment,
        day,
        moduleName,
        questions: cleaned,
      }),
    );

    if (submitTrainingQuery.fulfilled.match(result)) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Raise Query</h2>
            <p className="text-xs text-gray-500">
              Day {day} {moduleName ? `• ${moduleName}` : ""}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Questions */}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {questions.map((q, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2 w-5 text-sm text-gray-500">
                {index + 1}.
              </span>
              <textarea
                value={q}
                onChange={(e) => handleChange(index, e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Apna question yaha likhein..."
                className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={() => removeRow(index)}
                className="mt-2 text-gray-400 hover:text-red-500"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            disabled={questions.length >= MAX_QUESTIONS}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 disabled:opacity-40"
          >
            <Plus size={16} /> Add Row
          </button>

          {(localError || error) && (
            <p className="text-sm text-red-600">{localError || error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button
            onClick={handleClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
