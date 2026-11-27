import { useEffect, useState } from "react";
import { Plus, Trash2, X, MapPin, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

import {
  getModuleQuestions,
  saveModuleQuestions,
  resetTrainingMapQuery,
} from "@/redux/features/TrainingMapQuery/trainingMapQuerySlice";

type Option = {
  value: string;
  label: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  departments?: Option[];
  subDepartments?: Record<string, Option[]>;
  modules?: Option[];
};

const selectClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

// Google Maps module options
const GOOGLE_MAP_MODULES: Option[] = [
  { value: "google_map_1", label: "Google Map 1" },
  { value: "google_map_2", label: "Google Map 2" },
];

export default function AddQuestionsModal({
  open,
  onClose,
  departments = [],
  subDepartments = {},
  modules = [],
}: Props) {
  const dispatch = useAppDispatch();

  // state.trainingMapQuery undefined ho to bhi crash na ho
  const { fetching = false, saving = false } = useAppSelector(
    (state: any) => state.trainingMapQuery ?? {},
  );

  const [department, setDepartment] = useState("");
  const [subDepartment, setSubDepartment] = useState("");
  const [moduleKey, setModuleKey] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [error, setError] = useState("");

  const ready = Boolean(department && subDepartment && moduleKey);

  // Google Maps options ko existing modules ke saath combine karein
  const allModules: Option[] = [
    ...(Array.isArray(modules) ? modules : []).filter(
      (module) =>
        module.value !== "google_map_1" && module.value !== "google_map_2",
    ),
    ...GOOGLE_MAP_MODULES,
  ];

  // Modal open hone par reset
  useEffect(() => {
    if (!open) return;

    setDepartment("");
    setSubDepartment("");
    setModuleKey("");
    setQuestions([""]);
    setError("");

    dispatch(resetTrainingMapQuery());
  }, [open, dispatch]);

  // Department, Sub Department aur Module select hone par
  // existing questions fetch honge
  useEffect(() => {
    if (!open || !ready) return;

    let active = true;

    setQuestions([""]);
    setError("");

    dispatch(
      getModuleQuestions({
        department,
        subDepartment,
        moduleKey,
      }),
    )
      .unwrap()
      .then((list: any) => {
        if (!active) return;

        const texts = (Array.isArray(list) ? list : [])
          .map((q: any) => (typeof q === "string" ? q : (q?.text ?? "")))
          .filter(
            (text: string) => typeof text === "string" && text.trim() !== "",
          );

        setQuestions(texts.length ? texts : [""]);
      })
      .catch(() => {
        if (active) {
          setQuestions([""]);
        }
      });

    return () => {
      active = false;
    };
  }, [open, ready, department, subDepartment, moduleKey, dispatch]);

  if (!open) return null;

  // Question update
  const setQ = (index: number, value: string) => {
    setQuestions((previous) =>
      previous.map((question, i) => (i === index ? value : question)),
    );
  };

  // Add question
  const addQ = () => {
    setQuestions((previous) => [...previous, ""]);
  };

  // Remove question
  const removeQ = (index: number) => {
    setQuestions((previous) =>
      previous.length === 1 ? [""] : previous.filter((_, i) => i !== index),
    );
  };

  // Close modal
  const handleClose = () => {
    setError("");
    onClose();
  };

  // Save questions
  const handleSave = async () => {
    const cleaned = questions
      .map((question) => question.trim())
      .filter(Boolean);

    if (!ready) {
      setError("Department, Sub Department aur Module chunein.");
      return;
    }

    if (!cleaned.length) {
      setError("Kam se kam 1 question likhein.");
      return;
    }

    setError("");

    try {
      await dispatch(
        saveModuleQuestions({
          department,
          subDepartment,
          moduleKey,
          questions: cleaned,
        }),
      ).unwrap();

      handleClose();
    } catch (err: any) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Save nahi hua, dobara try karein.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Plus size={21} />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Add Questions
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Manage module-wise training questions
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* DEPARTMENT & SUB DEPARTMENT */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Department
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                className={selectClass}
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setSubDepartment("");
                  setModuleKey("");
                }}
              >
                <option value="">Select Department</option>

                {(Array.isArray(departments) ? departments : []).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Sub Department
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                className={selectClass}
                value={subDepartment}
                disabled={!department}
                onChange={(e) => {
                  setSubDepartment(e.target.value);
                  setModuleKey("");
                }}
              >
                <option value="">Select Sub Department</option>

                {(subDepartments?.[department] ?? []).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MODULE */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Module
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              className={selectClass}
              value={moduleKey}
              disabled={!subDepartment}
              onChange={(e) => setModuleKey(e.target.value)}
            >
              <option value="">Select Module</option>

              {allModules.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* GOOGLE MAP MODULE INFO */}
          {(moduleKey === "google_map_1" || moduleKey === "google_map_2") && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-green-700">
                <MapPin size={21} />
              </div>

              <div>
                <p className="text-sm font-bold text-green-800">
                  {moduleKey === "google_map_1"
                    ? "Google Map 1"
                    : "Google Map 2"}
                </p>

                <p className="text-xs text-green-700">
                  Add and manage questions for this Google Maps module.
                </p>
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {ready && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Training Questions
                  </h4>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Add multiple questions for the selected module.
                  </p>
                </div>

                <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  {questions.length} Questions
                </span>
              </div>

              {fetching ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-10 text-sm font-semibold text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Loading existing questions...
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-green-200"
                      >
                        <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-xs font-extrabold text-green-800">
                          {index + 1}
                        </span>

                        <textarea
                          rows={2}
                          value={question}
                          onChange={(e) => setQ(index, e.target.value)}
                          placeholder={`Write question ${index + 1}...`}
                          className="min-w-0 flex-1 resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />

                        <button
                          type="button"
                          aria-label="Remove question"
                          onClick={() => removeQ(index)}
                          className="mt-1 rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ADD QUESTION */}
                  <button
                    type="button"
                    onClick={addQ}
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-green-400 bg-green-50/50 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50"
                  >
                    <Plus size={17} />
                    Add Another Question
                  </button>
                </>
              )}
            </div>
          )}

          {!ready && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <MapPin size={27} className="mx-auto mb-2 text-slate-400" />

              <p className="text-sm font-bold text-slate-600">
                Select Department, Sub Department and Module
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Questions will appear here after selecting all three fields.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-sm font-semibold text-red-600">{error}</p>

          <div className="flex shrink-0 justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!ready || saving || fetching}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}

              {saving ? "Saving..." : "Save Questions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
