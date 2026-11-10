import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle,
  FilePlus,
  FolderOpen,
  LayoutTemplate,
} from "lucide-react";
import { Employee } from "@/types";
import {
  DocType,
  DOC_TYPE_LABELS,
  generatePDF,
  getFilename,
} from "@/utils/documentGenerators";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";

type MainTab = "generate" | "create" | "manage" | "templates";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "offer-letter", label: "Offer" },
  { value: "confirmation-letter", label: "Confirmation" },
  { value: "increment-letter", label: "Increment" },
  { value: "promotion-letter", label: "Promotion" },
  { value: "relieving-letter", label: "Relieving" },
];

export default function Documents() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>("generate");

  const employees = useAppSelector((s) =>
    s.employees.employees.filter((e) => e.status === "approved"),
  );

  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<DocType>("offer-letter");
  const [generating, setGenerating] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDownload = async (employee: Employee) => {
    const key = `${employee.id}-${docType}`;
    setGenerating(key);
    await new Promise((r) => setTimeout(r, 400));
    const doc = generatePDF(employee, docType);
    doc.save(getFilename(employee, docType));
    setGenerating(null);
    setDone((prev) => new Set(prev).add(key));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>

      {/* ===== MAIN TABS ===== */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: "generate", label: "Generate", icon: FileText },
          { key: "create", label: "Create Letter", icon: FilePlus },
          { key: "manage", label: "Manage Letters", icon: FolderOpen },
          { key: "templates", label: "Templates", icon: LayoutTemplate },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as MainTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                activeTab === key
                  ? "bg-green-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === "generate" && (
        <>
          {/* Doc Type Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit flex-wrap">
            {DOC_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDocType(value)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  docType === value
                    ? "bg-white shadow text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees…"
              className="w-full pl-9 pr-4 h-9 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp) => {
              const key = `${emp.id}-${docType}`;
              const isGenerating = generating === key;
              const isDone = done.has(key);

              return (
                <div
                  key={emp.id}
                  className="rounded-xl border bg-card p-5 space-y-4 shadow-sm"
                >
                  <p className="font-semibold">
                    {emp.firstName} {emp.lastName}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewEmployee(emp)}
                      className="flex-1 py-2 rounded-lg border hover:bg-muted text-sm"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDownload(emp)}
                      disabled={isGenerating}
                      className="flex-1 py-2 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-green-600 to-orange-500"
                    >
                      {isGenerating
                        ? "Generating..."
                        : isDone
                          ? "Done"
                          : "Download"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== CREATE LETTER TAB ===== */}
      {activeTab === "create" && (
        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Create Letter</h2>

            {/* RIGHT SIDE BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/documents/templates")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:opacity-90 transition"
              >
                <LayoutTemplate size={16} />
                Templates
              </button>

              <button
                onClick={() => navigate("/documents/manage")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:opacity-90 transition"
              >
                <FolderOpen size={16} />
                Manage
              </button>
            </div>
          </div>

          <div>Create Letter Page Content Here</div>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          Manage Letters Page Content Here
        </div>
      )}

      {activeTab === "templates" && (
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          Templates Page Content Here
        </div>
      )}

      <DocumentPreviewModal
        open={!!previewEmployee}
        onClose={() => setPreviewEmployee(null)}
        employee={previewEmployee}
        docType={docType}
      />
    </div>
  );
}
