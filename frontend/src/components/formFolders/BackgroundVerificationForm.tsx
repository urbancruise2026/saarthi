import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  createBGVThunk,
  resetBGV,
} from "@/redux/features/BackgroundVerification/BackgroundVerificationSlice";
import { fetchEmployeesThunk } from "@/redux/features/userSlice";

import { BGVData, Employee, VerifyStatus } from "@/types";
import {
  Shield,
  User,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

// ─── Default State ─────────────────────────────────────────────────────────────

const DEFAULT_BGV: BGVData = {
  employeeId: "",
  employeeName: "",
  department: "",
  mobile: "",
  fatherName: "",
  fatherContact: "",
  motherName: "",
  motherContact: "",
  localName: "",
  alternateNumber: "",
  currentAddress: "",
  currentCity: null,
  currentState: null,
  currentPincode: null,
  permanentAddress: "",
  permanentCity: null,
  permanentState: null,
  permanentPincode: null,
  previousCompany: "",
  referenceName: "",
  referenceContact: "",
  verification: {
    contactNumber: "",
    fatherContact: "",
    motherContact: "",
    alternateNumber: "",
    currentAddress: "",
    permanentAddress: "",
    identityProof: "",
    educationProof: "",
    previousEmployment: "",
    criminalRecord: "",
    referenceCheck: "",
  },
  remarks: "",
  overallStatus: "",
};

interface BGVFormProps {
  open?: boolean;
  onClose?: () => void;
  onSave?: (data: BGVData) => void;
}

// ─── Field Wrapper ──────────────────────────────────────────────────────────────

const F = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className={error ? "border border-red-500 rounded-md" : ""}>
      {children}
    </div>
    {error && <p className="text-xs text-red-500">This field is required</p>}
  </div>
);

// ─── Section Heading ────────────────────────────────────────────────────────────

