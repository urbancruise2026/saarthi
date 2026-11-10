import { Employee, Experience } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash, FileText, Upload, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

const CLOUD_NAME = "dc5r74upy";
const UPLOAD_PRESET = "employee_upload";

const MAX_PDF_SIZE = 300 * 1024;

const documentOptions: { key: keyof Experience; label: string }[] = [
  { key: "offerLetterUploaded", label: "Offer Letter" },
  { key: "experienceLetterUploaded", label: "Experience Letter" },
  { key: "salarySlipUploaded", label: "Salary Slip" },
  { key: "bankStatementUploaded", label: "Bank Statement" },
];

const group1Docs: (keyof Experience)[] = [
  "offerLetterUploaded",
  "experienceLetterUploaded",
];

const group2Docs: (keyof Experience)[] = [
  "salarySlipUploaded",
  "bankStatementUploaded",
];

const F = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
  </div>
);

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Function to calculate duration between two dates
function calculateDuration(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  // Calculate difference in months
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Add 1 month if end date day is greater than or equal to start date day
  if (end.getDate() >= start.getDate()) {
    months += 1;
  }

  // Handle case when months become 12
  if (months === 12) {
    years += 1;
    months = 0;
  }

  // Build duration string
  const parts = [];
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? "s" : ""}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? "s" : ""}`);
  }

  return parts.join(" ") || "Less than a month";
}

export function StepExperience({ data, onChange }: StepProps) {
  const [employeeType, setEmployeeType] = useState<"fresher" | "experienced">(
    data.employeeType as "fresher" | "experienced",
  );

  const experienceList: Experience[] = data.experience || [
    {
      previousCompany: "",
      jobTitle: "",
      duration: "",
      lastSalary: "",
      joiningDate: "",
      relievingDate: "",
      reasonforLeaving: "",
      referenceName: "",
      referenceRoll: "",
      referenceContact: "",
      offerLetterUploaded: null,
      experienceLetterUploaded: null,
      salarySlipUploaded: null,
      bankStatementUploaded: null,
    },
  ];

  const handleEmployeeTypeChange = (value: "fresher" | "experienced") => {
    setEmployeeType(value);

    // Update employeeType in payload
    onChange({
      employeeType: value,
      experience: value === "fresher" ? [] : experienceList,
    });
  };

  const handleChange = (
    index: number,
    field: keyof Experience,
    value: string | null,
  ) => {
    const updated = [...experienceList];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Auto-calculate duration when joining date or relieving date changes
    if (field === "joiningDate" || field === "relievingDate") {
      const joiningDate =
        field === "joiningDate" ? value : updated[index].joiningDate;
      const relievingDate =
        field === "relievingDate" ? value : updated[index].relievingDate;

      if (joiningDate && relievingDate) {
        const duration = calculateDuration(
          joiningDate as string,
          relievingDate as string,
        );
        updated[index].duration = duration;
      } else {
        updated[index].duration = "";
      }
    }

    onChange({
      employeeType,
      experience: updated,
    });
  };

  const handleDocumentUpload = async (
    index: number,
    docField: keyof Experience,
    file: File,
  ) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF allowed");
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      toast.error(
        `PDF must be under 300KB (Current: ${formatFileSize(file.size)})`,
      );
      return;
    }

    try {
      toast.loading("Uploading document...");

      const url = await uploadToCloudinary(file);

      const updated = [...experienceList];

      const exp = updated[index];

      const group1Uploaded = group1Docs.some((doc) => exp[doc]);
      const group2Uploaded = group2Docs.some((doc) => exp[doc]);

      if (group1Docs.includes(docField) && group1Uploaded) {
        toast.dismiss();
        toast.error("Only one allowed: Offer Letter OR Experience Letter");
        return;
      }

      if (group2Docs.includes(docField) && group2Uploaded) {
        toast.dismiss();
        toast.error("Only one allowed: Salary Slip OR Bank Statement");
        return;
      }

      updated[index][docField] = url;

      onChange({
        employeeType,
        experience: updated,
      });

      toast.dismiss();
      toast.success("Document uploaded successfully");
    } catch {
      toast.dismiss();
      toast.error("Upload failed");
    }
  };

  const handleRemoveDocument = (index: number, docField: keyof Experience) => {
    const updated = [...experienceList];

    updated[index][docField] = null;

    onChange({
      employeeType,
      experience: updated,
    });

    toast.success("Document removed");
  };

  const addExperience = () => {
    onChange({
      employeeType,
      experience: [
        ...experienceList,
        {
          previousCompany: "",
          jobTitle: "",
          duration: "",
          lastSalary: 0,
          joiningDate: "",
          relievingDate: "",
          reasonforLeaving: "",
          referenceName: "",
          referenceRoll: "",
          referenceContact: "",
          offerLetterUploaded: null,
          experienceLetterUploaded: null,
          salarySlipUploaded: null,
          bankStatementUploaded: null,
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    const updated = experienceList.filter((_, i) => i !== index);

    onChange({
      employeeType,
      experience: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* Employee Type Dropdown */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <Label className="text-base font-semibold mb-3 block">
          Employee Type
        </Label>
        <Select value={employeeType} onValueChange={handleEmployeeTypeChange}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select employee type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fresher">Fresher</SelectItem>
            <SelectItem value="experienced">Experienced</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-2">
          {employeeType === "fresher"
            ? "No experience details required"
            : "Please provide your previous work experience details"}
        </p>
      </div>

      {/* Experience Details - Only show if Experienced is selected */}
      {employeeType === "experienced" && (
        <>
          {experienceList.map((exp, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 space-y-4 relative"
            >
              {experienceList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="absolute top-3 right-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-full"
                >
                  <Trash size={16} />
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F label="Previous Company">
                  <Input
                    value={exp.previousCompany}
                    onChange={(e) =>
                      handleChange(index, "previousCompany", e.target.value)
                    }
                    placeholder="e.g., Google India Pvt Ltd"
                  />
                </F>

                <F label="Designation">
                  <Input
                    value={exp.jobTitle}
                    onChange={(e) =>
                      handleChange(index, "jobTitle", e.target.value)
                    }
                    placeholder="e.g., Senior Software Engineer"
                  />
                </F>

                <F label="Joining Date">
                  <Input
                    type="date"
                    value={exp.joiningDate}
                    onChange={(e) =>
                      handleChange(index, "joiningDate", e.target.value)
                    }
                    max={exp.relievingDate || undefined}
                    min={
                      index > 0
                        ? experienceList[index - 1]?.relievingDate || undefined
                        : undefined
                    }
                  />
                </F>

                <F label="Relieving Date">
                  <Input
                    type="date"
                    value={exp.relievingDate}
                    onChange={(e) =>
                      handleChange(index, "relievingDate", e.target.value)
                    }
                    min={exp.joiningDate || undefined}
                    max={
                      index < experienceList.length - 1
                        ? experienceList[index + 1]?.joiningDate || undefined
                        : undefined
                    }
                  />
                </F>

                <F label="Duration">
                  <Input
                    value={exp.duration}
                    readOnly
                    placeholder="Auto-calculated from dates"
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  {exp.joiningDate && exp.relievingDate && !exp.duration && (
                    <p className="text-xs text-amber-600 mt-1">
                      Unable to calculate duration. Please check dates.
                    </p>
                  )}
                </F>

                <F label="Company Address">
                  <Input
                    value={exp.reasonforLeaving}
                    onChange={(e) =>
                      handleChange(index, "reasonforLeaving", e.target.value)
                    }
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </F>

                <F label="Last Month Salary (₹)">
                  <Input
                    type="text"
                    value={
                      exp.lastSalary
                        ? new Intl.NumberFormat("en-IN").format(exp.lastSalary)
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, ""); // comma remove
                      if (!isNaN(Number(rawValue)) || rawValue === "") {
                        handleChange(index, "lastSalary", rawValue);
                      }
                    }}
                    placeholder="75,000"
                  />
                </F>

                <F label="Reference Name">
                  <Input
                    value={exp.referenceName}
                    onChange={(e) =>
                      handleChange(index, "referenceName", e.target.value)
                    }
                    placeholder="e.g., John Doe"
                  />
                </F>

                <F label="Reference Designation">
                  <Input
                    value={exp.referenceRoll}
                    onChange={(e) =>
                      handleChange(index, "referenceRoll", e.target.value)
                    }
                    placeholder="e.g., Project Manager"
                  />
                </F>

                <F label="Reference Contact">
                  <Input
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={10}
                    value={exp.referenceContact}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "referenceContact",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="9876543210"
                  />
                </F>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">
                  Required Documents
                </h3>

                <p className="text-xs text-gray-500 mb-3">
                  Upload one document from Offer/Experience Letter and one from
                  Salary Slip/Bank Statement (PDF max 300KB)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documentOptions.map((doc) => {
                    const isUploaded = Boolean(exp[doc.key]);

                    return (
                      <div
                        key={doc.key}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                          isUploaded
                            ? "border-green-500 bg-green-50"
                            : "border-dashed border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isUploaded ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <FileText size={16} className="text-gray-400" />
                          )}

                          <p className="text-xs font-medium">{doc.label}</p>
                        </div>

                        <div className="flex gap-1">
                          {isUploaded && (
                            <button
                              onClick={() =>
                                handleRemoveDocument(index, doc.key)
                              }
                              className="text-red-500 hover:bg-red-100 p-1 rounded"
                              type="button"
                            >
                              <X size={12} />
                            </button>
                          )}

                          {!isUploaded && (
                            <label className="cursor-pointer text-purple-600 text-xs flex items-center gap-1">
                              <Upload size={12} /> Upload
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];

                                  if (file)
                                    handleDocumentUpload(index, doc.key, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus size={16} /> Add Another Experience
          </Button>
        </>
      )}

      {/* Fresher Message */}
      {employeeType === "fresher" && (
        <div className="border rounded-lg p-8 bg-gray-50 text-center">
          <p className="text-gray-600">
            No experience details required for fresher.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can proceed to the next step.
          </p>
        </div>
      )}
    </div>
  );
}
