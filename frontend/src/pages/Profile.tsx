// src/pages/Profile.tsx

import { useState } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { format } from "date-fns";
import {
  User,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Banknote,
  FileText,
  Users,
  Shield,
  Clock,
  ExternalLink,
  Building2,
  CalendarDays,
  TrendingUp,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey =
  | "personal"
  | "education"
  | "experience"
  | "employment"
  | "bank"
  | "family"
  | "docs";

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS: {
  key: TabKey;
  label: string;
  icon: any;
  accent: string;
  activeBg: string;
  activeText: string;
}[] = [
  {
    key: "personal",
    label: "Personal",
    icon: User,
    accent: "#3B82F6",
    activeBg: "bg-blue-600",
    activeText: "text-white",
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    accent: "#EC4899",
    activeBg: "bg-pink-500",
    activeText: "text-white",
  },
  {
    key: "experience",
    label: "Experience",
    icon: Clock,
    accent: "#F97316",
    activeBg: "bg-orange-500",
    activeText: "text-white",
  },
  {
    key: "employment",
    label: "Employment",
    icon: Briefcase,
    accent: "#8B5CF6",
    activeBg: "bg-violet-600",
    activeText: "text-white",
  },
  {
    key: "bank",
    label: "Bank",
    icon: Banknote,
    accent: "#10B981",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
  },
  {
    key: "family",
    label: "Family",
    icon: Users,
    accent: "#06B6D4",
    activeBg: "bg-cyan-500",
    activeText: "text-white",
  },
  {
    key: "docs",
    label: "Documents",
    icon: FileText,
    accent: "#F59E0B",
    activeBg: "bg-amber-500",
    activeText: "text-white",
  },
];

// ─── Section card ───────────────────────────────────────────────────────────
const Section = ({
  title,
  icon: Icon,
  children,
  accentColor = "#3B82F6",
  borderLeft = "#3B82F6",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  accentColor?: string;
  borderLeft?: string;
}) => (
  <div
    className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4 overflow-hidden shadow-sm"
    style={{ borderLeft: `4px solid ${borderLeft}` }}
  >
    <div
      className="flex items-center gap-2 px-5 py-3"
      style={{ background: `${accentColor}10` }}
    >
      <div
        className="p-1.5 rounded-lg"
        style={{ background: `${accentColor}20` }}
      >
        <Icon size={15} style={{ color: accentColor }} />
      </div>
      <h3
        className="text-sm font-bold tracking-wide uppercase"
        style={{ color: accentColor, letterSpacing: "0.06em" }}
      >
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 divide-x divide-y divide-gray-100 dark:divide-gray-800">
      {children}
    </div>
  </div>
);

// ─── Field ──────────────────────────────────────────────────────────────────
const Field = ({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string | number | null;
  accent?: string;
}) => (
  <div className="px-4 py-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <p className="text-[12px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">
      {label}
    </p>
    <p
      className={cn(
        "text-md font-semibold break-words leading-snug",
        value
          ? "text-gray-800 dark:text-gray-100"
          : "text-gray-300 dark:text-gray-600",
      )}
    >
      {value || "—"}
    </p>
  </div>
);

// ─── DocBadge ───────────────────────────────────────────────────────────────
const DocBadge = ({
  name,
  url,
  index,
}: {
  name: string;
  url?: string | null;
  index: number;
}) => {
  const colors = [
    { bg: "#EFF6FF", icon: "#3B82F6", border: "#BFDBFE" },
    { bg: "#FDF4FF", icon: "#A855F7", border: "#E9D5FF" },
    { bg: "#ECFDF5", icon: "#10B981", border: "#A7F3D0" },
    { bg: "#FFF7ED", icon: "#F97316", border: "#FED7AA" },
    { bg: "#FFF1F2", icon: "#F43F5E", border: "#FECDD3" },
    { bg: "#F0FDFA", icon: "#06B6D4", border: "#A5F3FC" },
    { bg: "#FEFCE8", icon: "#EAB308", border: "#FEF08A" },
    { bg: "#F0FDF4", icon: "#22C55E", border: "#BBF7D0" },
  ];
  const c = colors[index % colors.length];

  return (
    <div
      onClick={() => url && window.open(url, "_blank")}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
        url
          ? "cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-[0.99]"
          : "opacity-40 cursor-not-allowed",
      )}
      style={{
        background: url ? c.bg : "#F9FAFB",
        borderColor: url ? c.border : "#E5E7EB",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: url ? `${c.icon}20` : "#F3F4F6" }}
      >
        <FileText size={15} style={{ color: url ? c.icon : "#9CA3AF" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
          {name}
        </p>
        <p
          className="text-[10px] flex items-center gap-1 mt-0.5"
          style={{ color: url ? c.icon : "#9CA3AF" }}
        >
          {url ? (
            <>
              <ExternalLink size={9} /> Click to view
            </>
          ) : (
            "Not uploaded"
          )}
        </p>
      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => {
  if (!d) return undefined;
  try {
    return format(new Date(d), "dd MMM yyyy");
  } catch {
    return d;
  }
};

const fmtCurrency = (v?: Number | null) => {
  if (!v) return undefined;
  return `₹${Number(v).toLocaleString("en-IN")}`;
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Profile() {
  const [tab, setTab] = useState<TabKey>("personal");
  const emp = useAppSelector((s) => s.user.currentEmployee);

  if (!emp) return null;

  const currentTab = TABS.find((t) => t.key === tab)!;

  const initials =
    ((emp.firstName?.[0] || "") + (emp.lastName?.[0] || "")).toUpperCase() ||
    emp.fullName?.[0]?.toUpperCase() ||
    "?";

  const docs = [
    { name: "Aadhaar card", url: emp.aadhaarUploaded },
    { name: "PAN card", url: emp.panUploaded },
    { name: "Passport photo", url: emp.passportPhotoUploaded },
    { name: "Resume", url: emp.resumeUploaded },
    { name: "12th certificate", url: emp.twelthCertificateUploaded },
    { name: "Graduation certificate", url: emp.graduationCertificateUploaded },
    { name: "Signature", url: emp.signatureUploaded },
    { name: "UPI QR code", url: emp.qrCodeUploaded },
  ];

  const statsConfig = [
    {
      label: "Grade",
      value: emp.grade,
      icon: Layers,
      color: "#8B5CF6",
      bg: "#F5F3FF",
    },
    {
      label: "Monthly Pay",
      value: fmtCurrency(emp.basicSalary),
      icon: TrendingUp,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "Annual CTC",
      value: fmtCurrency(emp.ctc),
      icon: Banknote,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      label: "Work Shift",
      value: emp.workShift,
      icon: Clock,
      color: "#F97316",
      bg: "#FFF7ED",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          {/* gradient banner */}
          <div
            className="h-24 w-full"
            style={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)",
            }}
          />

          <div className="bg-white dark:bg-gray-900 px-6 pb-5">
            <div className="flex flex-wrap items-end gap-4 -mt-8">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg flex-shrink-0 border-4 border-white dark:border-gray-900"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {initials}
              </div>

              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                  </h1>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                      emp.employeeStatus?.toLowerCase() === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {emp.employeeStatus || "—"}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 uppercase tracking-wider">
                    {emp.role}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-1.5">
                  {[
                    { icon: Building2, val: emp.employeeId },
                    { icon: Briefcase, val: emp.designation },
                    { icon: Layers, val: emp.department_name },
                    { icon: MapPin, val: emp.branch_name },
                  ].map(
                    ({ icon: Icon, val }) =>
                      val && (
                        <span
                          key={val}
                          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium"
                        >
                          <Icon size={11} className="text-gray-400" />
                          {val}
                        </span>
                      ),
                  )}
                </div>
              </div>

              <div className="text-right pb-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">
                  Joined
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <CalendarDays size={12} className="text-violet-500" />
                  {fmtDate(emp.joiningDate) || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsConfig.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  {s.label}
                </p>
                <p
                  className="text-base font-black truncate"
                  style={{ color: s.color }}
                >
                  {s.value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1.5 p-1.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 min-w-[72px] py-2 px-2 rounded-xl text-[15px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap",
                tab === t.key
                  ? `${t.activeBg} ${t.activeText} shadow-md`
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}

        {tab === "personal" && (
          <>
            <Section
              title="Personal information"
              icon={User}
              accentColor="#3B82F6"
              borderLeft="#3B82F6"
            >
              <Field label="First name" value={emp.firstName} />
              <Field label="Middle name" value={emp.middleName} />
              <Field label="Last name" value={emp.lastName} />
              <Field label="Date of birth" value={fmtDate(emp.dateOfBirth)} />
              <Field label="Gender" value={emp.gender} />
              <Field label="Marital status" value={emp.maritalStatus} />
              <Field label="Blood group" value={emp.bloodGroup} />
            </Section>

            <Section
              title="Contact details"
              icon={Phone}
              accentColor="#06B6D4"
              borderLeft="#06B6D4"
            >
              <Field label="Personal email" value={emp.personalEmail} />
              <Field
                label="Office email"
                value={emp.officeEmail || emp.companyEmail}
              />
              <Field label="Mobile" value={emp.mobile} />
              <Field label="Alternate number" value={emp.alternateNumber} />
              <Field label="Local contact name" value={emp.localName} />
              <Field label="Local relation" value={emp.localRelation} />
            </Section>

            <Section
              title="Address information"
              icon={MapPin}
              accentColor="#8B5CF6"
              borderLeft="#8B5CF6"
            >
              <Field label="Current address" value={emp.currentAddress} />
              <Field label="Current city" value={emp.currentCity} />
              <Field label="Current state" value={emp.currentState} />
              <Field label="Current pincode" value={emp.currentPincode} />
              <Field label="Permanent address" value={emp.permanentAddress} />
              <Field label="Permanent city" value={emp.permanentCity} />
              <Field label="Permanent state" value={emp.permanentState} />
              <Field label="Permanent pincode" value={emp.permanentPincode} />
            </Section>
          </>
        )}

        {tab === "education" && (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                background: "#EC489910",
                borderLeft: "4px solid #EC4899",
              }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: "#EC489920" }}
              >
                <GraduationCap size={15} style={{ color: "#EC4899" }} />
              </div>
              <h3
                className="text-sm font-bold tracking-wide uppercase"
                style={{ color: "#EC4899", letterSpacing: "0.06em" }}
              >
                Educational information
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {emp.education?.length ? (
                emp.education.map((e, i) => (
                  <div
                    key={i}
                    className="border border-pink-100 dark:border-pink-900/30 rounded-xl overflow-hidden"
                  >
                    <div className="bg-pink-50 dark:bg-pink-900/20 px-4 py-2.5">
                      <p className="text-xs font-black text-pink-700 dark:text-pink-400 uppercase tracking-wider">
                        {e.qualificationTypes || `Education ${i + 1}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-gray-100 dark:divide-gray-800">
                      <Field label="Qualification" value={e.qualification} />
                      <Field label="Institute" value={e.institute} />
                      <Field label="University" value={e.university} />
                      <Field label="Location" value={e.location} />
                      <Field label="Year of passing" value={e.yearOfPassing} />
                      <Field label="Percentage / CGPA" value={e.cgpa} />
                      <Field
                        label="Currently pursuing"
                        value={e.pursuing ? "Yes" : "No"}
                      />
                      <Field label="Board" value={e.board} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No education records found.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "experience" &&
          (emp.experience?.length ? (
            emp.experience.map((e, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm mb-4"
                style={{ borderLeft: "4px solid #F97316" }}
              >
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ background: "#F9731610" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ background: "#F9731620" }}
                    >
                      <Clock size={15} style={{ color: "#F97316" }} />
                    </div>
                    <h3
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ color: "#F97316", letterSpacing: "0.06em" }}
                    >
                      Experience {i + 1}
                    </h3>
                  </div>
                  {e.duration && (
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      {e.duration}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-gray-100 dark:divide-gray-800">
                  <Field label="Company" value={e.previousCompany} />
                  <Field label="Job title" value={e.jobTitle} />
                  <Field label="Duration" value={e.duration} />
                  <Field
                    label="Last salary"
                    value={
                      e.lastSalary
                        ? `₹${Number(e.lastSalary).toLocaleString("en-IN")}`
                        : undefined
                    }
                  />
                  <Field label="Joining date" value={e.joiningDate} />
                  <Field label="Relieving date" value={e.relievingDate} />
                  <Field label="Reference name" value={e.referenceName} />
                  <Field label="Reference contact" value={e.referenceContact} />
                </div>
                {/* Experience docs */}
                <div className="px-5 pb-5 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: "Offer letter", url: e.offerLetterUploaded },
                    {
                      name: "Experience letter",
                      url: e.experienceLetterUploaded,
                    },
                    { name: "Salary slip", url: e.salarySlipUploaded },
                    { name: "Bank statement", url: e.bankStatementUploaded },
                  ].map((doc, di) => (
                    <DocBadge
                      key={di}
                      name={doc.name}
                      url={doc.url}
                      index={di}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 p-6 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100">
              No experience records found.
            </p>
          ))}

        {tab === "employment" && (
          <>
            <Section
              title="Employment details"
              icon={Briefcase}
              accentColor="#8B5CF6"
              borderLeft="#8B5CF6"
            >
              <Field label="Grade" value={emp.grade} />
              <Field label="Designation" value={emp.designation} />
              <Field label="Department" value={emp.department_name} />
              <Field label="Sub-department" value={emp.subDepartment_name} />
              <Field label="Role" value={emp.role_name} />
              <Field label="HO" value={emp.ho_name} />
              <Field label="Reporting manager" value={emp.manager_firstName} />
              <Field label="HR manager" value={emp.hrManager} />
              <Field label="Employment type" value={emp.employmentType} />
              <Field label="Employee status" value={emp.employeeStatus} />
            </Section>

            <Section
              title="Official information"
              icon={CalendarDays}
              accentColor="#A855F7"
              borderLeft="#A855F7"
            >
              <Field label="Joining date" value={fmtDate(emp.joiningDate)} />
              <Field
                label="Confirmation date"
                value={fmtDate(emp.confirmationDate)}
              />
              <Field label="Probation tenure" value={emp.probationTenure} />
              <Field label="Notice period" value={emp.noticePeriod} />
              <Field label="Work shift" value={emp.workShift} />
              <Field label="Shift timing" value={emp.shiftTiming} />
              <Field label="Weekly off" value={emp.weeklyoff} />
              <Field label="Work location" value={emp.workLocation} />
              <Field label="Branch" value={emp.branch_name} />
              <Field label="Zone" value={emp.zoneName} />
            </Section>
          </>
        )}

        {tab === "bank" && (
          <>
            <Section
              title="Bank details"
              icon={Banknote}
              accentColor="#10B981"
              borderLeft="#10B981"
            >
              <Field label="Bank name" value={emp.bankName} />
              <Field label="Account holder" value={emp.accountHolderName} />
              <Field label="Account number" value={emp.accountNumber} />
              <Field label="IFSC code" value={emp.ifscCode} />
              <Field label="Branch name" value={emp.branch} />
              <Field label="Account type" value={emp.accountType} />
              <Field label="UPI ID" value={emp.upiId} />
            </Section>

            <Section
              title="Statutory details"
              icon={Shield}
              accentColor="#059669"
              borderLeft="#059669"
            >
              <Field label="PF number" value={emp.pfNumber} />
              <Field label="ESIC number" value={emp.esicNumber} />
              <Field label="UAN number" value={emp.uanNumber} />
            </Section>
          </>
        )}

        {tab === "family" && (
          <>
            {[
              {
                label: "Father",
                name: emp.fatherName,
                rel: emp.fatherRelation,
                contact: emp.fatherContact,
                occ: emp.fatherOccupation,
                color: "#3B82F6",
              },
              {
                label: "Mother",
                name: emp.motherName,
                rel: emp.motherRelation,
                contact: emp.motherContact,
                occ: emp.motherOccupation,
                color: "#EC4899",
              },
              {
                label: "Spouse",
                name: emp.spouseName,
                rel: emp.spouseRelation,
                contact: emp.spouseContact,
                occ: emp.spouseOccupation,
                color: "#8B5CF6",
              },
              {
                label: "Sibling",
                name: emp.siblingName,
                rel: emp.siblingRelation,
                contact: emp.siblingContact,
                occ: emp.siblingOccupation,
                color: "#06B6D4",
              },
            ].map((member) => (
              <div
                key={member.label}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm mb-3"
                style={{ borderLeft: `4px solid ${member.color}` }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-2.5"
                  style={{ background: `${member.color}10` }}
                >
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ background: `${member.color}20` }}
                  >
                    <Users size={13} style={{ color: member.color }} />
                  </div>
                  <h3
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: member.color }}
                  >
                    {member.label}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100 dark:divide-gray-800">
                  <Field label="Name" value={member.name} />
                  <Field label="Relation" value={member.rel} />
                  <Field label="Contact" value={member.contact} />
                  <Field label="Occupation" value={member.occ} />
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "docs" && (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                background: "#F59E0B10",
                borderLeft: "4px solid #F59E0B",
              }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: "#F59E0B20" }}
              >
                <FileText size={15} style={{ color: "#F59E0B" }} />
              </div>
              <h3
                className="text-sm font-bold tracking-wide uppercase"
                style={{ color: "#F59E0B", letterSpacing: "0.06em" }}
              >
                Uploaded documents
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {docs.map((d, i) => (
                <DocBadge key={i} name={d.name} url={d.url} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
