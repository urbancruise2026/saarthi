import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Keyboard, Plus, Trash2, X } from "lucide-react";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  submitTypingScores,
  getTypingScores,
  removeTypingScore,
  clearTypingScores,
  resetTypingSave,
} from "@/redux/features/trainingTyping/trainingTypingSlice";
import type {
  TypingEntry,
  SavedTypingEntry,
} from "@/redux/features/trainingTyping/trainingTypingApi";

const DEFAULT_ROWS = 1;
const TARGET_ENTRIES = 5; // 5 me se kitne complete hue

// current date / day / time automatic
const nowEntry = (): TypingEntry => {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-CA"), // YYYY-MM-DD (local)
    day: d.toLocaleDateString("en-US", { weekday: "long" }),
    time: d.toTimeString().slice(0, 5), // HH:mm
    score: "",
  };
};

const makeRows = () => Array.from({ length: DEFAULT_ROWS }, nowEntry);

const GRID_COLS = "grid-cols-[1.3fr_1.2fr_1fr_1fr_32px]";

type Props = {
  open: boolean;
  onClose: () => void;
  subDepartment: "presales" | "telesales";
  day: number | null;
};

export default function TypingModal({
  open,
  onClose,
  subDepartment,
  day,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  // store key: trainingTyping (safe selector, undefined hone par bhi crash nahi hoga)
  const typingState = useSelector((s: RootState) => (s as any).trainingTyping);
  const scores: SavedTypingEntry[] = typingState?.scores ?? [];
  const fetching: boolean = typingState?.fetching ?? false;
  const saving: boolean = typingState?.saving ?? false;
  const saveError: string | null = typingState?.saveError ?? null;
  const deleting: boolean = typingState?.deleting ?? false;

  const [rows, setRows] = useState<TypingEntry[]>(makeRows);
  const [error, setError] = useState("");

  // modal khulte hi fresh rows + current date/time + saved scores fetch
  useEffect(() => {
    if (open && day) {
      setRows(makeRows());
      setError("");
      dispatch(resetTypingSave());
      dispatch(getTypingScores({ subDepartment, trainingDay: day }));
    }
    if (!open) {
      dispatch(clearTypingScores());
    }
  }, [open, day, subDepartment, dispatch]);

  if (!open || !day) return null;

  // progress: saved scores ki ginti / 5
  const completedCount = Math.min(scores.length, TARGET_ENTRIES);
  const progressPct = (completedCount / TARGET_ENTRIES) * 100;

  const updateRow = (i: number, patch: Partial<TypingEntry>) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );

  const addRow = () => setRows((prev) => [...prev, nowEntry()]);
  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    // sirf wahi rows jinme score bhara hai
    const filled = rows.filter((r) => String(r.score).trim() !== "");

    if (filled.length === 0) {
      setError("Kam se kam ek score daalo.");
      return;
    }
    if (filled.some((r) => isNaN(Number(r.score)) || Number(r.score) < 0)) {
      setError("Score valid number hona chahiye.");
      return;
    }

    setError("");
    const result = await dispatch(
      submitTypingScores({ subDepartment, trainingDay: day, entries: filled }),
    );

    if (submitTypingScores.fulfilled.match(result)) {
      onClose();
    }
    // error aaye to saveError neeche dikhega
  };

  const shownError = error || saveError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-green-500 px-6 py-4 text-white">
          <h3 className="flex items-center gap-2 text-lg font-extrabold">
            <Keyboard size={22} /> Typing Tutor – Day {day}
          </h3>
          <button type="button" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Completed status (progress bar) */}
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="bg-green-800 px-4 py-2 text-sm font-bold text-white">
              Days Completed
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-extrabold text-slate-800">
                {completedCount} / {TARGET_ENTRIES}
              </p>
              <div className="mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Column labels */}
          <div
            className={`mb-2 grid ${GRID_COLS} gap-3 text-sm font-bold text-slate-600`}
          >
            <span>Date</span>
            <span>Day</span>
            <span>Time</span>
            <span>Score</span>
            <span />
          </div>

          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className={`grid ${GRID_COLS} items-center gap-3`}>
                {/* Date: auto, readonly */}
                <input
                  value={r.date}
                  readOnly
                  className="rounded-lg border bg-slate-100 px-3 py-2 text-sm"
                />

                {/* Day: auto, readonly */}
                <input
                  value={r.day}
                  readOnly
                  className="rounded-lg border bg-slate-100 px-3 py-2 text-sm"
                />

                {/* Time: auto filled, user chahe to badal sake */}
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) => updateRow(i, { time: e.target.value })}
                  className="rounded-lg border px-3 py-2 text-sm"
                />

                {/* Score: sirf number */}
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Score"
                  value={r.score}
                  onChange={(e) => updateRow(i, { score: e.target.value })}
                  className="rounded-lg border px-3 py-2 text-sm focus:outline-green-500"
                />

                {/* default rows delete nahi hongi, sirf extra rows */}
                {i >= DEFAULT_ROWS ? (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100"
          >
            <Plus size={16} /> Add Row
          </button>

          {shownError && (
            <p className="mt-3 text-sm font-semibold text-red-600">
              {shownError}
            </p>
          )}

          {/* Pehle save hue scores */}
          <div className="mt-6">
            <h4 className="mb-2 text-sm font-extrabold text-slate-700">
              Saved Scores
            </h4>

            {fetching ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : scores.length === 0 ? (
              <p className="text-sm text-slate-400">Abhi koi score nahi hai.</p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-auto text-sm">
                {scores.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5"
                  >
                    <span>
                      {s.date} • {s.day} • {s.time}
                    </span>
                    <span className="flex items-center gap-3 font-bold">
                      {Number(s.score)}
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => dispatch(removeTypingScore(s.id))}
                        className="text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
