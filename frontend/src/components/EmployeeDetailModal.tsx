import { useEffect, useState } from "react";
import { Employee, Education } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  X,
  FileText,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Banknote,
  GraduationCap,
  Users,
  Image,
  File,
  Printer,
  Clock,
  ExternalLink,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateEmployeeProfilePDF } from "@/utils/employeeDetailsPDF";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchEmployeesThunk,
  updateEmployeeStatusThunk,
} from "@/redux/features/userSlice";

interface Props {
  employee: Employee;
  onClose: () => void;
}

const Section = ({
  title,
  icon: Icon,
  children,
  titleColor = "text-foreground",
  iconColor = "text-muted-foreground",
  borderColor = "border-border",
}: {
  title: string | React.ReactNode;
  icon?: React.ElementType;
  children: React.ReactNode;
  titleColor?: string;
  iconColor?: string;
  borderColor?: string;
}) => (
  <div className="bg-card rounded-lg p-4 border border-border">
    <h3
      className={`text-md font-semibold flex items-center gap-2 pb-2 mb-3 border-b ${borderColor} ${titleColor}`}
    >
      {Icon && <Icon size={20} className={iconColor} />}
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value?: string | boolean | null;
  icon?: React.ElementType;
  className?: string;
}) => {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—";

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-md text-black font-semibold flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p className="text-md font-semibold text-muted-foreground break-words">
        {displayValue}
      </p>
    </div>
  );
};

const DocumentBadge = ({
  name,
  document,
}: {
  name: string;
  document?: string | null;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleView = () => {
    if (!document) {
      toast.error(`${name} not available`);
      return;
    }

    // Open in new tab
    window.open(document, "_blank", "noopener,noreferrer");
  };

  const getIcon = () => {
    if (!document) return File;
    if (document.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) return Image;
    if (document.match(/\.pdf$/i)) return FileText;
    return File;
  };

  const IconComponent = getIcon();

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all group",
        document
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/30 cursor-pointer"
          : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800 cursor-not-allowed opacity-60",
      )}
      onClick={handleView}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={cn(
            "p-2 rounded-full transition-all",
            document
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white group-hover:scale-110"
              : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
          )}
        >
          <IconComponent size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {document ? (
              <span className="flex items-center gap-1">
                <ExternalLink size={12} />
                Click to view in new tab
              </span>
            ) : (
              "Not uploaded"
            )}
          </p>
        </div>
      </div>
      {document && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          disabled={isDownloading}
          title="Download"
        ></Button>
      )}
    </div>
  );
};

