import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Eye,
  BookOpen,
  Shield,
  Users,
  Briefcase,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchPolicies,
  updateHrPolicyStatus,
  updateShoPolicyStatus,
} from "@/redux/features/policy/policySlice";

import * as pdfjsLib from "pdfjs-dist";
import { Policy } from "@/types";
// Vite-friendly worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).href;

const CATEGORY_ICONS: Record<string, any> = {
  HR: Users,
  Compliance: Shield,
  Finance: Briefcase,
  IT: BookOpen,
};

const STATUS_COLORS = {
  active: { bg: "hsl(var(--success) / 0.12)", color: "hsl(var(--success))" },
  pending: { bg: "hsl(var(--warning) / 0.12)", color: "hsl(var(--warning))" },
  inactive: { bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" },
};

const APPROVAL_STATUS_COLORS = {
  approved: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    icon: CheckCircle,
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: XCircle,
  },
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: Loader2,
  },
};

export default function HRPolicies() {
  const [categoryFilter, setCategoryFilter] = useState("");
  // Saari categories yaad rakhne ke liye (taaki filter lagane par dropdown se options gayab na ho)
  const [knownCategories, setKnownCategories] = useState<string[]>([]);

  // PDF viewer state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    policyId: number | null;
    role: "HR" | "SHO" | null;
  }>({
    open: false,
    policyId: null,
    role: null,
  });

  const [remarkInput, setRemarkInput] = useState("");

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { policies } = useAppSelector((state) => state.policy);
  const { currentEmployee } = useAppSelector((state) => state.user);

  const accessRole = currentEmployee?.access_role;
  const department = currentEmployee?.department;

  const isHRDepartment = department?.toLowerCase() === "hr";

  const isTableView =
    accessRole === "SUPER_ADMIN" ||
    (isHRDepartment && (accessRole === "MANAGER" || accessRole === "HOD"));

  const permissions = {
    view: isTableView ? "table" : "card",
    canApproveHR:
      isHRDepartment && (accessRole === "MANAGER" || accessRole === "HOD"),
    canApproveSHO: accessRole === "SUPER_ADMIN",
  };

  const isEmployee = permissions.view === "card";
  const isHRHead = permissions.canApproveHR;
  const isSHO = permissions.canApproveSHO;

  // Koi category select nahi hai to bhi "all" fetch hota hai, sirf dropdown ki
  // categories nikalne ke liye. Screen par kuch tab tak nahi dikhta jab tak category select na ho.
  useEffect(() => {
    dispatch(fetchPolicies(categoryFilter || "all"));
  }, [dispatch, categoryFilter]);

  // Jab koi category select nahi hai, saari categories yaad rakh lo
  useEffect(() => {
    if (categoryFilter === "") {
      setKnownCategories(
        Array.from(
          new Set(policies.filter((p) => p?.category).map((p) => p.category)),
        ),
      );
    }
  }, [policies, categoryFilter]);

  // Security: block print/screenshot/devtools ONLY when PDF viewer is open
  useEffect(() => {
    if (!viewerUrl) return;

    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && ["p", "s", "u"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        (e.metaKey && ["p", "s"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    const disableRightClick = (e: MouseEvent) => e.preventDefault();
    const disableDrag = (e: DragEvent) => e.preventDefault();
    const disableSelect = (e: Event) => e.preventDefault();

    document.addEventListener("keydown", handleKey);
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("dragstart", disableDrag);
    document.addEventListener("selectstart", disableSelect);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("dragstart", disableDrag);
      document.removeEventListener("selectstart", disableSelect);
    };
  }, [viewerUrl]);

  // Render ALL pages when a PDF URL is set
  useEffect(() => {
    if (!viewerUrl) return;

    setPages([]);
    setTotalPages(0);
    setCurrentPage(1);
    setLoadingProgress(0);
    setLoading(true);

    const renderAll = async () => {
      try {
        const pdfDoc = await pdfjsLib.getDocument(viewerUrl).promise;
        const numPages = pdfDoc.numPages;
        setTotalPages(numPages);

        const rendered: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;

          await page.render({ canvasContext: ctx, viewport }).promise;

          // Watermark
          ctx.save();
          ctx.font = "bold 36px Arial";
          ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
          ctx.translate(viewport.width / 2, viewport.height / 2);
          ctx.rotate(-0.4);
          ctx.textAlign = "center";
          ctx.fillText("Confidential • HR Policy", 0, 0);
          ctx.restore();

          rendered.push(canvas.toDataURL("image/jpeg", 0.92));
          setLoadingProgress(Math.round((i / numPages) * 100));
        }

        setPages(rendered);
      } catch (err) {
        console.error("PDF render error:", err);
      } finally {
        setLoading(false);
      }
    };

    renderAll();
  }, [viewerUrl]);

  // Track current page based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const center = scrollTop + containerHeight / 2;

      let closestPage = 1;
      let closestDist = Infinity;

      pageRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const midpoint = ref.offsetTop + ref.offsetHeight / 2;
        const dist = Math.abs(center - midpoint);
        if (dist < closestDist) {
          closestDist = dist;
          closestPage = idx + 1;
        }
      });

      setCurrentPage(closestPage);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pages]);

  const scrollToPage = (pageNum: number) => {
    const ref = pageRefs.current[pageNum - 1];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const closeViewer = () => {
    setViewerUrl(null);
    setViewerTitle("");
    setCurrentPolicy(null);
    setPages([]);
    setTotalPages(0);
    setCurrentPage(1);
  };

  const openViewer = (policy: Policy) => {
    setViewerTitle(policy.title);
    setViewerUrl(policy.fileUrl);
    setCurrentPolicy(policy);
  };

  const handleHRAction = async (
    policyId: number,
    action: "approved" | "rejected",
    remark?: string,
  ) => {
    if (action === "rejected" && !remark) {
      alert("Please provide a remark");
      return;
    }

    setActionLoading(policyId.toString());

    try {
      await dispatch(
        updateHrPolicyStatus({
          id: policyId,
          hr_head_status: action,
          hr_head_remark: remark || "",
        }),
      );

      dispatch(fetchPolicies(categoryFilter || "all"));
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSHOAction = async (
    policyId: number,
    action: "approved" | "rejected",
    remark?: string,
  ) => {
    if (action === "rejected" && !remark) {
      alert("Please provide a remark");
      return;
    }

    setActionLoading(policyId.toString());

    try {
      await dispatch(
        updateShoPolicyStatus({
          id: policyId,
          sho_status: action,
          sho_remark: remark || "",
        }),
      );

      dispatch(fetchPolicies(categoryFilter || "all"));
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const categories = knownCategories;

  // Employee: category select hone par hi policies dikhengi.
  // HR / Super Admin (table view): default me sab dikhengi, category chunne par filter hoga.
  const categoryPolicies = categoryFilter
    ? policies.filter((p) => p?.category === categoryFilter)
    : isEmployee
      ? []
      : policies;

  const filteredPolicies = categoryPolicies.filter((p) => {
    if (!p || !p.title) return false;
    // Employee ko sirf "active" status wali policies dikhengi
    if (isEmployee && p.status !== "active") return false;
    return true;
  });

  const emptyMessage =
    categoryFilter || !isEmployee
      ? "No policies found"
      : "Select a category to view policies";

  const getApprovalStatusBadge = (status: string | null) => {
    const statusKey = status || "pending";
    const config =
      APPROVAL_STATUS_COLORS[statusKey as keyof typeof APPROVAL_STATUS_COLORS];
    const BadgeIcon =
      statusKey === "approved"
        ? CheckCircle
        : statusKey === "rejected"
          ? XCircle
          : Clock;

    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <BadgeIcon size={12} className="shrink-0" />
        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header banner — peach gradient with green accent, matching Attendance Management */}
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-l-4 border-l-green-600 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-green-700">HR Policies</h1>
        <p className="text-sm text-orange-600/80 mt-1">
          Company policies, guidelines and compliance documents
        </p>
      </div>

      {/* Stats — colour-filled pill cards, same treatment as the attendance summary row */}
      {!isEmployee && (
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Active Policies",
              value: categoryPolicies.filter((p) => p?.status).length,
              icon: CheckCircle,
              bg: "bg-sky-200",
              iconBg: "bg-white/60",
              iconColor: "text-sky-600",
              ghost: "text-sky-200",
              label_c: "text-gray-700",
              value_c: "text-gray-700",
            },
            {
              label: "Active Policies",
              value: categoryPolicies.filter((p) => p?.status === "active")
                .length,
              icon: CheckCircle,
              bg: "bg-green-200",
              iconBg: "bg-white/60",
              iconColor: "text-green-600",
              ghost: "text-green-200",
              label_c: "text-gray-700",
              value_c: "text-gray-700",
            },
            {
              label: "Pending Policies",
              value: categoryPolicies.filter((p) => p?.status === "pending")
                .length,
              icon: Clock,
              bg: "bg-yellow-200",
              iconBg: "bg-white/60",
              iconColor: "text-yellow-600",
              ghost: "text-yellow-200",
              label_c: "text-gray-700",
              value_c: "text-gray-700",
            },
            {
              label: "Inactive",
              value: categoryPolicies.filter((p) => p?.status === "inactive")
                .length,
              icon: Ban,
              bg: "bg-red-200",
              iconBg: "bg-white/60",
              iconColor: "text-red-600",
              ghost: "text-red-200",
              label_c: "text-gray-700",
              value_c: "text-gray-700",
            },
          ].map(
            ({
              label,
              value,
              icon: Icon,
              bg,
              iconBg,
              iconColor,
              ghost,
              label_c,
              value_c,
            }) => (
              <div
                key={label + bg}
                className={`relative overflow-hidden rounded-2xl ${bg} p-5 shadow-sm`}
              >
                {/* large ghost icon for visual balance on the right */}
                <Icon
                  size={88}
                  strokeWidth={1.5}
                  className={`absolute -right-3 -bottom-3 ${ghost}`}
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={20} className={iconColor} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${label_c}`}>{label}</p>
                    <p
                      className={`text-3xl font-bold leading-tight ${value_c}`}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Category Filter Dropdown */}
      <div className="rounded-2xl bg-card p-3 flex items-end justify-end gap-3">
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 min-w-48 rounded-lg border border-input bg-background px-3 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">
            {isEmployee ? "Select category" : "All Categories"}
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* EMPLOYEE CARD VIEW */}
      {isEmployee ? (
        <div>
          <style>{`
            @keyframes policyCardSlideIn {
              from { opacity: 0; transform: translate(60px, 50px); }
              to { opacity: 1; transform: translate(0, 0); }
            }
            .policy-card-in {
              animation: policyCardSlideIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
            }
            @media (prefers-reduced-motion: reduce) {
              .policy-card-in { animation: none; }
            }
          `}</style>

          {filteredPolicies.length > 0 && (
            <p className="mb-3 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredPolicies.length}
              </span>{" "}
              {filteredPolicies.length === 1 ? "policy" : "policies"} in{" "}
              <span className="font-semibold text-green-700">
                {categoryFilter}
              </span>
            </p>
          )}

          <div
            key={categoryFilter}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 font-sans antialiased"
          >
            {filteredPolicies.map((policy, index) => {
              const Icon = CATEGORY_ICONS[policy.category] || FileText;

              return (
                <div
                  key={policy.id}
                  style={{ animationDelay: `${index * 120}ms` }}
                  className="policy-card-in group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-lg"
                >
                  {/* accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 ring-4 ring-green-50">
                        <Icon size={22} className="text-green-700" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold leading-snug tracking-tight text-slate-900 line-clamp-2">
                          {policy.title}
                        </h3>
                        <span className="mt-1.5 inline-flex max-w-full items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          <span className="truncate">{policy.category}</span>
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 min-h-[60px] text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {policy.description || "No description available"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="text-xs text-slate-500">Version</p>
                        <p className="mt-0.5 text-sm font-semibold text-sky-700 tabular-nums">
                          v{policy.version}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Last updated</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-800 tabular-nums">
                          {new Date(policy.lastUpdated).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => openViewer(policy)}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    >
                      <Eye size={16} />
                      View policy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPolicies.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <FileText size={26} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                {emptyMessage}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* OTHER ROLES TABLE VIEW — own card, separated from the stats/toolbar above */
        <div className="rounded-2xl border border-slate-200 bg-card overflow-hidden shadow-md">
          {/* Card header: title + count */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-green-700" />
              <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
                {categoryFilter ? `${categoryFilter} Policies` : "All Policies"}
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-0.5">
              {filteredPolicies.length}{" "}
              {filteredPolicies.length === 1 ? "policy" : "policies"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-sans antialiased">
              <thead className="bg-green-800 sticky top-0 z-10">
                <tr>
                  {[
                    "Title",
                    "Category",
                    "Description",
                    "Version",
                    "Last Updated",
                    "Status",
                    "HR Head Status",
                    "HR Remark",
                    "CEO Status",
                    "CEO Remark",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3.5 text-[13px] font-semibold tracking-wide text-white whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPolicies.map((policy) => {
                  const Icon = CATEGORY_ICONS[policy.category] || FileText;
                  const sc =
                    STATUS_COLORS[policy.status] ?? STATUS_COLORS["pending"];

                  return (
                    <tr
                      key={policy.id}
                      className="odd:bg-white even:bg-slate-50/60 hover:bg-green-50/60 transition-colors"
                    >
                      {/* Title */}
                      <td className="px-4 py-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <Icon size={16} className="text-green-700" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 leading-snug">
                            {policy.title}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize whitespace-nowrap">
                          {policy.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4">
                        <p className="text-[13px] leading-relaxed text-slate-600 line-clamp-2 max-w-xs">
                          {policy.description || "-"}
                        </p>
                      </td>

                      {/* Version */}
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md bg-sky-50 border border-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 tabular-nums">
                          v{policy.version}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-4">
                        <span className="text-[13px] text-slate-600 whitespace-nowrap tabular-nums">
                          {new Date(policy.lastUpdated).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: sc.color }}
                          />
                          {policy.status}
                        </span>
                      </td>

                      {/* HR Head Status */}
                      <td className="px-4 py-4">
                        {getApprovalStatusBadge(policy.hr_head_status)}
                      </td>

                      {/* HR Remark: only when rejected */}
                      <td className="px-4 py-4">
                        {policy.hr_head_status === "rejected" &&
                        policy.hr_head_remark ? (
                          <span className="inline-flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg max-w-[180px] break-words leading-snug">
                            <XCircle size={12} className="shrink-0 mt-0.5" />
                            {policy.hr_head_remark}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>

                      {/* CEO Status */}
                      <td className="px-4 py-4">
                        {getApprovalStatusBadge(policy.sho_status)}
                      </td>

                      {/* CEO Remark: only when rejected */}
                      <td className="px-4 py-4">
                        {policy.sho_status === "rejected" &&
                        policy.sho_remark ? (
                          <span className="inline-flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg max-w-[180px] break-words leading-snug">
                            <XCircle size={12} className="shrink-0 mt-0.5" />
                            {policy.sho_remark}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewer(policy)}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                            title="View PDF"
                          >
                            <Eye size={16} />
                          </button>

                          {/* HR Head Actions */}
                          {isHRHead && policy.hr_head_status === "pending" && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleHRAction(policy.id, "approved")
                                }
                                className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                                title="Approve as HR Head"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    open: true,
                                    policyId: policy.id,
                                    role: "HR",
                                  })
                                }
                                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                                title="Reject as HR Head"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}

                          {/* SHO Actions - only after HR Head approved */}
                          {isSHO &&
                            policy.hr_head_status === "approved" &&
                            policy.sho_status === "pending" && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    handleSHOAction(policy.id, "approved")
                                  }
                                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                                  title="Approve as SHO"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    setRejectModal({
                                      open: true,
                                      policyId: policy.id,
                                      role: "SHO",
                                    })
                                  }
                                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                                  title="Reject as SHO"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}

                          {actionLoading === policy.id.toString() && (
                            <Loader2
                              size={16}
                              className="animate-spin text-green-700"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredPolicies.length === 0 && (
            <div className="text-center py-14 bg-white">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText size={26} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                {emptyMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewerUrl && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[97vh] bg-white dark:bg-zinc-900 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
                <span className="text-sm font-medium text-foreground truncate">
                  {viewerTitle}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Page counter */}
                {totalPages > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <button
                      onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <span className="font-mono min-w-[60px] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        scrollToPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                )}

                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Confidential
                </span>

                <button
                  onClick={closeViewer}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PDF Content */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto bg-zinc-200 dark:bg-zinc-800 select-none"
            >
              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                  <Loader2 size={32} className="animate-spin" />
                  <div className="text-sm">
                    Loading PDF...{" "}
                    {loadingProgress > 0 && `${loadingProgress}%`}
                  </div>
                  {totalPages > 0 && (
                    <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Pages */}
              {!loading && pages.length > 0 && (
                <div className="flex flex-col items-center gap-4 py-6 px-4">
                  {pages.map((src, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        pageRefs.current[i] = el;
                      }}
                      className="relative w-full max-w-3xl"
                    >
                      <div className="absolute -top-5 left-0 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        Page {i + 1}
                      </div>

                      <img
                        src={src}
                        alt={`Page ${i + 1}`}
                        className="w-full rounded shadow-lg block pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  ))}

                  <div className="text-xs text-zinc-400 dark:text-zinc-600 pb-2">
                    — End of document ({totalPages} page
                    {totalPages !== 1 ? "s" : ""}) —
                  </div>
                </div>
              )}

              {/* Error / empty */}
              {!loading && pages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground text-sm">
                  <FileText size={32} className="opacity-40" />
                  <p>Unable to load PDF.</p>
                </div>
              )}
            </div>

            {/* Footer progress bar (while loading) */}
            {loading && totalPages > 0 && (
              <div className="h-1 bg-muted shrink-0">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">
              Reject Policy ({rejectModal.role})
            </h2>

            <textarea
              value={remarkInput}
              onChange={(e) => setRemarkInput(e.target.value)}
              placeholder="Enter rejection remark..."
              className="w-full h-24 p-2 border rounded-md text-sm"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRejectModal({ open: false, policyId: null, role: null });
                  setRemarkInput("");
                }}
                className="px-3 py-1.5 text-sm rounded bg-muted"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!remarkInput.trim()) {
                    alert("Remark is required");
                    return;
                  }

                  if (rejectModal.role === "HR") {
                    handleHRAction(
                      rejectModal.policyId!,
                      "rejected",
                      remarkInput,
                    );
                  } else {
                    handleSHOAction(
                      rejectModal.policyId!,
                      "rejected",
                      remarkInput,
                    );
                  }

                  setRejectModal({ open: false, policyId: null, role: null });
                  setRemarkInput("");
                }}
                className="px-3 py-1.5 text-sm rounded bg-red-600 text-white"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
