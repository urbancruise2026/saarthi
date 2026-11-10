import { useState } from "react";
import { Eye, X, Plus } from "lucide-react";
import { OnboardingData } from "@/types";
import { useAppSelector } from "@/hooks/useRedux";
import { OnboardingVerifyForm } from "@/components/OnboardingVerifyForm";

export const mockActivityData = {
  employeeName: "Rahul Sharma",
  department: "Sales",
  joiningProcess: {
    dateOfJoining: "2024-03-01",
    documentVerification: "yes",
    employmentForm: "yes",
    trainingSchedule: "yes",
    joiningKit: "no",
    attendance: "yes",
  },
  seatingArrangement: {
    deskAllotment: "yes",
    desktopAllotment: "no",
  },
  trainingPart1: {
    hrPolicies2and3: "yes",
    hrPolicies4and5: "no",
  },
  mobileAccessories: {
    mobileCover: "yes",
    simCard: "yes",
    standMobile: "no",
    headphone: "yes",
  },
  readiness: {
    calculator: "yes",
    digitalBusinessCard: "no",
    mobileConfigured: "yes",
    desktopConfigured: "yes",
    dsr: "no",
    liveDsr: "yes",
  },
  trainingPart2: {
    completed: "yes",
    remarks: "Training completed successfully",
  },
  hrProcess: {
    backgroundCheck: "yes",
    offerLetter: "yes",
    offerLetterDate: "2024-03-11",
  },
  confirmation: {
    eligibilityDate: "2024-07-01",
    acceptance: "yes",
  },
};

interface ActivityRow {
  label: string;
  value: string;
}

interface ActivitySection {
  title: string;
  rows: ActivityRow[];
}

const buildSections = (data: OnboardingData): ActivitySection[] => [
  {
    title: "Employee Information",
    rows: [
      { label: "Employee Name", value: data.employeeName },
      { label: "Department", value: data.department },
      { label: "Date of Joining", value: data.joiningProcess.dateOfJoining },
    ],
  },
  {
    title: "Joining Process",
    rows: [
      {
        label: "Document Verification",
        value: data.joiningProcess.documentVerification,
      },
      { label: "Employment Form", value: data.joiningProcess.employmentForm },
      {
        label: "Training Schedule",
        value: data.joiningProcess.trainingSchedule,
      },
      { label: "Joining Kit", value: data.joiningProcess.joiningKit },
      { label: "Attendance (WA Group)", value: data.joiningProcess.attendance },
    ],
  },
  {
    title: "Seating Arrangement",
    rows: [
      {
        label: "Desk Allotment (Chair)",
        value: data.seatingArrangement.deskAllotment,
      },
      {
        label: "Desktop Allotment (PC, Mouse, KB)",
        value: data.seatingArrangement.desktopAllotment,
      },
    ],
  },
  {
    title: "Training - Part 1",
    rows: [
      { label: "HR Policies 2 & 3", value: data.trainingPart1.hrPolicies2and3 },
      { label: "HR Policies 4 & 5", value: data.trainingPart1.hrPolicies4and5 },
    ],
  },
  {
    title: "Mobile, Cover & SIM Card",
    rows: [
      { label: "Mobile Cover", value: data.mobileAccessories.mobileCover },
      { label: "SIM Card", value: data.mobileAccessories.simCard },
      { label: "Stand - Mobile", value: data.mobileAccessories.standMobile },
      { label: "Headphone", value: data.mobileAccessories.headphone },
    ],
  },
  {
    title: "Readiness",
    rows: [
      { label: "Calculator", value: data.readiness.calculator },
      {
        label: "Digital Business Card",
        value: data.readiness.digitalBusinessCard,
      },
      { label: "Mobile Configured", value: data.readiness.mobileConfigured },
      { label: "Desktop Configured", value: data.readiness.desktopConfigured },
      { label: "DSR", value: data.readiness.dsr },
      { label: "Live-DSR", value: data.readiness.liveDsr },
    ],
  },
  {
    title: "Training - Part 2",
    rows: [
      { label: "Completed", value: data.trainingPart2.completed },
      { label: "Remarks", value: data.trainingPart2.remarks },
    ],
  },
  {
    title: "HR Process",
    rows: [
      { label: "Background Check", value: data.hrProcess.backgroundCheck },
      { label: "Offer Letter", value: data.hrProcess.offerLetter },
      ...(data.hrProcess.offerLetter === "yes"
        ? [
            {
              label: "Offer Letter Date",
              value: data.hrProcess.offerLetterDate,
            },
          ]
        : []),
    ],
  },
  {
    title: "Confirmation",
    rows: [
      { label: "Eligibility Date", value: data.confirmation.eligibilityDate },
      { label: "Acceptance", value: data.confirmation.acceptance },
    ],
  },
];

