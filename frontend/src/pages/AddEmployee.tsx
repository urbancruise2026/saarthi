import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { Employee } from "@/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { StepPersonal } from "@/components/form-steps/StepPersonal";
import { StepContact } from "@/components/form-steps/StepContact";
import { StepAddress } from "@/components/form-steps/StepAddress";
import { StepBank } from "@/components/form-steps/StepBank";
import { StepEducation } from "@/components/form-steps/StepEducation";
import { StepExperience } from "@/components/form-steps/StepExperience";
import { StepFamily } from "@/components/form-steps/StepFamily";
import { StepDocuments } from "@/components/form-steps/StepDocuments";
import { StepHRpoliciest } from "@/components/form-steps/StepHRpolicies";

import {
  createEmployeeThunk,
  updateEmployeeThunk, // ✅ { userId, updateData }
  getEmployeeByIdThunk,
  fetchEmployeesThunk,
} from "@/redux/features/userSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const STEPS = [
  { label: "Personal", short: "1" },
  { label: "Contact", short: "2" },
  { label: "Address", short: "3" },
  { label: "Family", short: "4" },
  { label: "Education", short: "5" },
  { label: "Experience", short: "6" },
  { label: "Bank", short: "7" },
  { label: "Documents", short: "8" },
  { label: "Declaration", short: "9" },
];

const STEP_BG_COLORS: Record<number, string> = {
  0: "bg-blue-50",
  1: "bg-blue-50",
  2: "bg-blue-50",
  3: "bg-blue-50",
  4: "bg-pink-50",
  5: "bg-purple-50",
  6: "bg-cyan-50",
  7: "bg-lime-50",
  8: "bg-rose-50",
};
const STEP_BORDER_COLORS: Record<number, string> = {
  0: "border-blue-300",
  1: "border-blue-300",
  2: "border-blue-300",
  3: "border-blue-300",
  4: "border-pink-300",
  5: "border-purple-300",
  6: "border-green-300",
  7: "border-orange-300",
  8: "border-rose-300",
};
const STEP_HEADER_COLORS: Record<number, string> = {
  0: "text-blue-800",
  1: "text-blue-800",
  2: "text-blue-800",
  3: "text-blue-800",
  4: "text-pink-800",
  5: "text-purple-800",
  6: "text-green-800",
  7: "text-orange-800",
  8: "text-rose-800",
};
const STEP_BADGE_COLORS: Record<number, string> = {
  0: "bg-blue-600",
  1: "bg-blue-600",
  2: "bg-blue-600",
  3: "bg-blue-600",
  4: "bg-pink-600",
  5: "bg-purple-600",
  6: "bg-green-600",
  7: "bg-orange-600",
  8: "bg-rose-600",
};
const STEP_COMPLETED_COLORS: Record<number, string> = {
  0: "text-blue-700 bg-blue-200",
  1: "text-blue-700 bg-blue-200",
  2: "text-blue-700 bg-blue-200",
  3: "text-blue-700 bg-blue-200",
  4: "text-pink-700 bg-pink-200",
  5: "text-purple-700 bg-purple-200",
  6: "text-green-700 bg-green-200",
  7: "text-orange-700 bg-orange-300",
  8: "text-rose-700 bg-rose-200",
};

const CONTACT_NUMBER_FIELDS = [
  "mobile",
  "alternateNumber",
  "fatherContact",
  "motherContact",
  "spouseContact",
  "siblingContact",
  "referenceContact",
];

const STEP_REQUIRED_FIELDS: Record<number, string[]> = {
  0: [
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "bloodGroup",
    "maritalStatus",
  ],
  1: ["personalEmail", "mobile"],
  2: [
    "permanentAddress",
    "permanentCity",
    "permanentState",
    "permanentPincode",
    "currentAddress",
    "currentCity",
    "currentState",
    "currentPincode",
    "permanentAddressProofUploaded",
  ],
  3: [
    "fatherName",
    "fatherContact",
    "fatherOccupation",
    "motherName",
    "motherContact",
    "motherOccupation",
    "siblingName",
    "siblingContact",
    "siblingOccupation",
    "siblingRelation",
  ],
  4: ["education"],
  5: ["employeeType"],
  6: [
    "bankName",
    "accountHolderName",
    "accountNumber",
    "ifscCode",
    "branch",
    "accountType",
    "upiId",
    "qrCodeUploaded",
  ],
  7: [
    "aadhaarUploaded",
    "panUploaded",
    "signatureUploaded",
    "passportPhotoUploaded",
    "twelthCertificateUploaded",
    "graduationCertificateUploaded",
    "resumeUploaded",
  ],
  8: [
    "hrPolicyAccepted",
    "commitmentDeclarationAccepted",
    "informationDeclarationAccepted",
  ],
};

