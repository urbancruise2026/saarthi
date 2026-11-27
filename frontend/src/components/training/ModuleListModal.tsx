import { useEffect } from "react";
import { Film, Loader2, Presentation, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { TrainingCategory } from "@/redux/features/TrainingModule/traininModuleApi";
import {
  fetchTrainingModules,
  removeTrainingModule,
} from "@/redux/features/TrainingModule/trainingModuleSlice";
import {
  CATEGORY_LABEL,
  DEPARTMENT_LABEL,
  SUB_DEPARTMENT_LABEL,
  MODULE_LABEL,
  type ModuleKey,
} from "./constants";
import { downloadUrl, formatDate, officeViewerUrl } from "./utils";
import VideoPlayer from "./VideoPlayer";

export default function ModuleListModal({
  department,
  subDepartment,
  category,
  moduleKey,
  onClose,
}: {
  department: string;
  subDepartment: string;
  category: TrainingCategory;
  moduleKey: ModuleKey;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const { modules, loading } = useAppSelector((state) => state.trainingModule);
  const isLeadVideo = category === "lead_video";

  useEffect(() => {
    dispatch(
      fetchTrainingModules({ department, subDepartment, category, moduleKey }),
    );
  }, [dispatch, department, subDepartment, category, moduleKey]);

  // modules undefined ho to crash (blank screen) na ho
  const items = (modules ?? []).filter(
    (m) =>
      m.department === department &&
      m.subDepartment === subDepartment &&
      m.category === category &&
      m.moduleKey === moduleKey,
  );

  const handleDelete = async (id: number) => {
    if (!window.confirm("Is file ko delete karna hai?")) return;
    try {
      await dispatch(removeTrainingModule(id)).unwrap();
    } catch (err) {
      window.alert(typeof err === "string" ? err : "Delete fail hua.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${CATEGORY_LABEL[category]} - ${MODULE_LABEL[moduleKey]}`}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-slate-900">
              {isLeadVideo ? (
                <Film size={20} className="text-blue-700" />
              ) : (
                <Presentation size={20} className="text-orange-500" />
              )}
              {CATEGORY_LABEL[category]} – {MODULE_LABEL[moduleKey]} –{" "}
              {DEPARTMENT_LABEL[department] ?? department} /{" "}
              {SUB_DEPARTMENT_LABEL[subDepartment] ?? subDepartment}
            </h3>
            {!loading && (
              <p className="mt-0.5 text-sm text-slate-500">
                {items.length} file{items.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Files load ho rahi hain...
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
              Abhi koi file upload nahi hui. &quot;Add Training Module&quot; se
              add karein.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((m) =>
                m.fileType === "video" ? (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <VideoPlayer url={m.fileUrl} />
                    <div className="relative px-3 py-2.5 pr-11">
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        aria-label="Delete video"
                        title="Delete video"
                        className="absolute right-2 top-2.5 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="truncate text-sm font-bold text-slate-800">
                        {m.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(m.createdAt)}
                        {m.duration
                          ? ` · ${Math.floor(m.duration / 60)}m ${Math.round(m.duration % 60)}s`
                          : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                      <Presentation size={22} className="text-orange-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {m.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(m.createdAt)}
                      </p>
                    </div>

                    <a
                      href={officeViewerUrl(m.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-orange-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
                    >
                      View
                    </a>
                    <a
                      href={downloadUrl(m.fileUrl)}
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      aria-label="Delete PPT"
                      title="Delete PPT"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