const StatusBadge = ({ value }: { value: string }) => {
  if (value === "yes")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        ✓ Yes
      </span>
    );
  if (value === "no")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-500">
        ✗ No
      </span>
    );
  return <span className="text-gray-700 text-sm">{value || "—"}</span>;
};

// Details Modal
const DetailsModal = ({
  employee,
  isOpen,
  onClose,
}: {
  employee: OnboardingData | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !employee) return null;

  const sections = buildSections(employee);

  const allYesNo = sections.flatMap((s) =>
    s.rows.filter((r) => r.value === "yes" || r.value === "no"),
  );
  const completed = allYesNo.filter((r) => r.value === "yes").length;
  const total = allYesNo.length;
  const percent = Math.round((completed / (total || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Onboarding Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {employee.employeeName} • {employee.department}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-80px)]">
          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Overall Completion
              </span>
              <span className="text-sm font-bold text-green-600">
                {completed} / {total} ({percent}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="bg-purple-50 px-4 py-2 border-b border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-700">
                    {section.title}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.rows.map((row, idx) => (
                    <div key={idx} className="flex justify-between px-4 py-2">
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <StatusBadge value={row.value} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface OnboardingVerifyTableProps {
  data?: OnboardingData[];
}

export const OnboardingVerifyTable = ({
  data = [mockActivityData],
}: OnboardingVerifyTableProps) => {
  const [selectedEmployee, setSelectedEmployee] =
    useState<OnboardingData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const handleViewDetails = (employee: OnboardingData) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const { employees } = useAppSelector((state) => state.user);

  const calculateCompletion = (employeeData: OnboardingData) => {
    const sections = buildSections(employeeData);
    const allYesNo = sections.flatMap((s) =>
      s.rows.filter((r) => r.value === "yes" || r.value === "no"),
    );
    const completed = allYesNo.filter((r) => r.value === "yes").length;
    const total = allYesNo.length;
    const percent = Math.round((completed / (total || 1)) * 100);
    return { completed, total, percent };
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Onboarding Verify
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage employee onboarding verification
            </p>
          </div>
          <button
            onClick={() => setOpenForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={15} /> Add Onboarding Verify
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Employees",
              value: employees.length,
              color: "primary",
            },
            {
              label: "Verified",
              value: data.filter((e) => {
                const { completed, total } = calculateCompletion(e);
                return completed === total && total > 0;
              }).length,
              color: "success",
            },
            {
              label: "In Progress",
              value: data.filter((e) => {
                const { completed, total } = calculateCompletion(e);
                return completed < total && completed > 0;
              }).length,
              color: "warning",
            },
            {
              label: "Pending",
              value: data.filter((e) => {
                const { completed } = calculateCompletion(e);
                return completed === 0;
              }).length,
              color: "muted",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <p
                className="text-2xl font-bold"
                style={{ color: `hsl(var(--${color}))` }}
              >
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                  Employee Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                  Joining Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                  Progress
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-purple-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((employee, index) => {
                const { completed, total, percent } =
                  calculateCompletion(employee);
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {employee.employeeName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {employee.department}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {employee.joiningProcess.dateOfJoining}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[150px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 min-w-[60px]">
                          {completed}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetails(employee)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                      >
                        <Eye size={14} />
                        <span className="text-xs font-medium">
                          View Details
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No onboarding data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <DetailsModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Add Onboarding Form Modal */}
      <OnboardingVerifyForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(savedData) => {
          console.log("Saved data:", savedData);
          setOpenForm(false);
        }}
      />
    </>
  );
};
