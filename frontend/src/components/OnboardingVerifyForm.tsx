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
import { fetchEmployeesThunk } from "@/redux/features/userSlice";
import { Employee, OnboardingActivities } from "@/types";
import {
  Calendar,
  ClipboardList,
  Armchair,
  BookOpen,
  Smartphone,
  Shield,
  Clock,
  User,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StepProps {
  data?: Partial<Employee>;
  onChange?: (d: Partial<Employee>) => void;
  showErrors?: boolean;
  open?: boolean;
  onClose?: () => void;
  onSave?: (data: Partial<Employee>) => void;
}

// ─── Field Wrapper — same pattern as StepEmployment ───────────────────────────

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
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className={error ? "border border-red-500 rounded-md" : ""}>
      {children}
    </div>
    {error && <p className="text-xs text-red-500">This field is required</p>}
  </div>
);

// ─── Section Heading — same as StepEmployment ─────────────────────────────────

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

// ─── Shared Yes/No Select ──────────────────────────────────────────────────────

const YesNoSelect = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger
      className={`bg-white cursor-pointer ${error ? "border-red-500" : ""}`}
    >
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="yes">Yes</SelectItem>
      <SelectItem value="no">No</SelectItem>
    </SelectContent>
  </Select>
);

// ─── Default Activities State ──────────────────────────────────────────────────

const DEFAULT_ACTIVITIES: OnboardingActivities = {
  employeeName: "",
  department: "",
  joiningProcess: {
    dateOfJoining: "",
    documentVerification: "",
    employmentForm: "",
    trainingSchedule: "",
    joiningKit: "",
    attendance: "",
  },
  seatingArrangement: {
    deskAllotment: "",
    desktopAllotment: "",
  },
  training: {
    trainingPart1: "",
    hrPolicies2and3: "",
    hrPolicies4and5: "",
    trainingPart2Completed: "",
    remarks: "",
  },
  equipment: {
    mobile: "",
    mobileCover: "",
    simCard: "",
    mobileStand: "",
    headphone: "",
    headphoneStand: "",
    calculator: "",
    digitalBusinessCard: "",
    mobileConfigured: "",
    desktopConfigured: "",
    dsr: "",
    liveDsr: "",
    mobileHandover: "",
  },
  hrProcess: {
    backgroundCheck: "",
    offerLetter: "",
    offerLetterDate: "",
    pagarBook: "",
  },
  confirmation: {
    eligibilityDate: "",
    acceptance: "",
  },
};

type Activities = OnboardingActivities;

// ─── Required fields for validation ───────────────────────────────────────────