export function EmployeeDetailModal({ employee, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [tab, setTab] = useState<
    "personal" | "education" | "experience" | "employment" | "bank" | "docs"
  >("personal");
  console.log("employee", employee);
  const handleApprove = (id: number) => {
    dispatch(
      updateEmployeeStatusThunk({ userId: id, status: "approved" }),
    ).unwrap();

    toast.success("Employee approved successfully!");
    onClose();
  };

  const handleReject = (id: number) => {
    dispatch(
      updateEmployeeStatusThunk({ userId: id, status: "rejected" }),
    ).unwrap();
    dispatch(fetchEmployeesThunk(1));
    toast.success("Employee rejected successfully!");
    onClose();
  };

  const handleDownloadPDF = () => {
    const doc = generateEmployeeProfilePDF(employee);
    doc.save(`Employee_Profile_${employee.firstName}_${employee.lastName}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  const handlePrint = () => {
    const doc = generateEmployeeProfilePDF(employee);
    const blobUrl = doc.output("bloburl");
    const win = window.open(blobUrl as unknown as string, "_blank");
    if (win) {
      win.addEventListener("load", () => {
        win.print();
      });
    }
  };
  const formatIndianCurrency = (value?: Number | null) => {
    if (!value) return "—";
    const num = Number(value);
    if (isNaN(num)) return value;
    return `₹${num.toLocaleString("en-IN")}`;
  };
  const tabs = [
    { key: "personal", label: "Personal", icon: User, color: "text-blue-600" },
    {
      key: "education",
      label: "Education",
      icon: GraduationCap,
      color: "text-pink-600",
    },
    {
      key: "experience",
      label: "Experience",
      icon: Briefcase,
      color: " text-orange-900",
    },
    {
      key: "employment",
      label: "Employment",
      icon: Briefcase,
      color: "text-purple-600",
    },
    {
      key: "bank",
      label: "Bank ",
      icon: Banknote,
      color: "text-green-600",
    },
    {
      key: "docs",
      label: "Documents",
      icon: FileText,
      color: "text-orange-600",
    },
  ] as const;

  const formatDate = (date?: string) => {
    if (!date) return null;
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch {
      return date;
    }
  };

  const documents = [
    { name: "Aadhaar Card", value: employee.aadhaarUploaded },
    { name: "PAN Card", value: employee.panUploaded },
    { name: "Passport Photo", value: employee.passportPhotoUploaded },
    { name: "12th Certificate", value: employee.twelthCertificateUploaded },
    {
      name: "Graduation Certificate",
      value: employee.graduationCertificateUploaded,
    },
    { name: "Signature", value: employee.signatureUploaded },

    { name: "Resume", value: employee.resumeUploaded },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[100vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b border-border p-6">
          <div className="flex items-start justify-between">
            <DialogHeader>
              <DialogTitle className="flex gap-10">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {(employee.firstName?.charAt(0) || "") +
                      (employee.lastName?.charAt(0) || "") || "NA"}
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{employee.employeeId}</span>
                      <span>•</span>
                      <span>{employee.subDepartment_name}</span>
                      <span>•</span>
                      <span>{employee.department_name}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={employee.status} />
              </DialogTitle>
            </DialogHeader>

            {/* Close Button */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                onClick={handleDownloadPDF}
                className="flex-1 gap-2"
                size="sm"
              >
                <Download size={14} /> PDF
              </Button>
              <Button onClick={handlePrint} className="flex-1 gap-2" size="sm">
                <Printer size={14} /> Print
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 border border-red-500 text-red-500 
               hover:bg-red-500 hover:text-white transition-all"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 py-2 text-md font-semibold rounded-md transition-all flex items-center justify-center gap-2",
                  tab === t.key
                    ? `bg-background shadow-sm ${t.color}`
                    : `${t.color} hover:bg-background/50`,
                )}
              >
                <t.icon size={20} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {tab === "personal" && (
            <>
              <Section
                title="Personal Information"
                icon={User}
                titleColor="text-blue-600"
                iconColor="text-blue-500"
              >
                <Field label="First Name" value={employee.firstName} />
                <Field label="Middle Name" value={employee.middleName} />
                <Field label="Last Name" value={employee.lastName} />
                <Field
                  label="Date of Birth"
                  value={formatDate(employee.dateOfBirth)}
                  icon={Calendar}
                />
                <Field label="Gender" value={employee.gender} />
                <Field label="Marital Status" value={employee.maritalStatus} />
                <Field label="Blood Group" value={employee.bloodGroup} />
              </Section>

              <Section
                title="Contact Details"
                icon={Phone}
                titleColor="text-blue-600"
                iconColor="text-blue-500"
              >
                <Field label="Office Contact" value={employee.officeNumber} />
                <Field label="Office Email" value={employee.officeEmail} />
                <Field
                  label="Personal Email"
                  value={employee.personalEmail}
                  icon={Mail}
                  className="col-span-1"
                />
                <Field
                  label="Personal Mobile"
                  value={employee.mobile}
                  icon={Phone}
                />
                <Field
                  label="Local Emergency Number"
                  value={employee.alternateNumber}
                />
                <Field label="Local Name" value={employee.localName} />
                <Field label="Local Relation" value={employee.localRelation} />
              </Section>

              <Section
                title="Address Information"
                icon={MapPin}
                titleColor="text-blue-600"
                iconColor="text-blue-500"
              >
                <Field
                  label="Current Address"
                  value={employee.currentAddress}
                  className="col-span-1"
                />
                <Field label="Current City" value={employee.currentCity} />
                <Field label="Current State" value={employee.currentState} />
                <Field
                  label="Current Pincode"
                  value={employee.currentPincode}
                />
                <Field
                  label="Permanent Address"
                  value={employee.permanentAddress}
                  className="col-span-1"
                />
                <Field label="Permanent City" value={employee.permanentCity} />
                <Field
                  label="Permanent State"
                  value={employee.permanentState}
                />
                <Field
                  label="Permanent Pincode"
                  value={employee.permanentPincode}
                />
              </Section>

              <Section
                title="Family Information"
                icon={Users}
                titleColor="text-blue-600"
                iconColor="text-blue-500"
              >
                <Field
                  label="Father Name"
                  value={employee.fatherName}
                  className="col-span-1"
                />
                <Field label="Relation" value={employee.fatherRelation} />
                <Field label="Contact Number" value={employee.fatherContact} />
                <Field label="Occupation" value={employee.fatherOccupation} />
                <Field
                  label="Mother Name"
                  value={employee.motherName}
                  className="col-span-1"
                />
                <Field label="Relation" value={employee.motherRelation} />
                <Field label="Contact Number" value={employee.motherContact} />
                <Field label="Occupation" value={employee.motherOccupation} />
                <Field
                  label="Spouse Name"
                  value={employee.spouseName}
                  className="col-span-1"
                />
                <Field label="Relation" value={employee.spouseRelation} />
                <Field label="Contact Number" value={employee.spouseContact} />
                <Field label="Occupation" value={employee.spouseOccupation} />
                <Field
                  label="Sibling Name"
                  value={employee.siblingName}
                  className="col-span-1"
                />
                <Field label="Relation" value={employee.siblingRelation} />
                <Field label="Contact Number" value={employee.siblingContact} />
                <Field label="Occupation" value={employee.siblingOccupation} />
              </Section>
            </>
          )}

          {tab === "education" && (
            <Section
              title="Educational Information"
              icon={GraduationCap}
              titleColor="text-pink-600"
              iconColor="text-pink-500"
            >
              {Array.isArray(employee.education) &&
                employee.education.map((edu: any, index: number) => (
                  <div
                    key={index}
                    className="col-span-full border rounded-lg p-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      {edu.qualificationTypes} Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Field
                        label="Qualification Types"
                        value={edu.qualificationTypes}
                      />
                      <Field label="Qualification" value={edu.qualification} />
                      <Field
                        label="Institute / Collage"
                        value={edu.institute}
                      />
                      <Field label="University" value={edu.university} />
                      <Field label="Location" value={edu.location} />
                      <Field label="City" value={edu.city} />
                      <Field
                        label="Year of Passing"
                        value={edu.yearOfPassing}
                      />
                      <Field label="Percentage / CGPA" value={edu.cgpa} />
                      <Field
                        label="Currently Pursuing?"
                        value={edu.pursuing ? "Yes" : "No"}
                      />
                      <Field
                        label="Education Left (Years)"
                        value={edu.educationLeft}
                      />
                      <Field label="Current Status" value={edu.currentYear} />
                      <Field label="School Name" value={edu.schoolName} />
                      <Field label="Board" value={edu.board} />
                    </div>
                  </div>
                ))}
            </Section>
          )}

          {tab === "experience" && (
            <>
              {Array.isArray(employee.experience) &&
                employee.experience.map((edu: any, index: number) => {
                  const experienceDocs = [
                    { name: "Offer Letter", value: edu.offerLetterUploaded },
                    {
                      name: "Experience Letter",
                      value: edu.experienceLetterUploaded,
                    },
                    { name: "Salary Slip", value: edu.salarySlipUploaded },
                    {
                      name: "Bank Statement",
                      value: edu.bankStatementUploaded,
                    },
                  ];

                  return (
                    <Section
                      key={index}
                      title={
                        <div className="flex items-center justify-between w-full">
                          <span>Previous Experience {index + 1}</span>
                          <span className="text-sm font-semibold text-orange-800 bg-purple-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock size={14} />
                            {edu.duration || "Not specified"}
                          </span>
                        </div>
                      }
                      titleColor="text-orange-800"
                      iconColor="text-orange-800"
                    >
                      <Field
                        label="Previous Company"
                        value={edu.previousCompany}
                      />
                      <Field label="Designation Title" value={edu.jobTitle} />
                      <Field label="Duration" value={edu.duration} />
                      <Field
                        label="Last Month Salary"
                        value={
                          edu.lastSalary
                            ? `₹${Number(edu.lastSalary).toLocaleString()}`
                            : null
                        }
                      />
                      <Field label="Joining Date" value={edu.joiningDate} />
                      <Field label="Relieving Date" value={edu.relievingDate} />
                      <Field
                        label="Company Address"
                        value={edu.reasonforLeaving}
                      />
                      <Field label="Reference Name" value={edu.referenceName} />
                      <Field
                        label="Reference Designation"
                        value={edu.referenceRoll}
                      />
                      <Field
                        label="Reference Contact"
                        value={edu.referenceContact}
                      />

                      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {experienceDocs.map((doc, i) => (
                          <DocumentBadge
                            key={i}
                            name={doc.name}
                            document={doc.value}
                          />
                        ))}
                      </div>
                    </Section>
                  );
                })}
            </>
          )}

          {tab === "employment" && (
            <>
              <Section
                title="Employment Details"
                icon={Briefcase}
                titleColor="text-purple-600"
                iconColor="text-purple-500"
              >
                <Field label="Grade" value={employee.grade} />
                <Field label="Designation" value={employee.designation} />
                <Field label="Department" value={employee.department_name} />
                <Field label="HO" value={employee.ho_name} />
                <Field
                  label="Sub-Department"
                  value={employee.subDepartment_name}
                />
                <Field label="Role" value={employee.role_name} />

                <Field
                  label="Reporting Manager"
                  value={employee.manager_name}
                />
                <Field label="HR Manager" value={employee.hrManager_name} />
                <Field label="Short Name" value={employee.shortName} />
              </Section>

              <Section
                title="Work Location"
                icon={MapPin}
                titleColor="text-purple-600"
                iconColor="text-purple-500"
              >
                <Field
                  label=" Office"
                  value={formatDate(employee.branch_name)}
                  icon={Calendar}
                />
                <Field label="Office Address" value={employee.workLocation} />
                <Field
                  label="Zone Name"
                  value={formatDate(employee.zoneName)}
                  icon={Calendar}
                />
              </Section>
              <Section
                title="Working Hours & Shifts"
                icon={Clock}
                titleColor="text-purple-600"
                iconColor="text-purple-500"
              >
                <Field label="Work Shift" value={employee.workShift} />

                <Field label="Shift Timing" value={employee.shiftTiming} />
                <Field label="Weekly Off" value={employee.weeklyoff} />
              </Section>

              <Section
                title="Official Information"
                icon={Calendar}
                titleColor="text-purple-600"
                iconColor="text-purple-500"
              >
                <Field
                  label="Joining Date"
                  value={formatDate(employee.joiningDate)}
                  icon={Calendar}
                />
                <Field
                  label="Probation Tenure"
                  value={formatDate(employee.probationTenure)}
                  icon={Calendar}
                />
                <Field
                  label="Confirmation Date "
                  value={formatDate(employee.confirmationDate)}
                  icon={Calendar}
                />
                <Field
                  label="Notice Period"
                  value={formatDate(employee.noticePeriod)}
                  icon={Calendar}
                />

                <Field
                  label="Annual CTC (₹)"
                  value={formatIndianCurrency(employee.ctc)}
                />
                <Field
                  label="Monthly Net Pay (₹)"
                  value={formatIndianCurrency(employee.basicSalary)}
                />
                <Field
                  label="Employment Type"
                  value={employee.employmentType}
                />
                <Field
                  label="Employee Status"
                  value={employee.employeeStatus}
                />
              </Section>
            </>
          )}

          {tab === "bank" && (
            <>
              <Section
                title="Bank Details"
                icon={Banknote}
                titleColor="text-green-600"
                iconColor="text-green-500"
              >
                <Field label="Bank Name" value={employee.bankName} />
                <Field
                  label="Account Holder Name"
                  value={employee.accountHolderName}
                />
                <Field label="Account Number" value={employee.accountNumber} />
                <Field label="IFSC Code" value={employee.ifscCode} />
                <Field label="Branch Name" value={employee.branch} />
                <Field label="Account Type" value={employee.accountType} />
                <Field label="UPI ID" value={employee.upiId} />

                {/* QR CODE SAME STYLE AS DOCUMENT */}
                <DocumentBadge
                  name="UPI QR Code"
                  document={employee.qrCodeUploaded}
                />
              </Section>

              <Section
                title="Statutory Details"
                icon={Shield}
                titleColor="text-green-600"
                iconColor="text-green-500"
              >
                <Field label="PF Number" value={employee.pfNumber} />
                <Field label="ESIC Number" value={employee.esicNumber} />
                <Field label="UAN Number" value={employee.uanNumber} />
              </Section>
            </>
          )}

          {tab === "docs" && (
            <Section
              title="Uploaded Documents"
              icon={FileText}
              titleColor="text-orange-600"
              iconColor="text-orange-500"
            >
              {documents.map((doc, index) => (
                <DocumentBadge
                  key={index}
                  name={doc.name}
                  document={doc.value}
                />
              ))}
            </Section>
          )}

          {employee.rejectionReason && (
            <div className="rounded-lg p-4 bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <XCircle size={16} />
                Rejection Reason
              </p>
              <p className="text-sm text-destructive/90 mt-1">
                {employee.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex flex-wrap gap-2">
            {(employee.status === "pending" ||
              employee.status === "resubmitted") && (
              <>
                <Button
                  onClick={() => handleApprove(employee.id)}
                  className="gap-2 bg-success hover:bg-success/90 text-white"
                >
                  <CheckCircle size={16} /> Approve
                </Button>
                {!showReject ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowReject(true)}
                    className="gap-2"
                  >
                    <XCircle size={16} /> Reject
                  </Button>
                ) : (
                  <div className="w-full space-y-2">
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(employee.id)}
                        className="gap-1"
                        size="sm"
                      >
                        <XCircle size={14} /> Confirm Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReject(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
