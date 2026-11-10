import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { addLetter } from "@/redux/letterSlice";
import {
  DocType,
  DOC_TYPE_LABELS,
  generatePDF,
  getFilename,
} from "@/utils/documentGenerators";
import { Employee } from "@/types";
import { Letter, LetterFormData } from "@/types/letter";
import {
  Search,
  FileText,
  User,
  ClipboardList,
  Eye,
  Download,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";

// ─────────────────────────────────────────────────────────────────────────────

const LETTER_TYPES: { value: DocType; label: string; color: string }[] = [
  {
    value: "offer-letter",
    label: "Offer Letter",
    color: "hsl(var(--success))",
  },
  {
    value: "confirmation-letter",
    label: "Confirmation Letter",
    color: "hsl(217 91% 60%)",
  },
  {
    value: "increment-letter",
    label: "Increment Letter",
    color: "hsl(var(--warning))",
  },
  {
    value: "promotion-letter",
    label: "Promotion Letter",
    color: "hsl(270 70% 60%)",
  },
  {
    value: "relieving-letter",
    label: "Relieving Letter",
    color: "hsl(var(--destructive))",
  },
];

const STEPS = [
  { label: "Letter Type", icon: FileText },
  { label: "Employee", icon: User },
  { label: "Details", icon: ClipboardList },
  { label: "Preview", icon: Eye },
];

const NEW_CANDIDATE_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email Address" },
  { key: "phone", label: "Phone Number" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "salaryPackage", label: "Proposed Salary" },
  { key: "joiningDate", label: "Joining Date", type: "date" },
  { key: "workLocation", label: "Work Location" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function CreateLetter() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const employees = useAppSelector((s) =>
    s.employees.employees.filter((e) => e.status === "approved"),
  );

  const [step, setStep] = useState(0);
  const [letterType, setLetterType] = useState<DocType | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [empSearch, setEmpSearch] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [candidateMode, setCandidateMode] = useState<"existing" | "new" | null>(
    null,
  );
  const [newCandidateData, setNewCandidateData] = useState<
    Record<string, string>
  >({});

  const filteredEmps = useMemo(
    () =>
      employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.employeeId} ${e.department}`
          .toLowerCase()
          .includes(empSearch.toLowerCase()),
      ),
    [employees, empSearch],
  );

  const isOfferNewCandidate =
    letterType === "offer-letter" && candidateMode === "new";

  const updateField = (key: string, value: string) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const selectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    if (letterType) setFormData(initOfferLetterFormData(emp, letterType));
  };

  const selectNewCandidate = () => {
    setCandidateMode("new");
    setSelectedEmployee(null);
    setNewCandidateData({});
    setFormData({});
  };

  const selectExistingMode = () => {
    setCandidateMode("existing");
    setNewCandidateData({});
  };

  const buildCandidateEmployee = (): Employee => ({
    id: `candidate-${Date.now()}`,
    employeeId: "NEW-CANDIDATE",
    firstName: (newCandidateData.fullName || "").split(" ")[0] || "",
    lastName:
      (newCandidateData.fullName || "").split(" ").slice(1).join(" ") || "",
    email: newCandidateData.email || "",
    mobile: newCandidateData.phone || "",
    designation: newCandidateData.designation || "",
    department: newCandidateData.department || "",
    joiningDate: newCandidateData.joiningDate || "",
    workLocation: newCandidateData.workLocation || "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    currentAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    pincode: "",
    employmentType: "Full-time",
    companyEmail: "",
    reportingManager: "",
    shiftTiming: "",
    officeLocation: newCandidateData.workLocation || "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    qualification: "",
    university: "",
    yearOfPassing: "",
    percentage: "",
    status: "pending",
  });

  const getEffectiveEmployee = (): Employee | null =>
    isOfferNewCandidate ? buildCandidateEmployee() : selectedEmployee;

  const canNext = () => {
    if (step === 0) {
      if (letterType === "offer-letter") return !!letterType && !!candidateMode;
      return !!letterType;
    }
    if (step === 1) {
      if (isOfferNewCandidate)
        return NEW_CANDIDATE_FIELDS.every((f) =>
          newCandidateData[f.key]?.trim(),
        );
      return !!selectedEmployee;
    }
    if (step === 2) {
      if (isOfferNewCandidate) return true;
      if (!letterType) return false;
      return getOfferLetterFields(letterType).every((f) =>
        formData[f.key]?.trim(),
      );
    }
    return true;
  };

  const handleSave = (status: "draft" | "issued") => {
    const emp = getEffectiveEmployee();
    if (!emp || !letterType) return;
    const finalFormData = isOfferNewCandidate
      ? { employeeName: newCandidateData.fullName, ...newCandidateData }
      : formData;
    const letter: Letter = {
      id: `ltr-${Date.now()}`,
      employeeId: emp.id,
      employeeName: isOfferNewCandidate
        ? newCandidateData.fullName
        : `${emp.firstName} ${emp.lastName}`,
      employeeDesignation: emp.designation,
      employeeDepartment: emp.department,
      letterType,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issuedAt: status === "issued" ? new Date().toISOString() : undefined,
      formData: finalFormData as unknown as LetterFormData,
    };
    dispatch(addLetter(letter));
    toast.success(
      status === "issued"
        ? "Letter issued successfully!"
        : "Letter saved as draft!",
    );
    navigate("/documents/manage");
  };

  const handleEmail = () => {
    const emp = getEffectiveEmployee();
    toast.success("Email sent successfully! (Simulated)", {
      description: `${DOC_TYPE_LABELS[letterType!]} sent to ${
        isOfferNewCandidate ? newCandidateData.email : emp?.email
      }`,
    });
  };

  const handleDownload = () => {
    const emp = getEffectiveEmployee();
    if (!emp || !letterType) return;
    const doc = generatePDF(emp, letterType);
    doc.save(getFilename(emp, letterType));
    toast.success("PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Letter</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate professional HR letters step by step
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/documents/manage")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Manage Documents
          </Button>
          <Button
            onClick={() => navigate("/documents/templates")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Templates
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background:
                  i === step
                    ? "var(--gradient-primary)"
                    : i < step
                      ? "hsl(var(--success) / 0.1)"
                      : "hsl(var(--muted))",
                color:
                  i === step
                    ? "white"
                    : i < step
                      ? "hsl(var(--success))"
                      : "hsl(var(--muted-foreground))",
              }}
            >
              <s.icon size={16} />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="w-8 h-px"
                style={{
                  background:
                    i < step ? "hsl(var(--success))" : "hsl(var(--border))",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        className="rounded-2xl border border-border bg-card p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* ── Step 0: Letter Type ── */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              Select Letter Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LETTER_TYPES.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => {
                    setLetterType(value);
                    if (value !== "offer-letter") setCandidateMode(null);
                  }}
                  className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
                  style={{
                    borderColor:
                      letterType === value ? color : "hsl(var(--border))",
                    background:
                      letterType === value
                        ? `${color}10`
                        : "hsl(var(--background))",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${color}20` }}
                  >
                    <FileText size={20} style={{ color }} />
                  </div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate professional {label.toLowerCase()}
                  </p>
                </button>
              ))}
            </div>

            {letterType === "offer-letter" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Who is this offer for?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                  <button
                    onClick={selectExistingMode}
                    className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
                    style={{
                      borderColor:
                        candidateMode === "existing"
                          ? "hsl(var(--primary))"
                          : "hsl(var(--border))",
                      background:
                        candidateMode === "existing"
                          ? "hsl(var(--primary) / 0.05)"
                          : "hsl(var(--background))",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "hsl(var(--primary) / 0.1)" }}
                      >
                        <Users size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          Existing Employee
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Internal transfer or rehire
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={selectNewCandidate}
                    className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
                    style={{
                      borderColor:
                        candidateMode === "new"
                          ? "hsl(var(--success))"
                          : "hsl(var(--border))",
                      background:
                        candidateMode === "new"
                          ? "hsl(var(--success) / 0.05)"
                          : "hsl(var(--background))",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "hsl(var(--success) / 0.1)" }}
                      >
                        <UserPlus
                          size={20}
                          style={{ color: "hsl(var(--success))" }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          New Candidate
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enter details manually
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1a: Select existing employee ── */}
        {step === 1 && !isOfferNewCandidate && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Select Employee
            </h2>
            <div className="relative max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="Search by name, ID, or department…"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredEmps.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => selectEmployee(emp)}
                  className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
                  style={{
                    borderColor:
                      selectedEmployee?.id === emp.id
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))",
                    background:
                      selectedEmployee?.id === emp.id
                        ? "hsl(var(--primary) / 0.05)"
                        : "hsl(var(--background))",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.employeeId} · {emp.designation}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.department}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredEmps.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                  No approved employees found
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1b: New candidate details ── */}
        {step === 1 && isOfferNewCandidate && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              New Candidate Details
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter the candidate's details manually for the Offer Letter
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {NEW_CANDIDATE_FIELDS.map(({ key, label, type }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {label}
                  </label>
                  <Input
                    type={type || "text"}
                    value={newCandidateData[key] || ""}
                    onChange={(e) =>
                      setNewCandidateData((p) => ({
                        ...p,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2a: Common letter details form ── */}
        {step === 2 && !isOfferNewCandidate && letterType && (
          <LetterDetailsForm
            docType={letterType}
            formData={formData}
            onChange={updateField}
          />
        )}

        {/* ── Step 2b: Review new-candidate data ── */}
        {step === 2 && isOfferNewCandidate && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Offer Letter — Review Details
            </h2>
            <p className="text-sm text-muted-foreground">
              Review the candidate details before proceeding to preview
            </p>
            <div className="rounded-lg border border-border overflow-hidden max-w-2xl">
              {NEW_CANDIDATE_FIELDS.map(({ key, label }, i) => (
                <div
                  key={key}
                  className="flex text-sm"
                  style={{
                    background:
                      i % 2 === 0 ? "hsl(var(--muted) / 0.3)" : "transparent",
                  }}
                >
                  <span className="px-4 py-2.5 font-medium text-muted-foreground w-48 flex-shrink-0">
                    {label}
                  </span>
                  <span className="px-4 py-2.5 text-foreground">
                    {newCandidateData[key] || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Preview & Actions ── */}
        {step === 3 &&
          letterType &&
          getEffectiveEmployee() &&
          (() => {
            const emp = getEffectiveEmployee()!;
            const displayName = isOfferNewCandidate
              ? newCandidateData.fullName
              : `${emp.firstName} ${emp.lastName}`;
            const displayId = isOfferNewCandidate
              ? "New Candidate"
              : emp.employeeId;
            const summaryFields = isOfferNewCandidate
              ? NEW_CANDIDATE_FIELDS
              : getLetterFields(letterType);
            const summaryData = isOfferNewCandidate
              ? newCandidateData
              : formData;
            const initials = displayName
              ? displayName
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "NC";

            return (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Preview & Actions
                </h2>
                <div className="rounded-xl border border-border bg-background p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">
                        {displayName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {displayId} · {emp.designation}
                      </p>
                      <span
                        className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: "hsl(var(--primary) / 0.1)",
                          color: "hsl(var(--primary))",
                        }}
                      >
                        {DOC_TYPE_LABELS[letterType]}
                      </span>
                      {isOfferNewCandidate && (
                        <span
                          className="inline-block mt-1 ml-2 px-3 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: "hsl(var(--success) / 0.1)",
                            color: "hsl(var(--success))",
                          }}
                        >
                          New Hire
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    {summaryFields.map(({ key, label }, i) => (
                      <div
                        key={key}
                        className="flex text-sm"
                        style={{
                          background:
                            i % 2 === 0
                              ? "hsl(var(--muted) / 0.3)"
                              : "transparent",
                        }}
                      >
                        <span className="px-4 py-2.5 font-medium text-muted-foreground w-48 flex-shrink-0">
                          {label}
                        </span>
                        <span className="px-4 py-2.5 text-foreground">
                          {summaryData[key] || "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() => setShowPreview(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Eye size={14} /> Preview Letter
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="gap-2"
                    >
                      <Download size={14} /> Download PDF
                    </Button>
                    <Button
                      onClick={handleEmail}
                      variant="outline"
                      className="gap-2"
                    >
                      <Send size={14} /> Send via Email
                    </Button>
                    <Button
                      onClick={() => handleSave("issued")}
                      className="gap-2"
                      style={{ background: "hsl(var(--success))" }}
                    >
                      <CheckCircle size={14} /> Mark as Issued
                    </Button>
                    <Button
                      onClick={() => handleSave("draft")}
                      variant="secondary"
                      className="gap-2"
                    >
                      Save as Draft
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          variant="outline"
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft size={14} /> Back
        </Button>
        {step < 3 && (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="gap-2"
          >
            Next <ArrowRight size={14} />
          </Button>
        )}
      </div>

      {showPreview && letterType && getEffectiveEmployee() && (
        <DocumentPreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          employee={getEffectiveEmployee()!}
          docType={letterType}
        />
      )}
    </div>
  );
}
