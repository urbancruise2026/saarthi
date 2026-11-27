import { useState } from "react";
import { Loader2, Send, MessageSquareReply, CheckCircle2 } from "lucide-react";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  getTrainingQueries,
  giveTrainingAnswer,
} from "@/redux/features/trainingQuery/trainingQuerySlice";

type Props = {
  queryId: string;
  day?: number;
  existingAnswer?: string;
  answeredAt?: string;
};

const formatDate = (d?: string) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function QueryAnswerButton({
  queryId,
  day,
  existingAnswer,
  answeredAt,
}: Props) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openBox = () => {
    setDraft(existingAnswer ?? "");
    setErr(null);
    setOpen(true);
  };

  const closeBox = () => {
    setOpen(false);
    setDraft("");
    setErr(null);
  };

  const submit = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    setErr(null);
    const res = await dispatch(
      giveTrainingAnswer({ queryId, answer: draft.trim() }),
    );
    setSaving(false);

    if (giveTrainingAnswer.fulfilled.match(res)) {
      closeBox();
      dispatch(getTrainingQueries(undefined)); // list refresh
    } else {
      setErr((res.payload as string) ?? "Answer save nahi hua");
    }
  };

  return (
    <div className="mt-2 w-full">
      {/* EXISTING ANSWER */}
      {existingAnswer && !open && (
        <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="mb-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            <CheckCircle2 size={12} />
            Answer
            {answeredAt ? ` · ${formatDate(answeredAt)}` : ""}
          </p>
          <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
            {existingAnswer}
          </p>
        </div>
      )}

      {/* ANSWER BOX */}
      {open ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            placeholder={`Day ${day ?? ""} ke question ka answer likho...`}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
          {err && <p className="text-xs text-red-600">{err}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={saving || !draft.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              Submit
            </button>
            <button
              type="button"
              onClick={closeBox}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openBox}
          className="flex items-center gap-1.5 rounded-lg border border-green-600 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
        >
          <MessageSquareReply size={13} />
          {existingAnswer ? "Edit Answer" : "Give Answer"}
        </button>
      )}
    </div>
  );
}