const SectionHeading = ({
  icon: Icon,
  title,
  color = "text-gray-700",
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    <Icon className={`w-5 h-5 ${color}`} />
    <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
  </div>
);

// ─── Status Badge ───────────────────────────────────────────────────────────────

export const StatusBadge = ({ status }: { status: VerifyStatus }) => {
  if (!status) return null;
  const map = {
    verified: {
      icon: CheckCircle,
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Verified",
    },
    failed: {
      icon: XCircle,
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Failed",
    },
    pending: {
      icon: Clock,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Pending",
    },
  };
  const cfg = map[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

// ─── Verification Select ────────────────────────────────────────────────────────

const VerifySelect = ({
  value,
  onChange,
  error,
}: {
  value: VerifyStatus;
  onChange: (v: VerifyStatus) => void;
  error?: boolean;
}) => (
  <Select value={value} onValueChange={(v) => onChange(v as VerifyStatus)}>
    <SelectTrigger
      className={`bg-white cursor-pointer ${error ? "border-red-500" : ""} ${
        value === "verified"
          ? "border-green-400 text-green-700"
          : value === "failed"
            ? "border-red-400 text-red-700"
            : value === "pending"
              ? "border-yellow-400 text-yellow-700"
              : ""
      }`}
    >
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="verified">
        <span className="flex items-center gap-2 text-green-700">
          <CheckCircle size={13} /> Verified
        </span>
      </SelectItem>
      <SelectItem value="failed">
        <span className="flex items-center gap-2 text-red-700">
          <XCircle size={13} /> Failed
        </span>
      </SelectItem>
      <SelectItem value="pending">
        <span className="flex items-center gap-2 text-yellow-700">
          <Clock size={13} /> Pending
        </span>
      </SelectItem>
    </SelectContent>
  </Select>
);

// ─── Verify Row ─────────────────────────────────────────────────────────────────

const VerifyRow = ({
  label,
  value,
  status,
  onStatusChange,
  showErrors,
}: {
  label: string;
  value: string;
  status: VerifyStatus;
  onStatusChange: (v: VerifyStatus) => void;
  showErrors?: boolean;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-3 rounded-lg bg-gray-50 border border-gray-100">
    <div className="sm:col-span-1">
      <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
    <div className="sm:col-span-1 flex items-center gap-2">
      <StatusBadge status={status} />
    </div>
    <div className="sm:col-span-1">
      <VerifySelect
        value={status}
        onChange={onStatusChange}
        error={showErrors && !status}
      />
    </div>
  </div>
);



export function BackgroundVerificationForm({
  open = false,
  onClose,
  onSave,
}: BGVFormProps) {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector((state) => state.user);
  const { loading, error } = useAppSelector((state) => state.bgv);

  useEffect(() => {
    dispatch(fetchEmployeesThunk(1));
  }, [dispatch]);

  // Reset BGV state jab form band ho
  useEffect(() => {
    if (!open) {
      dispatch(resetBGV());
    }
  }, [open, dispatch]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [bgv, setBgv] = useState<BGVData>(DEFAULT_BGV);
  const [showErrors, setShowErrors] = useState(false);

  const handleEmployeeSelect = (id: string) => {
    setSelectedEmployeeId(id);
    const emp = employees?.find((e: Employee) => String(e.id) === id);
    if (!emp) return;
    const fullName = [emp.firstName, emp.middleName, emp.lastName]
      .filter(Boolean)
      .join(" ");
    setBgv((prev) => ({
      ...prev,
      employeeId: String(emp.id),
      employeeName: fullName,
      department: emp.department_name || emp.department_Name || "",
      mobile: emp.phone || emp.contactNumber || emp.mobileNumber || "",
      fatherName: emp.fatherName || "",
      motherName: emp.motherName || "",
      currentAddress: emp.currentAddress || emp.address || "",
      currentCity: emp.currentCity || null,
      currentState: emp.currentState || null,
      currentPincode: emp.currentPincode || null,
      permanentAddress: emp.permanentAddress || "",
      permanentCity: emp.permanentCity || null,
      permanentState: emp.permanentState || null,
      permanentPincode: emp.permanentPincode || null,
    }));
  };

  const updateVerification = (
    field: keyof BGVData["verification"],
    value: VerifyStatus,
  ) => {
    setBgv((prev) => {
      const updated = {
        ...prev,
        verification: { ...prev.verification, [field]: value },
      };
      const statuses = Object.values(updated.verification);
      const filled = statuses.filter((s) => s !== "");
      const allVerified =
        filled.length > 0 && filled.every((s) => s === "verified");
      const anyFailed = filled.some((s) => s === "failed");
      updated.overallStatus = anyFailed
        ? "failed"
        : allVerified
          ? "verified"
          : filled.length > 0
            ? "pending"
            : "";
      return updated;
    });
  };

  const isValid =
    bgv.employeeName.trim() !== "" && bgv.department.trim() !== "";

  // ─── Handle Save ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    const payload = {
      employee_id: bgv.employeeId,
      overall_status: bgv.overallStatus,
      remarks: bgv.remarks,
      alternate_number: bgv.verification.alternateNumber,
      contact_number: bgv.verification.contactNumber,
      criminal_record: bgv.verification.criminalRecord,
      current_address: bgv.verification.currentAddress,
      education_proof: bgv.verification.educationProof,
      father_contact: bgv.verification.fatherContact,
      father_name: bgv.fatherName,
      identity_proof: bgv.verification.identityProof,
      mother_contact: bgv.verification.motherContact,
      mother_name: bgv.motherName,
      permanent_address: bgv.verification.permanentAddress,
      previous_employment: bgv.verification.previousEmployment,
      reference_check: bgv.verification.referenceCheck,
    };

    const result = await dispatch(createBGVThunk(payload));

    if (createBGVThunk.fulfilled.match(result)) {
      onSave?.(bgv);
      onClose?.();
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Shield size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Background Verification Form
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Employee background check aur verification status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border-2 border-red-600 hover:bg-red-600 transition-colors text-red-700 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {/* 1. Employee Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={User}
                title="Employee Information"
                color="text-blue-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <F
                    label="Employee Select karein"
                    required
                    error={showErrors && !bgv.employeeName}
                  >
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={handleEmployeeSelect}
                    >
                      <SelectTrigger className="bg-white cursor-pointer">
                        <SelectValue placeholder="Employee dhundein..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((emp: Employee) => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {[emp.firstName, emp.middleName, emp.lastName]
                              .filter(Boolean)
                              .join(" ")}{" "}
                            {emp.employeeId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </F>
                </div>
                <F label="Employee Name">
                  <Input
                    value={bgv.employeeName}
                    readOnly
                    placeholder="Auto-fill hoga"
                    className="bg-gray-50"
                  />
                </F>
                <F label="Department">
                  <Input
                    value={bgv.department}
                    readOnly
                    placeholder="Auto-fill hoga"
                    className="bg-gray-50"
                  />
                </F>
                <F label="Contact Number">
                  <Input
                    value={bgv.mobile}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, mobile: e.target.value }))
                    }
                    placeholder="Contact number"
                  />
                </F>
              </div>
            </div>

            {/* 2. Family Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Users}
                title="Family Information"
                color="text-blue-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F label="Father's Name">
                  <Input
                    value={bgv.fatherName}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, fatherName: e.target.value }))
                    }
                    placeholder="Father Name"
                  />
                </F>
                <F label="Father Contact">
                  <Input
                    value={bgv.fatherContact}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, fatherContact: e.target.value }))
                    }
                    placeholder="Father Contact"
                  />
                </F>
                <F label="Mother's Name">
                  <Input
                    value={bgv.motherName}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, motherName: e.target.value }))
                    }
                    placeholder="Mother Name"
                  />
                </F>
                <F label="Mother Contact">
                  <Input
                    value={bgv.motherContact}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, motherContact: e.target.value }))
                    }
                    placeholder="Mother Contact"
                  />
                </F>
                <F label="Local Gargine Name">
                  <Input
                    value={bgv.localName}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, localName: e.target.value }))
                    }
                    placeholder="Local Gargine Name"
                  />
                </F>
                <F label="Local Gargine Contact">
                  <Input
                    value={bgv.alternateNumber}
                    onChange={(e) =>
                      setBgv((p) => ({
                        ...p,
                        alternateNumber: e.target.value,
                      }))
                    }
                    placeholder="Local Gargine Contact"
                  />
                </F>
              </div>
            </div>

            {/* 3. Address Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={MapPin}
                title="Address Details"
                color="text-blue-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F label="Current Address">
                  <Input
                    value={[
                      bgv.currentAddress,
                      bgv.currentCity,
                      bgv.currentState,
                      bgv.currentPincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    readOnly
                    placeholder="Abhi ka full address"
                    className="bg-gray-50"
                  />
                </F>
                <F label="Current Address Proof">
                  <Input
                    value={[
                      bgv.currentAddress,
                      bgv.currentCity,
                      bgv.currentState,
                      bgv.currentPincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    readOnly
                    placeholder="Abhi ka full address"
                    className="bg-gray-50"
                  />
                </F>
                <F label="Permanent Address">
                  <Input
                    value={[
                      bgv.permanentAddress,
                      bgv.permanentCity,
                      bgv.permanentState,
                      bgv.permanentPincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    readOnly
                    placeholder="Permanent full address"
                    className="bg-gray-50"
                  />
                </F>
                <F label="Permanent Address Proof">
                  <Input
                    value={[
                      bgv.permanentAddress,
                      bgv.permanentCity,
                      bgv.permanentState,
                      bgv.permanentPincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    readOnly
                    placeholder="Permanent full address"
                    className="bg-gray-50"
                  />
                </F>
              </div>
            </div>

            {/* 4. Reference Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={MapPin}
                title="Reference Details"
                color="text-blue-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F label="Previous Company">
                  <Input
                    value={bgv.previousCompany}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, previousCompany: e.target.value }))
                    }
                    placeholder="Previous Company Name"
                  />
                </F>
                <F label="Reference Name">
                  <Input
                    value={bgv.referenceName}
                    onChange={(e) =>
                      setBgv((p) => ({ ...p, referenceName: e.target.value }))
                    }
                    placeholder="Reference Name"
                  />
                </F>
                <F label="Reference Contact">
                  <Input
                    value={bgv.referenceContact}
                    onChange={(e) =>
                      setBgv((p) => ({
                        ...p,
                        referenceContact: e.target.value,
                      }))
                    }
                    placeholder="Reference Contact"
                  />
                </F>
              </div>
            </div>

            {/* 5. Verification Status */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Shield}
                title="Background Verification Status"
                color="text-blue-600"
              />
              <p className="text-xs text-gray-500 mb-4">
                Choose a status for each field —{" "}
                <span className="text-green-600 font-medium">Verified</span>,{" "}
                <span className="text-red-600 font-medium">Failed</span>, ya{" "}
                <span className="text-yellow-600 font-medium">Pending</span>
              </p>
              <div className="space-y-3">
                <VerifyRow
                  label="Contact Number"
                  value={bgv.mobile}
                  status={bgv.verification.contactNumber}
                  onStatusChange={(v) => updateVerification("contactNumber", v)}
                  showErrors={showErrors}
                />
                <VerifyRow
                  label="Father Contact"
                  value={bgv.fatherContact}
                  status={bgv.verification.fatherContact}
                  onStatusChange={(v) => updateVerification("fatherContact", v)}
                  showErrors={showErrors}
                />
                <VerifyRow
                  label="Mother Contact"
                  value={bgv.motherContact}
                  status={bgv.verification.motherContact}
                  onStatusChange={(v) => updateVerification("motherContact", v)}
                  showErrors={showErrors}
                />
                <VerifyRow
                  label="Local Gargine Contact"
                  value={bgv.alternateNumber}
                  status={bgv.verification.alternateNumber}
                  onStatusChange={(v) =>
                    updateVerification("alternateNumber", v)
                  }
                  showErrors={showErrors}
                />
                <VerifyRow
                  label="Current Address"
                  value={bgv.currentAddress}
                  status={bgv.verification.currentAddress}
                  onStatusChange={(v) =>
                    updateVerification("currentAddress", v)
                  }
                  showErrors={showErrors}
                />
                <VerifyRow
                  label="Permanent Address"
                  value={bgv.permanentAddress}
                  status={bgv.verification.permanentAddress}
                  onStatusChange={(v) =>
                    updateVerification("permanentAddress", v)
                  }
                  showErrors={showErrors}
                />

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Additional Checks
                  </p>
                  <div className="space-y-3">
                    <VerifyRow
                      label="Identity Proof (Aadhar/PAN)"
                      value="Document check"
                      status={bgv.verification.identityProof}
                      onStatusChange={(v) =>
                        updateVerification("identityProof", v)
                      }
                    />
                    <VerifyRow
                      label="Education Proof"
                      value="Degree/Certificate check"
                      status={bgv.verification.educationProof}
                      onStatusChange={(v) =>
                        updateVerification("educationProof", v)
                      }
                    />
                    <VerifyRow
                      label="Previous Employment"
                      value="Experience verification"
                      status={bgv.verification.previousEmployment}
                      onStatusChange={(v) =>
                        updateVerification("previousEmployment", v)
                      }
                    />
                    <VerifyRow
                      label="Criminal Record Check"
                      value="Police verification"
                      status={bgv.verification.criminalRecord}
                      onStatusChange={(v) =>
                        updateVerification("criminalRecord", v)
                      }
                    />
                    <VerifyRow
                      label="Reference Check"
                      value="Reference verification"
                      status={bgv.verification.referenceCheck}
                      onStatusChange={(v) =>
                        updateVerification("referenceCheck", v)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Remarks */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <F label="Verification Remarks">
                <textarea
                  value={bgv.remarks}
                  onChange={(e) =>
                    setBgv((p) => ({ ...p, remarks: e.target.value }))
                  }
                  placeholder="Koi additional remarks ya notes..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </F>
            </div>

            {/* 7. Overall Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border-2 border-dashed border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                Overall Verification Status
              </span>
              <div className="flex items-center gap-3">
                <StatusBadge status={bgv.overallStatus} />
                <Select
                  value={bgv.overallStatus}
                  onValueChange={(v) =>
                    setBgv((p) => ({
                      ...p,
                      overallStatus: v as VerifyStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-36 bg-white cursor-pointer">
                    <SelectValue placeholder="Overall status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">
                      <span className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={13} /> Verified
                      </span>
                    </SelectItem>
                    <SelectItem value="failed">
                      <span className="flex items-center gap-2 text-red-700">
                        <XCircle size={13} /> Failed
                      </span>
                    </SelectItem>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2 text-yellow-700">
                        <Clock size={13} /> Pending
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Validation Error */}
            {showErrors && !isValid && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={15} className="text-red-600" />
                  <h4 className="text-sm font-medium text-red-800">
                    Please fill required fields:
                  </h4>
                </div>
                <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                  {!bgv.employeeName && <li>Employee Name required hai</li>}
                  {!bgv.department && <li>Department required hai</li>}
                </ul>
              </div>
            )}

            {/* API Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {bgv.overallStatus && <StatusBadge status={bgv.overallStatus} />}
            {bgv.employeeName && (
              <span className="text-xs text-gray-500">
                {bgv.employeeName} · {bgv.department}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Shield size={15} /> Save Verification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
