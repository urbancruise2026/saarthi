import { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  deleteLetter,
  updateLetterStatus,
  addLetter,
} from "@/redux/letterSlice";
import {
  DOC_TYPE_LABELS,
  DocType,
  generatePDF,
  getFilename,
} from "@/utils/documentGenerators";
import { Employee } from "@/types";
import { Letter, LetterStatus } from "@/types/letter";
import {
  Search,
  Download,
  Eye,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  Building2,
  User,
  Briefcase,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import OfferLetterPreview from "@/components/DocumentPreview/Offerletterpreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CreateFormData {
  // Employee / job
  employeeName: string;
  designation: string;
  department: string;
  grade: string;
  salaryPackage: string;
  joiningDate: string;
  workLocation: string;
  noticePeriod: string;
  reportingManager: string;
  // Company
  companyName: string;
  companyAddress: string;
  hrName: string;
  hrDesignation: string;
  // Offer terms
  employmentType: string;
  probationPeriod: string;
  acceptDeadline: string;
  // Generation options
  language: string;
  tone: string;
}

const EMPTY_FORM: CreateFormData = {
  employeeName: "",
  designation: "",
  department: "",
  grade: "",
  salaryPackage: "",
  joiningDate: "",
  workLocation: "",
  noticePeriod: "30 days",
  reportingManager: "",
  companyName: "",
  companyAddress: "",
  hrName: "",
  hrDesignation: "HR Manager",
  employmentType: "Full-Time",
  probationPeriod: "3 months",
  acceptDeadline: "",
  language: "English",
  tone: "formal",
};

// ─── Status styles ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  LetterStatus,
  { bg: string; color: string; label: string }
> = {
  draft: {
    bg: "hsl(var(--warning-light))",
    color: "hsl(var(--warning))",
    label: "Draft",
  },
  issued: {
    bg: "hsl(var(--success-light))",
    color: "hsl(var(--success))",
    label: "Issued",
  },
  sent: {
    bg: "hsl(var(--primary) / 0.12)",
    color: "hsl(var(--primary))",
    label: "Sent",
  },
};

const PAGE_SIZE = 8;

// ─── Section component for the create form ───────────────────────────────────

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1.5 border-b border-border">
        <Icon size={14} className="text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

// ─── Create Letter Modal ─────────────────────────────────────────────────────

function CreateLetterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<CreateFormData>(EMPTY_FORM);

  const set = (key: keyof CreateFormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleGenerate = () => {
    if (!form.employeeName.trim()) {
      toast.error("Employee name is required");
      return;
    }
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    // Build a plain-text prompt and dispatch as a new draft letter
    const joiningDisplay = form.joiningDate
      ? format(new Date(form.joiningDate), "dd MMMM yyyy")
      : "[joining date]";
    const deadlineDisplay = form.acceptDeadline
      ? format(new Date(form.acceptDeadline), "dd MMMM yyyy")
      : "[deadline]";

    const newLetter: Letter = {
      id: crypto.randomUUID(),
      employeeId: "",
      employeeName: form.employeeName,
      employeeDepartment: form.department,
      letterType: "offer-letter" as DocType,
      status: "draft" as LetterStatus,
      createdAt: new Date().toISOString(),
      formData: {
        ...form,
        joiningDate: joiningDisplay,
        acceptDeadline: deadlineDisplay,
      },
    };

    dispatch(addLetter(newLetter));
    toast.success("Offer letter draft created!", {
      description: `Draft saved for ${form.employeeName}`,
    });
    setForm(EMPTY_FORM);
    onClose();
  };

  const inputCls = "w-full";
  const selectCls =
    "w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} />
            Create New Offer Letter
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Candidate details */}
          <FormSection icon={User} title="Candidate Details">
            <Field label="Employee Name">
              <Input
                className={inputCls}
                placeholder="e.g. Rahul Verma"
                value={form.employeeName}
                onChange={(e) => set("employeeName", e.target.value)}
              />
            </Field>
            <Field label="Designation / Job Title">
              <Input
                className={inputCls}
                placeholder="e.g. Software Engineer"
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
              />
            </Field>
            <Field label="Department">
              <Input
                className={inputCls}
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              />
            </Field>
            <Field label="Grade">
              <Input
                className={inputCls}
                placeholder="e.g. L3"
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
              />
            </Field>
            <Field label="Work Location">
              <Input
                className={inputCls}
                placeholder="e.g. Bangalore"
                value={form.workLocation}
                onChange={(e) => set("workLocation", e.target.value)}
              />
            </Field>
            <Field label="Reporting Manager">
              <Input
                className={inputCls}
                placeholder="e.g. Amit Joshi"
                value={form.reportingManager}
                onChange={(e) => set("reportingManager", e.target.value)}
              />
            </Field>
            <Field label="Joining Date">
              <Input
                className={inputCls}
                type="date"
                value={form.joiningDate}
                onChange={(e) => set("joiningDate", e.target.value)}
              />
            </Field>
          </FormSection>

          {/* Salary & terms */}
          <FormSection icon={Briefcase} title="Salary & Terms">
            <Field label="CTC (Annual Salary)">
              <Input
                className={inputCls}
                placeholder="e.g. ₹8,00,000"
                value={form.salaryPackage}
                onChange={(e) => set("salaryPackage", e.target.value)}
              />
            </Field>
            <Field label="Employment Type">
              <select
                className={selectCls}
                value={form.employmentType}
                onChange={(e) => set("employmentType", e.target.value)}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </Field>
            <Field label="Notice Period">
              <select
                className={selectCls}
                value={form.noticePeriod}
                onChange={(e) => set("noticePeriod", e.target.value)}
              >
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
              </select>
            </Field>
            <Field label="Probation Period">
              <select
                className={selectCls}
                value={form.probationPeriod}
                onChange={(e) => set("probationPeriod", e.target.value)}
              >
                <option value="None">None</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
              </select>
            </Field>
            <Field label="Offer Accept Deadline">
              <Input
                className={inputCls}
                type="date"
                value={form.acceptDeadline}
                onChange={(e) => set("acceptDeadline", e.target.value)}
              />
            </Field>
          </FormSection>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button className="flex-1 gap-2" onClick={handleGenerate}>
            <FileText size={14} />
            Create Offers
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function OfferLetter() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const letters = useAppSelector((s) => s.letters.letters);
  const employees = useAppSelector((s) => s.employees.employees);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LetterStatus | "all">("all");
  const [page, setPage] = useState(0);
  const [previewLetter, setPreviewLetter] = useState<Letter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return letters.filter((l) => {
      const matchSearch =
        l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        l.letterType.toLowerCase().includes(search.toLowerCase());
      const matchType = l.letterType === "offer-letter";
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [letters, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getEmployee = (empId: string) => employees.find((e) => e.id === empId);

  const handleDownload = (letter: Letter) => {
    const emp = getEmployee(letter.employeeId);
    if (!emp) return toast.error("Employee not found");
    const doc = generatePDF(emp, letter.letterType);
    doc.save(getFilename(emp, letter.letterType));
    toast.success("PDF downloaded!");
  };

  const handleDelete = (id: string) => {
    dispatch(deleteLetter(id));
    setDeleteConfirm(null);
    toast.success("Letter deleted");
  };

  const handleSendEmail = (letter: Letter) => {
    dispatch(updateLetterStatus({ id: letter.id, status: "sent" }));
    toast.success("Email sent successfully! (Simulated)", {
      description: `Offer letter sent to ${letter.employeeName}`,
    });
  };

  const previewEmployee = previewLetter
    ? getEmployee(previewLetter.employeeId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offer Letters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, edit, and manage all generated offer letters
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          Create New Offer Letter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as LetterStatus | "all");
            setPage(0);
          }}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="sent">Sent</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border border-border bg-card p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <FileText
            size={40}
            className="mx-auto text-muted-foreground/40 mb-3"
          />
          <p className="text-muted-foreground text-sm mb-4">
            No offer letters found. Create your first letter to get started.
          </p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} />
            Create Offer Letter
          </Button>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b border-border"
                  style={{ background: "hsl(var(--muted) / 0.5)" }}
                >
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Employee
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Company
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((letter) => {
                  const st = STATUS_STYLES[letter.status];
                  const companyName =
                    (letter.formData as any)?.companyName || "—";
                  return (
                    <tr
                      key={letter.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {letter.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {letter.employeeName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {letter.employeeDepartment || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground text-sm">
                        {companyName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(letter.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewLetter(letter)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="View"
                          >
                            <Eye size={15} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDownload(letter)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="Download PDF"
                          >
                            <Download
                              size={15}
                              className="text-muted-foreground"
                            />
                          </button>
                          {letter.status !== "sent" && (
                            <button
                              onClick={() => handleSendEmail(letter)}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                              title="Send Email"
                            >
                              <Mail
                                size={15}
                                className="text-muted-foreground"
                              />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(letter.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} className="text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft size={14} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={i === page ? "default" : "outline"}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page === totalPages - 1}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Letter Modal */}
      <CreateLetterModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Preview modal */}
      {previewLetter && previewEmployee && (
        <OfferLetterPreview
          open={!!previewLetter}
          onClose={() => setPreviewLetter(null)}
          employee={previewEmployee}
          docType={previewLetter.letterType}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Letter?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The letter will be permanently
            removed.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
