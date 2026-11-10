import { Input } from "@/components/ui/input";
import { Employee } from "@/types";
import { format } from "date-fns";
import { DocType } from "@/utils/documentGenerators";

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "email";
  placeholder?: string;
}

const FIELD_CONFIGS: Record<DocType, FieldConfig[]> = {
  "offer-letter": [
    { key: "employeeName", label: "Employee Name" },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department" },
    { key: "grade", label: "Grade" },
    { key: "salaryPackage", label: "Salary Package (CTC)", type: "number" },
    { key: "joiningDate", label: "Joining Date", type: "date" },
    { key: "workLocation", label: "Work Location" },
    { key: "noticePeriod", label: "Notice Period" },
    { key: "reportingManager", label: "Reporting Manager" },

    { key: "acceptDeadline", label: "Offer Accept Deadline", type: "date" },
  ],
  "confirmation-letter": [
    { key: "employeeName", label: "Employee Name" },
    { key: "employeeIdField", label: "Employee ID" },
    { key: "designation", label: "Designation" },
    { key: "confirmationDate", label: "Confirmation Date", type: "date" },
    { key: "remarks", label: "Remarks" },
  ],
  "increment-letter": [
    { key: "employeeName", label: "Employee Name" },
    { key: "currentSalary", label: "Current Salary", type: "number" },
    { key: "newSalary", label: "New Salary", type: "number" },
    {
      key: "incrementPercentage",
      label: "Increment Percentage (%)",
      type: "number",
    },
    { key: "effectiveDate", label: "Effective Date", type: "date" },
    { key: "reason", label: "Reason" },
  ],
  "promotion-letter": [
    { key: "employeeName", label: "Employee Name" },
    { key: "oldDesignation", label: "Old Designation" },
    { key: "newDesignation", label: "New Designation" },
    { key: "newSalary", label: "New Salary", type: "number" },
    { key: "effectiveDate", label: "Effective Date", type: "date" },
  ],
  "relieving-letter": [
    { key: "employeeName", label: "Employee Name" },
    { key: "lastWorkingDate", label: "Last Working Date", type: "date" },
    { key: "designation", label: "Designation" },
    { key: "reasonForLeaving", label: "Reason for Leaving" },
    { key: "clearanceStatus", label: "Clearance Status" },
  ],
};

const today = () => format(new Date(), "yyyy-MM-dd");

const INIT_DATA: Record<DocType, (emp: Employee) => Record<string, string>> = {
  "offer-letter": (emp) => ({
    employeeName: `${emp.firstName} ${emp.lastName}`,
    designation: emp.designation || "",
    department: emp.department || "",
    grade: emp.grade || "",
    salaryPackage: "",
    joiningDate: emp.joiningDate || "",
    workLocation: emp.workLocation || emp.officeLocation || "",
    noticePeriod: emp.noticePeriod || "",
    reportingManager: emp.reportingManager || "",
    companyName: "",
    companyAddress: "",
    hrName: "",
    hrDesignation: "HR Manager",
    acceptDeadline: "",
  }),
  "confirmation-letter": (emp) => ({
    employeeName: `${emp.firstName} ${emp.lastName}`,
    employeeIdField: emp.employeeId || "",
    designation: emp.designation || "",
    confirmationDate: today(),
    remarks: "",
  }),
  "increment-letter": (emp) => ({
    employeeName: `${emp.firstName} ${emp.lastName}`,
    currentSalary: "",
    newSalary: "",
    incrementPercentage: "",
    effectiveDate: today(),
    reason: "",
  }),
  "promotion-letter": (emp) => ({
    employeeName: `${emp.firstName} ${emp.lastName}`,
    oldDesignation: emp.designation || "",
    newDesignation: "",
    newSalary: "",
    effectiveDate: today(),
  }),
  "relieving-letter": (emp) => ({
    employeeName: `${emp.firstName} ${emp.lastName}`,
    designation: emp.designation || "",
    lastWorkingDate: today(),
    reasonForLeaving: "",
    clearanceStatus: "Pending",
  }),
};

export function getLetterFields(docType: DocType): FieldConfig[] {
  return FIELD_CONFIGS[docType] ?? [];
}

export function initLetterFormData(
  emp: Employee,
  docType: DocType,
): Record<string, string> {
  return (
    INIT_DATA[docType]?.(emp) ?? {
      employeeName: `${emp.firstName} ${emp.lastName}`,
    }
  );
}

interface LetterDetailsFormProps {
  docType: DocType;
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const LETTER_TITLES: Record<DocType, string> = {
  "offer-letter": "Offer Letter",
  "confirmation-letter": "Confirmation Letter",
  "increment-letter": "Increment Letter",
  "promotion-letter": "Promotion Letter",
  "relieving-letter": "Relieving Letter",
};

// Section grouping for offer-letter to match the Hindi form layout
const OFFER_LETTER_SECTIONS = [
  {
    title: "Employee Details",
    keys: [
      "employeeName",
      "designation",
      "department",
      "grade",
      "joiningDate",
      "workLocation",
      "noticePeriod",
      "reportingManager",
      "salaryPackage",
    ],
  },

  {
    title: "Offer Terms",
    keys: ["acceptDeadline"],
  },
];

export default function LetterDetailsForm({
  docType,
  formData,
  onChange,
}: LetterDetailsFormProps) {
  const fields = getLetterFields(docType);
  const title = LETTER_TITLES[docType];

  if (docType === "offer-letter") {
    const fieldMap = Object.fromEntries(fields.map((f) => [f.key, f]));

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {title} — Details
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in all required details for the offer letter
          </p>
        </div>

        {OFFER_LETTER_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1.5">
              {section.title}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.keys.map((key) => {
                const field = fieldMap[key];
                if (!field) return null;
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      {field.label}
                    </label>
                    <Input
                      type={field.type || "text"}
                      value={formData[key] || ""}
                      onChange={(e) => onChange(key, e.target.value)}
                      placeholder={
                        field.placeholder ??
                        `Enter ${field.label.toLowerCase()}`
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Language & Tone selectors */}
      </div>
    );
  }

  // Default layout for other letter types
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {title} — Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the required details for the {title.toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
            <Input
              type={type || "text"}
              value={formData[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