const getRequiredFieldsForStep = (s: number) => STEP_REQUIRED_FIELDS[s] || [];

interface Props {
  editEmployeeId?: number;
  isModal?: boolean;
  onClose?: () => void;
}

export default function AddEmployee({
  editEmployeeId,
  isModal = false,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isEditMode = Boolean(editEmployeeId);

  const existingCount = useAppSelector(
    (s) => s.employees?.employees?.length || 0,
  );

  const existingEmployee = useSelector((state: RootState) =>
    editEmployeeId
      ? state.user.employees.find((e) => e.id === editEmployeeId)
      : null,
  );

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});
  const [isStepValid, setIsStepValid] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isEditMode && editEmployeeId) {
      setIsFetching(true);
      dispatch(getEmployeeByIdThunk(editEmployeeId))
        .unwrap()
        .then((data) => {
          setFormData({ ...data });
        })
        .catch(() => {
          toast.error("Failed to load employee data");
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else if (!isEditMode) {
      setFormData({
        employeeId: `EMP-${String(existingCount + 1).padStart(3, "0")}`,
      });
    }
  }, [editEmployeeId]);

  useEffect(() => {
    validateCurrentStep();
  }, [formData, step]);

  useEffect(() => {
    const completed: Record<number, boolean> = {};
    for (let i = 0; i < STEPS.length; i++) {
      const required = getRequiredFieldsForStep(i);
      if (required.length === 0) {
        completed[i] = true;
        continue;
      }
      completed[i] = required.every((field) => {
        const value = formData[field as keyof typeof formData];
        if (value === undefined || value === null) return false;
        if (typeof value === "string") {
          if (value.trim() === "") return false;
          if (CONTACT_NUMBER_FIELDS.includes(field)) return value.length === 10;
        }
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "boolean") return value === true;
        return true;
      });
    }
    setCompletedSteps(completed);
  }, [formData]);

  const validateCurrentStep = () => {
    const required = getRequiredFieldsForStep(step);
    if (required.length === 0) {
      setIsStepValid(true);
      return;
    }
    const valid = required.every((field) => {
      const value = formData[field as keyof typeof formData];
      if (value === undefined || value === null) return false;
      if (typeof value === "string") {
        if (value.trim() === "") return false;
        if (CONTACT_NUMBER_FIELDS.includes(field)) return value.length === 10;
      }
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "boolean") return value === true;
      return true;
    });
    setIsStepValid(valid);
  };

  const isStepAccessible = (targetStep: number) => {
    if (targetStep <= step) return true;
    for (let i = 0; i < targetStep; i++) {
      if (!completedSteps[i]) return false;
    }
    return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (isStepAccessible(targetStep)) setStep(targetStep);
    else toast.error("Please complete all previous steps first");
  };

  const updateForm = (data: Partial<Employee>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const handleNext = () => {
    if (!isStepValid) {
      toast.error("Please fill all required fields before proceeding");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value instanceof File) fd.append(key, value);
      else if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
      else if (typeof value === "boolean")
        fd.append(key, value ? "true" : "false");
      else fd.append(key, String(value));
    });
    return fd;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fd = buildFormData();

      if (isEditMode && editEmployeeId) {
        await dispatch(
          updateEmployeeThunk({ userId: editEmployeeId, updateData: fd }),
        ).unwrap();
        await dispatch(fetchEmployeesThunk(1));
        toast.success("Employee details updated successfully!");
        onClose?.();
      } else {
        await dispatch(createEmployeeThunk(fd)).unwrap();
        await dispatch(fetchEmployeesThunk(1));
        toast.success("Employee Created Successfully!");
        navigate("/onboarding-submitted");
      }
    } catch (error: any) {
      toast.error(
        error?.message ||
          (isEditMode ? "Failed to update" : "Failed to create employee"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const stepProps = { data: formData, onChange: updateForm };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepPersonal {...stepProps} />;
      case 1:
        return <StepContact {...stepProps} />;
      case 2:
        return <StepAddress {...stepProps} />;
      case 3:
        return <StepFamily {...stepProps} />;
      case 4:
        return <StepEducation {...stepProps} />;
      case 5:
        return <StepExperience {...stepProps} />;
      case 6:
        return <StepBank {...stepProps} />;
      case 7:
        return <StepDocuments {...stepProps} />;
      case 8:
        return <StepHRpoliciest {...stepProps} />;
      default:
        return null;
    }
  };

  if (isFetching) {
    const loader = (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading employee data...</p>
      </div>
    );
    if (isModal) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-2xl shadow-2xl p-10">
            {loader}
          </div>
        </div>
      );
    }
    return <div className="max-w-7xl mx-auto">{loader}</div>;
  }

  const formContent = (
    <div className="space-y-6">
      {/* Page title — only shown when NOT inside modal */}
      {!isModal && (
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode
              ? "Edit Employee Onboarding Form"
              : "Employee Onboarding Form"}
          </h1>
          <p className="text-muted-foreground text-md">
            {isEditMode
              ? `Editing: ${existingEmployee?.firstName ?? ""} ${existingEmployee?.lastName ?? ""}`
              : `Complete all ${STEPS.length} steps to add employee onboarding.`}
          </p>
        </div>
      )}

      {/* Progress + Stepper */}
      <div className="stat-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-md font-medium text-muted-foreground">
            Step {step + 1} of {STEPS.length}:{" "}
            <span className="text-foreground font-semibold">
              {STEPS[step].label}
            </span>
          </span>
          <span className="text-xs font-semibold text-primary">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>

        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {STEPS.map((s, i) => {
            const hasErrors = stepErrors[i] && i <= step;
            const isCompleted = completedSteps[i];
            const isAccessible = isStepAccessible(i);
            return (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                disabled={!isAccessible}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  !isAccessible && "opacity-40 cursor-not-allowed",
                  i === step
                    ? "text-primary-foreground"
                    : isCompleted
                      ? STEP_COMPLETED_COLORS[i]
                      : hasErrors
                        ? "bg-destructive/10 text-destructive border border-destructive/30"
                        : "bg-muted text-muted-foreground hover:bg-accent",
                )}
                style={i === step ? { background: "hsl(var(--primary))" } : {}}
              >
                {isCompleted ? (
                  <Check size={11} />
                ) : hasErrors ? (
                  <span className="text-destructive font-bold">!</span>
                ) : (
                  <span>{i + 1}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Form */}
      <div
        className={cn(
          "animate-fade-in p-6 rounded-xl transition-all duration-500 shadow-sm border",
          STEP_BG_COLORS[step] || "bg-white",
          STEP_BORDER_COLORS[step] || "border-gray-200",
        )}
      >
        <h2
          className={cn(
            "text-xl font-semibold mb-6 pb-3 border-b-2 relative transition-all duration-500 flex items-center flex-wrap gap-2",
            STEP_HEADER_COLORS[step] || "text-gray-800",
            STEP_BORDER_COLORS[step] || "border-gray-200",
          )}
        >
          <span
            className={cn(
              "text-white px-3 py-1 rounded-md text-sm font-semibold transition-all duration-500",
              STEP_BADGE_COLORS[step] || "bg-gray-600",
            )}
          >
            {step + 1}
          </span>
          {STEPS[step]?.label}
          {STEPS[step]?.label !== "Declaration" && " Information"}
          {getRequiredFieldsForStep(step).length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              (Fields marked with <span className="text-red-500">*</span> are
              required)
            </span>
          )}
        </h2>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft size={15} /> Previous
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!isStepValid}
            className={cn(
              "gap-2",
              !isStepValid && "opacity-50 cursor-not-allowed",
              isStepValid && "text-primary-foreground",
            )}
          >
            Next <ChevronRight size={15} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="gap-2 text-primary-foreground"
            style={{ background: "hsl(var(--success))" }}
            disabled={
              isSubmitting ||
              !formData.hrPolicyAccepted ||
              !formData.commitmentDeclarationAccepted ||
              !formData.informationDeclarationAccepted
            }
          >
            {isSubmitting ? (
              isEditMode ? (
                "Saving..."
              ) : (
                "Submitting..."
              )
            ) : (
              <>
                <Send size={14} /> {isEditMode ? "Save Changes" : "Submit"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  // ─── MODAL WRAPPER ────────────────────────────────────────────────────────
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
        <div className="relative w-full max-w-6xl bg-background rounded-2xl shadow-2xl">
          {/* Modal header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background rounded-t-2xl z-10">
            <div>
              <h2 className="text-lg font-bold">Edit Onboarding Form</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {existingEmployee?.firstName} {existingEmployee?.lastName}
                {existingEmployee?.employeeId && (
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {existingEmployee.employeeId}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-700 transition-colors text-muted-foreground font-bold text-lg leading-none bg-red-500 text-white"
            >
              ✕
            </button>
          </div>

          {/* Modal body */}
          <div className="p-6">{formContent}</div>
        </div>
      </div>
    );
  }

  // ─── FULL PAGE ────────────────────────────────────────────────────────────
  return <div className="space-y-6 max-w-7xl mx-auto">{formContent}</div>;
}
