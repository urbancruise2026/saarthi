import { useRef, useState } from "react";
import {
  ChevronDown,
  Film,
  Loader2,
  PlayCircle,
  Presentation,
  UploadCloud,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type {
  TrainingCategory,
  TrainingModule,
} from "@/redux/features/TrainingModule/traininModuleApi";
import { uploadTrainingModule } from "@/redux/features/TrainingModule/trainingModuleSlice";
import {
  MAX_PPT_MB,
  MAX_VIDEO_MB,
  MODULE_OPTIONS,
  type ModuleKey,
} from "./constants";
import { getFileType } from "./utils";
import type { Department, SubDepartment } from "./types";

export default function AddModuleModal({
  defaultDepartment,
  defaultSubDepartment,
  defaultCategory,
  defaultModuleKey,
  onUploaded,
  onClose,
}: {
  defaultDepartment: Department;
  defaultSubDepartment: SubDepartment;
  defaultCategory: TrainingCategory;
  defaultModuleKey?: ModuleKey;
  onUploaded: (module: TrainingModule) => void;
  onClose: () => void;
}) {
  const [department, setDepartment] = useState<Department>(defaultDepartment);
  const [subDepartment, setSubDepartment] =
    useState<SubDepartment>(defaultSubDepartment);
  const [category, setCategory] = useState<TrainingCategory>(defaultCategory);
  const [moduleKey, setModuleKey] = useState<ModuleKey | "">(
    defaultModuleKey ?? "",
  );
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const { uploading, uploadProgress: progress } = useAppSelector(
    (state) => state.trainingModule,
  );
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isLeadVideo = category === "lead_video";

  const changeCategory = (c: TrainingCategory) => {
    setCategory(c);
    setFile(null); // category badli to purani file hata do
    setError("");
  };

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const type = getFileType(f);

    if (!type) {
      setError(
        isLeadVideo
          ? "Sirf video (mp4, mov, webm) select karein."
          : "Sirf PPT (ppt, pptx) ya video select karein.",
      );
      return;
    }
    if (isLeadVideo && type !== "video") {
      setError("Lead Video me sirf video upload ho sakti hai.");
      return;
    }

    const maxMb = type === "video" ? MAX_VIDEO_MB : MAX_PPT_MB;
    if (f.size > maxMb * 1024 * 1024) {
      setError(
        `${type === "video" ? "Video" : "PPT"} ${maxMb} MB se chhota hona chahiye.`,
      );
      return;
    }
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!department) return setError("Department select karein.");
    if (!subDepartment) return setError("Sub Department select karein.");
    if (!moduleKey)
      return setError("Module select karein (kis module ki video hai).");
    if (!file) return setError("Upload karne ke liye file select karein.");

    setError("");

    try {
      const saved = await dispatch(
        uploadTrainingModule({
          department,
          subDepartment,
          category,
          moduleKey,
          file,
        }),
      ).unwrap();
      onUploaded(saved);
    } catch (err) {
      setError(typeof err === "string" ? err : "Upload fail ho gaya.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={uploading ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add training module"
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Add Training Module
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Pehle Lead Video ya Lead PPT chunein, phir file upload karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-5 px-6 py-5">
          {/* CATEGORY BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => changeCategory("lead_video")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-bold transition disabled:opacity-60 ${
                isLeadVideo
                  ? "border-blue-700 bg-blue-50 text-blue-800"
                  : "border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              <PlayCircle size={22} />
              Lead Video
              <span className="text-[11px] font-semibold opacity-70">
                Sirf Video
              </span>
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={() => changeCategory("lead_ppt")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-bold transition disabled:opacity-60 ${
                !isLeadVideo
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-slate-200 text-slate-600 hover:border-orange-300"
              }`}
            >
              <Presentation size={22} />
              Lead PPT
              <span className="text-[11px] font-semibold opacity-70">
                PPT / Video
              </span>
            </button>
          </div>

          {/* DEPARTMENT + SUB DEPARTMENT */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Department
              </label>
              <div className="relative">
                <select
                  value={department}
                  disabled={uploading}
                  onChange={(e) => {
                    setDepartment(e.target.value as Department);
                    setSubDepartment("");
                    setError("");
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                >
                  <option value="">Select Department</option>
                  <option value="sales">Sales</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-3 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Sub Department
              </label>
              <div className="relative">
                <select
                  value={subDepartment}
                  disabled={!department || uploading}
                  onChange={(e) => {
                    setSubDepartment(e.target.value as SubDepartment);
                    setError("");
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">Select Sub Department</option>
                  {department === "sales" && (
                    <>
                      <option value="presales">Pre-Sales</option>
                      <option value="telesales">Tele-Sales</option>
                    </>
                  )}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-3 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* MODULE */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Module (kis module me upload karna hai)
            </label>
            <div className="relative">
              <select
                value={moduleKey}
                disabled={uploading}
                onChange={(e) => {
                  setModuleKey(e.target.value as ModuleKey | "");
                  setError("");
                }}
                className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
              >
                <option value="">Select Module</option>
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-3 text-slate-400"
              />
            </div>
          </div>

          {/* FILE PICKER */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              {isLeadVideo ? "Lead Video File" : "Lead PPT File (PPT / Video)"}
            </label>

            <input
              ref={inputRef}
              type="file"
              accept={isLeadVideo ? "video/*" : "video/*,.ppt,.pptx,.pps,.ppsx"}
              className="hidden"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = ""; // same file dobara chun sakein
              }}
            />

            {!file ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-green-500 hover:bg-green-50"
              >
                <UploadCloud size={32} className="mb-2 text-green-600" />
                <span className="text-sm font-bold text-slate-700">
                  {isLeadVideo
                    ? "Video yahan drop karein ya click karke chunein"
                    : "PPT ya Video yahan drop karein ya click karke chunein"}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Video: MP4, MOV, WEBM · max {MAX_VIDEO_MB} MB
                  {!isLeadVideo && (
                    <>
                      <br />
                      PPT: PPT, PPTX · max {MAX_PPT_MB} MB
                    </>
                  )}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {getFileType(file) === "ppt" ? (
                  <Presentation
                    size={22}
                    className="shrink-0 text-orange-600"
                  />
                ) : (
                  <Film size={22} className="shrink-0 text-blue-700" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Remove file"
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {uploading && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                  <span>
                    {progress < 100
                      ? "Server pe upload ho raha hai..."
                      : "Cloudinary pe save ho raha hai..."}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
