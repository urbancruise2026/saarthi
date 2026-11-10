import { useState, useEffect } from "react";
import { Eye, X, Plus, Shield, Pencil } from "lucide-react"; // ChevronLeft/Right hata diya
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { StatusBadge } from "@/components/StatusBadge";
// ← naya import
import { BackgroundVerificationForm } from "@/components/formFolders/BackgroundVerificationForm";
import { getAllBGVThunk } from "@/redux/features/BackgroundVerification/BackgroundVerificationSlice";
import { BGVRecord } from "@/types";
import { Pagination } from "@/components/Pagination/Pagination";

// ─── Details Modal ──────────────────────────────────────────────────────────────

const DetailsModal = ({
  record,
  isOpen,
  onClose,
  onEdit,
}: {
  record: BGVRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: BGVRecord) => void;
}) => {
  if (!isOpen || !record) return null;

  const verificationRows = [
    {
      label: "Contact Number",
      key: "contact_number",
      value: record.contact_number,
    },
    {
      label: "Alternate Number",
      key: "alternate_number",
      value: record.alternate_number,
    },
    {
      label: "Father Contact",
      key: "father_contact",
      value: record.father_contact,
    },
    {
      label: "Mother Contact",
      key: "mother_contact",
      value: record.mother_contact,
    },
    {
      label: "Current Address",
      key: "current_address",
      value: record.current_address,
    },
    {
      label: "Permanent Address",
      key: "permanent_address",
      value: record.permanent_address,
    },
    {
      label: "Identity Proof",
      key: "identity_proof",
      value: record.identity_proof,
    },
    {
      label: "Education Proof",
      key: "education_proof",
      value: record.education_proof,
    },
    {
      label: "Previous Employment",
      key: "previous_employment",
      value: record.previous_employment,
    },
    {
      label: "Criminal Record",
      key: "criminal_record",
      value: record.criminal_record,
    },
    {
      label: "Reference Check",
      key: "reference_check",
      value: record.reference_check,
    },
  ] as const;

  const statuses = verificationRows.map((r) => r.value);
  const verifiedCount = statuses.filter((s) => s === "verified").length;
  const failedCount = statuses.filter((s) => s === "failed").length;
  const pendingCount = statuses.filter((s) => s === "pending").length;
  const total = statuses.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">BGV Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {record.fullName} • {record.employee_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={record.overall_status ?? "pending"} />
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="p-1 rounded-lg border-2 border-blue-600 hover:bg-blue-600 transition-colors text-blue-700 hover:text-white"
              title="Edit"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg border-2 border-red-600 hover:bg-red-600 transition-colors text-red-700 hover:text-white"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
              <p className="text-2xl font-bold text-green-600">
                {verifiedCount}
              </p>
              <p className="text-xs text-green-700 font-medium">Verified</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center border border-red-100">
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              <p className="text-xs text-red-700 font-medium">Failed</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-100">
              <p className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>
              <p className="text-xs text-yellow-700 font-medium">Pending</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Verification Progress
              </span>
              <span className="text-sm font-bold text-blue-600">
                {verifiedCount} / {total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(verifiedCount / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <h3 className="text-sm font-semibold text-blue-700">
                Employee Information
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: "Employee ID", value: String(record.employee_id) },
                { label: "Full Name", value: record.fullName },
                { label: "Remarks", value: record.remarks },
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium text-gray-800 text-right max-w-[55%]">
                    {row.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Checks */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <h3 className="text-sm font-semibold text-blue-700">
                Verification Checks
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {verificationRows.map((row) => (
                <div
                  key={row.key}
                  className="flex justify-between items-center px-4 py-2.5"
                >
                  <p className="text-sm text-gray-700 font-medium">
                    {row.label}
                  </p>
                  <StatusBadge status={row.value ?? "pending"} />
                </div>
              ))}
            </div>
          </div>

          {record.remarks && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Remarks
              </p>
              <p className="text-sm text-gray-700">{record.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

function BackgroundVerification() {
  const dispatch = useAppDispatch();
  const { allBGVData, pagination, listLoading, listError } = useAppSelector(
    (state) => state.bgv,
  );

  const [selectedRecord, setSelectedRecord] = useState<BGVRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editRecord, setEditRecord] = useState<BGVRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(getAllBGVThunk({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  const handleSave = () => {
    setOpenForm(false);
    setEditRecord(null);
    dispatch(getAllBGVThunk({ page: 1, limit }));
    setCurrentPage(1);
  };

  const handleViewDetails = (record: BGVRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record: BGVRecord) => {
    setEditRecord(record);
    setOpenForm(true);
  };

  const verifiedCount = allBGVData.filter(
    (r) => r.overall_status === "verified",
  ).length;
  const failedCount = allBGVData.filter(
    (r) => r.overall_status === "failed",
  ).length;
  const pendingCount = allBGVData.filter(
    (r) => r.overall_status === "pending" || !r.overall_status,
  ).length;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Background Verification
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Employee background check aur verification status manage karein
            </p>
          </div>
          <button
            onClick={() => {
              setEditRecord(null);
              setOpenForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={15} /> Add BGV Record
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Records",
              value: pagination?.total ?? 0,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              label: "Verified",
              value: verifiedCount,
              color: "text-green-600",
              bg: "bg-green-50",
              border: "border-green-100",
            },
            {
              label: "Failed",
              value: failedCount,
              color: "text-red-600",
              bg: "bg-red-50",
              border: "border-red-100",
            },
            {
              label: "Pending",
              value: pendingCount,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
              border: "border-yellow-100",
            },
          ].map(({ label, value, color, bg, border }) => (
            <div
              key={label}
              className={`rounded-xl border ${border} ${bg} p-4 text-center`}
            >
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {listError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {listError}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">
                  Employee Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 hidden sm:table-cell">
                  Employee ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 hidden md:table-cell">
                  Remarks
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">
                  Overall Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {listLoading
                ? Array.from({ length: limit }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 animate-pulse"
                    >
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="h-4 bg-gray-200 rounded w-40" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-12 mx-auto" />
                      </td>
                    </tr>
                  ))
                : allBGVData.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                            {record.fullName?.[0] ?? "?"}
                          </div>
                          <p className="font-medium text-gray-900">
                            {record.fullName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {record.employee_id}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                        {record.remarks || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={record.overall_status ?? "pending"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <Eye size={14} />
                            <span className="text-xs font-medium">View</span>
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <Pencil size={14} />
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!listLoading && allBGVData.length === 0 && (
            <div className="text-center py-12">
              <Shield size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Koi BGV record nahi mila</p>
              <button
                onClick={() => setOpenForm(true)}
                className="mt-3 text-blue-600 text-sm hover:underline"
              >
                Pehla record add karein
              </button>
            </div>
          )}

          {/* ─── Pagination Component ─── */}
          {pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={limit}
              hasPrevPage={pagination.hasPrevPage}
              hasNextPage={pagination.hasNextPage}
              onPageChange={setCurrentPage}
              onLimitChange={(newLimit) => {
                // ← ye add karo
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>

      {/* Details Modal */}
      <DetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        onEdit={handleEdit}
      />

      {/* Add / Edit BGV Form */}
      <BackgroundVerificationForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditRecord(null);
        }}
        onSave={handleSave}
        editData={editRecord}
      />
    </>
  );
}

export default BackgroundVerification;