const REQUIRED_FIELDS: {
  section: keyof Activities | "root";
  field: string;
  label: string;
}[] = [
  { section: "root", field: "employeeName", label: "Employee Name" },
  { section: "root", field: "department", label: "Department" },
  {
    section: "joiningProcess",
    field: "dateOfJoining",
    label: "Date of Joining",
  },
  {
    section: "joiningProcess",
    field: "documentVerification",
    label: "Document Verification",
  },
  {
    section: "joiningProcess",
    field: "employmentForm",
    label: "Employment Form",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function OnboardingVerifyForm({
  data = {},
  onChange,
  showErrors = false,
  open = false,
  onClose,
  onSave,
}: StepProps) {
  const dispatch = useAppDispatch();

  const { employees } = useAppSelector((state) => state.user);
  console.log("employees", employees);
  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const [activities, setActivities] = useState<Activities>(() => {
    const saved = data.activities as Partial<Activities> | undefined;
    if (saved && typeof saved === "object") {
      return {
        ...DEFAULT_ACTIVITIES,
        ...saved,
        employeeName: saved.employeeName || (data.name as string) || "",
        department: saved.department || (data.department as string) || "",
        joiningProcess: {
          ...DEFAULT_ACTIVITIES.joiningProcess,
          ...(saved.joiningProcess || {}),
          dateOfJoining:
            (data.joiningDate as string) ||
            saved.joiningProcess?.dateOfJoining ||
            "",
        },
      };
    }
    return {
      ...DEFAULT_ACTIVITIES,
      employeeName: (data.name as string) || "",
      department: (data.department as string) || "",
      joiningProcess: {
        ...DEFAULT_ACTIVITIES.joiningProcess,
        dateOfJoining: (data.joiningDate as string) || "",
      },
    };
  });

  useEffect(() => {
    if (
      data.joiningDate &&
      data.joiningDate !== activities.joiningProcess.dateOfJoining
    ) {
      setActivities((prev) => ({
        ...prev,
        joiningProcess: {
          ...prev.joiningProcess,
          dateOfJoining: data.joiningDate as string,
        },
      }));
    }
  }, [data.joiningDate]);

  const update = (
    section: keyof Activities | "root",
    field: string,
    value: string,
  ) => {
    let updated: Activities;

    if (section === "root") {
      updated = { ...activities, [field]: value };
    } else {
      updated = {
        ...activities,
        [section]: {
          ...(activities[section] as Record<string, string>),
          [field]: value,
        },
      };
    }

    setActivities(updated);

    onChange?.({
      ...data,
      activities: updated,
      ...(section === "joiningProcess" && field === "dateOfJoining"
        ? { joiningDate: value }
        : {}),
      ...(section === "root" && field === "employeeName"
        ? { name: value }
        : {}),
      ...(section === "root" && field === "department"
        ? { department: value }
        : {}),
    });
  };

  const errors: Record<string, boolean> = {};
  if (showErrors) {
    REQUIRED_FIELDS.forEach(({ section, field }) => {
      const val =
        section === "root"
          ? (activities as any)[field]
          : (activities[section] as any)[field];
      if (!val || (typeof val === "string" && val.trim() === ""))
        errors[`${section}.${field}`] = true;
    });
  }
  const hasErrors = Object.keys(errors).length > 0;

  const getCount = (type: "completed" | "total") => {
    let count = 0;
    Object.entries(activities).forEach(([key, section]) => {
      if (key === "employeeName" || key === "department") return;
      if (typeof section === "object") {
        Object.values(section).forEach((v: any) => {
          if (type === "completed" && v === "yes") count++;
          if (type === "total" && (v === "yes" || v === "no")) count++;
        });
      }
    });
    return count;
  };

  const completed = getCount("completed");
  const total = getCount("total");

  const handleSave = () => {
    onSave?.({
      ...data,
      activities,
      name: activities.employeeName,
      department: activities.department,
      joiningDate: activities.joiningProcess.dateOfJoining,
    });
    onClose?.();
  };

  if (!open) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Onboarding Verify
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              New employee ki onboarding checklist fill karein
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-8">
            {/* ── 1. Employee Information ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={User}
                title="Employee Information"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F
                  label="Employee Name"
                  required
                  error={errors["root.employeeName"]}
                >
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={(value) => {
                      setSelectedEmployeeId(value);

                      const emp = employees.find(
                        (e: Employee) => String(e.id) === value,
                      );

                      if (!emp) return;

                      const fullName = [
                        emp.firstName,
                        emp.middleName,
                        emp.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      update("root", "employeeName", fullName);
                      update("root", "department", emp.department_name || "");

                      if (emp.joiningDate) {
                        update(
                          "joiningProcess",
                          "dateOfJoining",
                          emp.joiningDate,
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>

                    <SelectContent>
                      {employees?.map((emp: Employee) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {[emp.firstName, emp.middleName, emp.lastName]
                            .filter(Boolean)
                            .join(" ")}{" "}
                          ({emp.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F
                  label="Department"
                  required
                  error={errors["root.department"]}
                >
                  <Input
                    value={activities.department}
                    readOnly
                    placeholder="Auto from employee"
                  />
                </F>
                <F
                  label="Date of Joining"
                  required
                  error={errors["joiningProcess.dateOfJoining"]}
                >
                  <Input
                    type="date"
                    value={activities.joiningProcess.dateOfJoining}
                    readOnly
                  />
                </F>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Calendar}
                title="Joining Process"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F
                  label="Document Verification"
                  required
                  error={errors["joiningProcess.documentVerification"]}
                >
                  <YesNoSelect
                    value={activities.joiningProcess.documentVerification}
                    onChange={(v) =>
                      update("joiningProcess", "documentVerification", v)
                    }
                    error={errors["joiningProcess.documentVerification"]}
                  />
                </F>
                <F
                  label="Employment Form"
                  required
                  error={errors["joiningProcess.employmentForm"]}
                >
                  <YesNoSelect
                    value={activities.joiningProcess.employmentForm}
                    onChange={(v) =>
                      update("joiningProcess", "employmentForm", v)
                    }
                    error={errors["joiningProcess.employmentForm"]}
                  />
                </F>
                <F label="Training Schedule">
                  <YesNoSelect
                    value={activities.joiningProcess.trainingSchedule}
                    onChange={(v) =>
                      update("joiningProcess", "trainingSchedule", v)
                    }
                  />
                </F>
                <F label="Joining Kit (Coffee Mug, Book, Pen)">
                  <YesNoSelect
                    value={activities.joiningProcess.joiningKit}
                    onChange={(v) => update("joiningProcess", "joiningKit", v)}
                  />
                </F>
                <F label="Attendance (WA Group)">
                  <YesNoSelect
                    value={activities.joiningProcess.attendance}
                    onChange={(v) => update("joiningProcess", "attendance", v)}
                  />
                </F>
              </div>
            </div>

            {/* ── 3. Seating Arrangement ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Armchair}
                title="Seating Arrangement"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F label="Desk Allotment (Chair)">
                  <YesNoSelect
                    value={activities.seatingArrangement.deskAllotment}
                    onChange={(v) =>
                      update("seatingArrangement", "deskAllotment", v)
                    }
                  />
                </F>
                <F label="Desktop Allotment (PC, Mouse, KB)">
                  <YesNoSelect
                    value={activities.seatingArrangement.desktopAllotment}
                    onChange={(v) =>
                      update("seatingArrangement", "desktopAllotment", v)
                    }
                  />
                </F>
              </div>
            </div>

            {/* ── 4. Training ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={BookOpen}
                title="Training"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F label="Training Part 1">
                  <YesNoSelect
                    value={activities.training.trainingPart1}
                    onChange={(v) => update("training", "trainingPart1", v)}
                  />
                </F>
                <F label="HR Policies - 2 & 3">
                  <YesNoSelect
                    value={activities.training.hrPolicies2and3}
                    onChange={(v) => update("training", "hrPolicies2and3", v)}
                  />
                </F>
                <F label="HR Policies - 4 & 5">
                  <YesNoSelect
                    value={activities.training.hrPolicies4and5}
                    onChange={(v) => update("training", "hrPolicies4and5", v)}
                  />
                </F>
                <F label="Training Part 2 Completed">
                  <YesNoSelect
                    value={activities.training.trainingPart2Completed}
                    onChange={(v) =>
                      update("training", "trainingPart2Completed", v)
                    }
                  />
                </F>
                <div className="sm:col-span-2">
                  <F label="Training Remarks">
                    <Input
                      value={activities.training.remarks}
                      onChange={(e) =>
                        update("training", "remarks", e.target.value)
                      }
                      placeholder="Enter any remarks about training"
                    />
                  </F>
                </div>
              </div>
            </div>

            {/* ── 5. Equipment Issued ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Smartphone}
                title="Equipment Issued"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F label="Mobile">
                  <YesNoSelect
                    value={activities.equipment.mobile}
                    onChange={(v) => update("equipment", "mobile", v)}
                  />
                </F>
                <F label="Mobile Cover">
                  <YesNoSelect
                    value={activities.equipment.mobileCover}
                    onChange={(v) => update("equipment", "mobileCover", v)}
                  />
                </F>
                <F label="SIM Card">
                  <YesNoSelect
                    value={activities.equipment.simCard}
                    onChange={(v) => update("equipment", "simCard", v)}
                  />
                </F>
                <F label="Mobile Stand">
                  <YesNoSelect
                    value={activities.equipment.mobileStand}
                    onChange={(v) => update("equipment", "mobileStand", v)}
                  />
                </F>
                <F label="Headphone">
                  <YesNoSelect
                    value={activities.equipment.headphone}
                    onChange={(v) => update("equipment", "headphone", v)}
                  />
                </F>
                <F label="Headphone Stand">
                  <YesNoSelect
                    value={activities.equipment.headphoneStand}
                    onChange={(v) => update("equipment", "headphoneStand", v)}
                  />
                </F>
                <F label="Calculator">
                  <YesNoSelect
                    value={activities.equipment.calculator}
                    onChange={(v) => update("equipment", "calculator", v)}
                  />
                </F>
                <F label="Digital Business Card">
                  <YesNoSelect
                    value={activities.equipment.digitalBusinessCard}
                    onChange={(v) =>
                      update("equipment", "digitalBusinessCard", v)
                    }
                  />
                </F>
                <F label="Mobile Configured">
                  <YesNoSelect
                    value={activities.equipment.mobileConfigured}
                    onChange={(v) => update("equipment", "mobileConfigured", v)}
                  />
                </F>
                <F label="Desktop Configured">
                  <YesNoSelect
                    value={activities.equipment.desktopConfigured}
                    onChange={(v) =>
                      update("equipment", "desktopConfigured", v)
                    }
                  />
                </F>
                <F label="DSR">
                  <YesNoSelect
                    value={activities.equipment.dsr}
                    onChange={(v) => update("equipment", "dsr", v)}
                  />
                </F>
                <F label="Live-DSR">
                  <YesNoSelect
                    value={activities.equipment.liveDsr}
                    onChange={(v) => update("equipment", "liveDsr", v)}
                  />
                </F>
                <F label="Mobile Handover">
                  <YesNoSelect
                    value={activities.equipment.mobileHandover}
                    onChange={(v) => update("equipment", "mobileHandover", v)}
                  />
                </F>
              </div>
            </div>

            {/* ── 6. HR Process ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Shield}
                title="HR Process"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F label="Background Check">
                  <YesNoSelect
                    value={activities.hrProcess.backgroundCheck}
                    onChange={(v) => update("hrProcess", "backgroundCheck", v)}
                  />
                </F>
                <F label="Offer Letter (after 10 Days)">
                  <YesNoSelect
                    value={activities.hrProcess.offerLetter}
                    onChange={(v) => update("hrProcess", "offerLetter", v)}
                  />
                </F>
                {activities.hrProcess.offerLetter === "yes" && (
                  <F label="Offer Letter Date">
                    <Input
                      type="date"
                      value={activities.hrProcess.offerLetterDate}
                      onChange={(e) =>
                        update("hrProcess", "offerLetterDate", e.target.value)
                      }
                    />
                  </F>
                )}
                <F label="Login in PagarBook">
                  <YesNoSelect
                    value={activities.hrProcess.pagarBook}
                    onChange={(v) => update("hrProcess", "pagarBook", v)}
                  />
                </F>
              </div>
            </div>

            {/* ── 7. Confirmation ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={ClipboardList}
                title="Confirmation"
                color="text-purple-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800 mb-2 font-medium">
                    Confirmation Eligibility (4 months)
                  </p>
                  <F label="Eligibility Date">
                    <Input
                      type="date"
                      value={activities.confirmation.eligibilityDate}
                      onChange={(e) =>
                        update(
                          "confirmation",
                          "eligibilityDate",
                          e.target.value,
                        )
                      }
                    />
                  </F>
                </div>
                <F label="Acceptance">
                  <YesNoSelect
                    value={activities.confirmation.acceptance}
                    onChange={(v) => update("confirmation", "acceptance", v)}
                  />
                </F>
              </div>
            </div>

            {/* ── 8. Overall Status ── */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <SectionHeading
                icon={Clock}
                title="Overall Activity Status"
                color="text-purple-600"
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">
                    Completed Activities
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {completed} / {total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completed / (total || 1)) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 italic text-center">
                  {completed === total && total > 0
                    ? "✓ All activities completed! Ready for confirmation."
                    : `* ${total - completed} activities pending completion`}
                </div>
              </div>
            </div>

            {/* ── Validation Error Summary (same as StepEmployment) ── */}
            {showErrors && hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Please fill in all required fields:
                </h4>
                <ul className="list-disc list-inside text-xs text-red-600">
                  {REQUIRED_FIELDS.filter(
                    ({ section, field }) => errors[`${section}.${field}`],
                  ).map(({ label }) => (
                    <li key={label}>{label} is required</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
