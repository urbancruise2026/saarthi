import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  RefreshCw,
  ChevronDown,
  Calendar,
  BookOpen,
  CheckCircle2,
  MessageCircleQuestion,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchAllReviews } from "@/redux/features/TrainingReview/trainingReviewSlice";
import { getTrainingQueries } from "@/redux/features/trainingQuery/trainingQuerySlice"; // path apne hisaab se
import QueryAnswerButton from "./Query/QueryAnswerButton"; // path apne hisaab se

const TOTAL_DAYS = 8;

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

// Employee ki unique key
const getKey = (r: any) =>
  String(r.employeeId ?? r.userId ?? r.employeeCode ?? r.employeeName);

const AVATAR_COLORS = [
  "bg-emerald-700",
  "bg-blue-600",
  "bg-purple-600",
  "bg-teal-600",
  "bg-orange-500",
  "bg-rose-600",
];

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const avatarColor = (name?: string) => {
  const n = (name ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

const understoodStyle = (v?: string) =>
  v === "yes"
    ? "bg-green-100 text-green-700"
    : v === "partially"
      ? "bg-orange-100 text-orange-600"
      : "bg-red-100 text-red-600";

// ---- Queries ko flat list me convert karo ----
// DayQueries ka shape: [{ day, modules: [{ moduleName, queries: [...] }] }]
// Agar aapke field naam alag hain to sirf yahan badlo.
type FlatQuery = {
  id: string;
  day?: number;
  moduleName?: string;
  question: string;
  date?: string;
  ownerKey?: string;
  answer?: string;
  answeredAt?: string;
};

const normalizeQueries = (groups: any[]): FlatQuery[] => {
  const out: FlatQuery[] = [];
  (groups ?? []).forEach((g: any) => {
    (g.modules ?? []).forEach((m: any) => {
      (m.queries ?? m.questions ?? []).forEach((q: any, idx: number) => {
        out.push({
          id: String(q.id ?? `${g.day}-${m.moduleName}-${idx}`),
          day: g.day,
          moduleName: m.moduleName ?? m.module ?? m.name,
          question: q.question ?? q.query ?? q.text ?? "",
          date: q.createdAt ?? q.date ?? q.raisedAt,
          ownerKey:
            (q.employeeId ?? q.userId ?? q.employeeCode ?? q.employeeName)
              ? String(
                  q.employeeId ?? q.userId ?? q.employeeCode ?? q.employeeName,
                )
              : undefined,
          answer: q.answer ?? q.reply ?? q.response ?? undefined,
          answeredAt: q.answeredAt ?? q.repliedAt ?? undefined,
        });
      });
    });
  });
  return out;
};

export default function TrainingTrackTable() {
  const dispatch = useAppDispatch();
  const { rows, total, page, limit, loading, error } = useAppSelector(
    (s) => s.trainingReview.track,
  );
  const { groups: queryGroups, fetching: queriesLoading } = useAppSelector(
    (s) => s.trainingQuery,
  );

  const [search, setSearch] = useState("");
  const [subDept, setSubDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const refetch = () =>
    dispatch(
      fetchAllReviews({
        subDepartment: subDept || undefined,
        search: search.trim() || undefined,
        page: currentPage,
        limit: 20,
      }),
    );

  useEffect(() => {
    const t = setTimeout(refetch, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search, subDept, currentPage]);

  // Questions ek baar load karo
  useEffect(() => {
    dispatch(getTrainingQueries(undefined));
  }, [dispatch]);

  const allQueries = useMemo(
    () => normalizeQueries(queryGroups as any[]),
    [queryGroups],
  );

  // Rows ko employee wise group karo
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; info: any; reviews: any[] }>();
    rows.forEach((r: any) => {
      const key = getKey(r);
      if (!map.has(key)) map.set(key, { key, info: r, reviews: [] });
      map.get(key)!.reviews.push(r);
    });
    return Array.from(map.values()).map((g) => ({
      ...g,
      reviews: [...g.reviews].sort((a, b) => Number(a.day) - Number(b.day)),
    }));
  }, [rows]);

  // Ek employee ke questions -> date wise group
  const queriesByDate = (g: { key: string; reviews: any[] }) => {
    const hasOwner = allQueries.some((q) => q.ownerKey);
    const days = new Set(g.reviews.map((r) => Number(r.day)));
    const mine = allQueries.filter((q) =>
      hasOwner ? q.ownerKey === g.key : days.has(Number(q.day)),
    );

    const map = new Map<string, FlatQuery[]>();
    mine.forEach((q) => {
      const k = formatDate(q.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(q);
    });
    return Array.from(map.entries());
  };

  const toggle = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const totalPages = Math.max(Math.ceil(total / (limit || 20)), 1);

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Training Track Table
          </h2>
          <p className="text-sm text-slate-500">
            Employees: {groups.length} · Total reviews: {total}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-3 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name / code / module"
              className="h-10 w-60 rounded-lg border border-slate-200 pl-8 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <select
            value={subDept}
            onChange={(e) => {
              setSubDept(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-green-600"
          >
            <option value="">All Sub Departments</option>
            <option value="presales">Pre-Sales</option>
            <option value="telesales">Tele-Sales</option>
          </select>

          <button
            type="button"
            onClick={() => {
              refetch();
              dispatch(getTrainingQueries(undefined));
            }}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">
          No data found
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-green-800 text-md font-semibold text-white">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Emp Code</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Sub Dept</th>
                  <th className="px-4 py-3">Days Completed</th>
                  <th className="px-4 py-3">Last Review</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {groups.map((g, i) => {
                  const isOpen = !!expanded[g.key];
                  const doneDays = new Set(g.reviews.map((r) => Number(r.day)));
                  const count = doneDays.size;
                  const pct = Math.min((count / TOTAL_DAYS) * 100, 100);
                  const lastReview = g.reviews.reduce((a, b) =>
                    new Date(b.completedAt).getTime() >
                    new Date(a.completedAt).getTime()
                      ? b
                      : a,
                  );
                  const qByDate = isOpen ? queriesByDate(g) : [];

                  return (
                    <Fragment key={g.key}>
                      {/* EMPLOYEE ROW */}
                      <tr
                        onClick={() => toggle(g.key)}
                        className={`cursor-pointer hover:bg-slate-50 ${
                          isOpen ? "bg-green-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-4 text-slate-600">
                          {(page - 1) * limit + i + 1}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(
                                g.info.employeeName,
                              )}`}
                            >
                              {initials(g.info.employeeName)}
                            </div>
                            <div>
                              <p className="font-bold text-lg text-slate-900.">
                                {g.info.employeeName ?? "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {g.info.employeeCode ?? "-"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {g.info.department ?? "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              g.info.subDepartment === "presales"
                                ? "bg-green-100 text-green-700"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {g.info.subDepartment === "presales"
                              ? "Pre-Sales"
                              : "Tele-Sales"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="mb-1 text-sm font-bold text-slate-800">
                            {count} / {TOTAL_DAYS}
                          </p>
                          <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-green-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-start gap-2">
                            <Calendar
                              size={14}
                              className="mt-0.5 text-green-700"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">
                                {formatDate(lastReview.completedAt)}
                              </p>
                              <p className="text-xs text-slate-500">
                                Day {lastReview.day}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(
                              { length: TOTAL_DAYS },
                              (_, n) => n + 1,
                            ).map((d) => (
                              <span
                                key={d}
                                className={`flex h-6 min-w-[28px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                                  doneDays.has(d)
                                    ? "bg-green-600 text-white"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                D{d}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                              isOpen
                                ? "border-green-700 bg-green-700 text-white"
                                : "border-slate-300 text-slate-600"
                            }`}
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </span>
                        </td>
                      </tr>

                      {/* EXPANDED PANEL */}
                      {isOpen && (
                        <tr>
                          <td colSpan={8} className="bg-green-50/60 px-4 py-4">
                            {/* REVIEW DETAILS */}
                            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                                  <BookOpen size={16} />
                                  Day-wise Training Review Details
                                </div>
                                <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700">
                                  <CheckCircle2 size={14} />
                                  {count} Days Completed
                                </span>
                              </div>

                              <div className="overflow-x-auto rounded-lg bg-white">
                                <table className="w-full min-w-[900px] text-left text-sm">
                                  <thead className="bg-green-50 text-xs font-semibold text-slate-600">
                                    <tr>
                                      <th className="px-4 py-2.5">Day</th>
                                      <th className="px-4 py-2.5">Module</th>
                                      <th className="px-4 py-2.5">
                                        Understood
                                      </th>
                                      <th className="px-4 py-2.5">Learned</th>
                                      <th className="px-4 py-2.5">
                                        Suggestions
                                      </th>
                                      <th className="px-4 py-2.5">
                                        Assistance
                                      </th>
                                      <th className="px-4 py-2.5">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {g.reviews.map((r) => (
                                      <tr key={r.id}>
                                        <td className="px-4 py-2.5">
                                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                            Day {r.day}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                          {r.moduleName ?? "-"}
                                        </td>
                                        <td className="px-4 py-2.5">
                                          <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${understoodStyle(
                                              r.understood,
                                            )}`}
                                          >
                                            {r.understood}
                                          </span>
                                        </td>
                                        <td
                                          className="max-w-[220px] truncate px-4 py-2.5"
                                          title={r.learned}
                                        >
                                          {r.learned}
                                        </td>
                                        <td
                                          className="max-w-[200px] truncate px-4 py-2.5"
                                          title={r.suggestions ?? ""}
                                        >
                                          {r.suggestions || "-"}
                                        </td>
                                        <td
                                          className="max-w-[200px] truncate px-4 py-2.5"
                                          title={r.assistanceDetails ?? ""}
                                        >
                                          {r.assistance === "yes"
                                            ? r.assistanceDetails || "Yes"
                                            : "No"}
                                        </td>
                                        <td className="px-4 py-2.5">
                                          {formatDate(r.completedAt)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* QUERIES: DATE WISE */}
                            <div className="mt-4 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
                              {/* HEADER */}
                              <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-3">
                                <div className="flex items-center gap-2.5 text-white">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                                    <MessageCircleQuestion size={18} />
                                  </span>
                                  <div>
                                    <p className="text-sm font-bold leading-tight">
                                      Questions Raised
                                    </p>
                                    <p className="text-[11px] text-white/80">
                                      Date wise timeline
                                    </p>
                                  </div>
                                </div>

                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700">
                                  {qByDate.reduce(
                                    (sum, [, list]) => sum + list.length,
                                    0,
                                  )}{" "}
                                  Total
                                </span>
                              </div>

                              {/* BODY */}
                              <div className="bg-amber-50/40 p-4">
                                {queriesLoading ? (
                                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                    Loading questions...
                                  </div>
                                ) : qByDate.length === 0 ? (
                                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                      <MessageCircleQuestion size={22} />
                                    </span>
                                    <p className="text-sm font-semibold text-slate-700">
                                      Koi question raise nahi hua
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Jab employee question raise karega, yahan
                                      dikhega
                                    </p>
                                  </div>
                                ) : (
                                  <div className="relative space-y-5 pl-6">
                                    {/* vertical line */}
                                    <div className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-amber-200" />

                                    {qByDate.map(([date, list]) => (
                                      <div key={date} className="relative">
                                        {/* dot */}
                                        <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow ring-2 ring-amber-200" />

                                        {/* date row */}
                                        <div className="mb-2 flex items-center gap-2">
                                          <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-amber-100">
                                            <Calendar
                                              size={14}
                                              className="text-amber-600"
                                            />
                                            {date}
                                          </span>
                                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                            {list.length}{" "}
                                            {list.length > 1
                                              ? "questions"
                                              : "question"}
                                          </span>
                                        </div>

                                        {/* question cards */}
                                        <div className="space-y-2">
                                          {list.map((q, idx) => (
                                            <div
                                              key={q.id}
                                              className="flex items-start gap-3 rounded-lg border border-slate-100 border-l-4 border-l-amber-400 bg-white px-3 py-2.5 shadow-sm transition hover:-translate-y-px hover:shadow-md"
                                            >
                                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-extrabold text-amber-700">
                                                Q{idx + 1}
                                              </span>

                                              <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-semibold text-slate-800">
                                                  {q.question}
                                                </p>

                                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                  {q.day != null && (
                                                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                                                      Day {q.day}
                                                    </span>
                                                  )}
                                                  {q.moduleName && (
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                                      {q.moduleName}
                                                    </span>
                                                  )}
                                                  {q.answer && (
                                                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                                      <CheckCircle2 size={11} />
                                                      Answered
                                                    </span>
                                                  )}
                                                </div>

                                                {/* GIVE ANSWER */}
                                                <QueryAnswerButton
                                                  queryId={q.id}
                                                  day={q.day}
                                                  existingAnswer={q.answer}
                                                  answeredAt={q.answeredAt}
                                                />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
