import { Input } from "@/components/ui/input";
import { Employee } from "@/types";
import { format } from "date-fns";

interface ConfirmationLetterFormProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "employeeName", label: "Employee Name" },
  { key: "employeeIdField", label: "Employee ID" },
  { key: "designation", label: "Designation" },
  { key: "confirmationDate", label: "Confirmation Date", type: "date" },
  { key: "remarks", label: "Remarks" },
];

export function getConfirmationLetterFields() {
  return FIELDS;
}

export function initConfirmationLetterFormData(
  emp: Employee,
): Record<string, string> {
  return {
    employeeName: `${emp.firstName} ${emp.lastName}`,
    employeeIdField: emp.employeeId,
    designation: emp.designation,
    confirmationDate: format(new Date(), "yyyy-MM-dd"),
    remarks: "",
  };
}

export default function ConfirmationLetterForm({
  formData,
  onChange,
}: ConfirmationLetterFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Confirmation Letter — Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details for the confirmation letter
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {FIELDS.map(({ key, label, type }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
            <Input
              type={type || "text"}
              value={formData[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
