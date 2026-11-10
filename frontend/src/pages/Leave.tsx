import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Gift,
  Building2,
  ClipboardList,
  CalendarClock,
  Plus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/redux/store";
// apne actual path se update kar lena

import { daysBetween } from "@/utils/leaveUtils";
import ApplyLeaveModal from "@/components/Leave/ApplyLeaveModal";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import DepartmentFilter from "@/components/FilterComponent/DepartmentFilter";
import EmployeeFilter from "@/components/FilterComponent/EmployeeFilter";

import {
  fetchHolidays,
  createHolidayThunk,
  updateHolidayThunk,
  deleteHolidayThunk,
} from "@/redux/features/Calendar/calendarSlice";

import { TAB_CONTENT } from "@/components/Leave/Leaveutils";
import LeaveRequestsTab from "@/components/Leave/LeaveRequestsTab";
import AssignLeaveTab, {
  AssignLeaveFormData,
} from "@/components/Leave/AssignLeaveTab";
import HolidayManager from "@/components/Callender/Holidaymanager";
import DutyRoster from "@/components/Leave/Dutyroster";

import {
  applyLeaveThunk,
  getAllLeavesThunk,
  updateLeaveStatusThunk,
  getLeaveBalanceSummaryThunk, // NEW
} from "@/redux/features/Leave/leaveSlice";
import CompOffTable from "@/components/Leave/Compofftable";
import { useAccessControl } from "@/utils/Accesscontrol";
import { Pagination } from "@/components/Pagination/Pagination";
import LeaveManagementTable from "@/components/Leave/LeaveManagementTable";
import UpdateLeaveStatusDialog from "@/components/Leave/UpdateLeaveStatusDialog";
import LeaveBalanceCards from "@/components/Leave/Leavebalancecards";

interface LeaveFilters {
  branchId?: string;
  departmentId?: string;
  employeeId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// "all" ya empty value ka matlab: filter laga hi nahi
const isActiveFilter = (v: string) => v !== "" && v !== "all";

function Leave() {
  const dispatch = useAppDispatch();
  const { isSuperAdmin, can } = useAccessControl();

  // Is permission wale users (HR/Admin) ko hi Approve/Reject action dikhega
  const canSeeFilters = can("LEAVE_FILTERS");

  const [activeTab, setActiveTab] = useState("leave");
  const headerContent = TAB_CONTENT[activeTab] ?? TAB_CONTENT.leave;

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    leaves,
    loading: leavesLoading,
    total = 0,
    totalPages = 1,
    hasNextPage = false,
    hasPrevPage = false,
    actionLoadingId = null,
    balanceSummary = null, // NEW
    balanceSummaryLoading = false, // NEW
  } = useAppSelector((s: RootState) => s.leave);

  // ---------- Leave filters (Attendance page jaisa: default "all") ----------
  const [leaveBranchId, setLeaveBranchId] = useState<string>("all");
  const [leaveDepartmentId, setLeaveDepartmentId] = useState<string>("all");
  const [leaveEmployeeId, setLeaveEmployeeId] = useState<string>("all");
  const [leaveStatus, setLeaveStatus] = useState<string>("");

  const hasAnyLeaveFilter =
    isActiveFilter(leaveBranchId) ||
    isActiveFilter(leaveDepartmentId) ||
    isActiveFilter(leaveEmployeeId) ||
    leaveStatus !== "";

  // ---------- Leave tab ki pagination state ----------
  const [leavePage, setLeavePage] = useState<number>(1);
  const [leaveLimit, setLeaveLimit] = useState<number>(10);

  // ---------- Approve/Reject dialog state ----------
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetLeave, setTargetLeave] = useState<{
    id: string | number;
    name?: string;
  } | null>(null);

  // koi bhi filter change ho to page ko wapas 1 pe reset kar do
  useEffect(() => {
    setLeavePage(1);
  }, [leaveBranchId, leaveDepartmentId, leaveEmployeeId, leaveStatus]);

  // filters ko memoize karo taaki "all"/empty values thunk ko na jayein
  // aur useEffect ka dependency array stable rahe
  const leaveFilters: LeaveFilters = useMemo(
    () => ({
      ...(isActiveFilter(leaveBranchId) && { branchId: leaveBranchId }),
      ...(isActiveFilter(leaveDepartmentId) && {
        departmentId: leaveDepartmentId,
      }),
      ...(isActiveFilter(leaveEmployeeId) && { employeeId: leaveEmployeeId }),
      ...(leaveStatus && { status: leaveStatus }),
      page: leavePage,
      limit: leaveLimit,
    }),
    [
      leaveBranchId,
      leaveDepartmentId,
      leaveEmployeeId,
      leaveStatus,
      leavePage,
      leaveLimit,
    ],
  );

  useEffect(() => {
    if (activeTab === "leave") {
      dispatch(getAllLeavesThunk(leaveFilters));
    }
  }, [dispatch, activeTab, leaveFilters]);

  // ---------- NEW: Balance cards ----------
  const summaryYear = new Date().getFullYear();

  // Cards ke filters: status/page/limit nahi, sirf scope wale filters
  const summaryFilters = useMemo(() => {
    const noScopeFilter =
      !isActiveFilter(leaveBranchId) &&
      !isActiveFilter(leaveDepartmentId) &&
      !isActiveFilter(leaveEmployeeId);

    return {
      year: summaryYear,
      ...(isActiveFilter(leaveBranchId) && { branchId: leaveBranchId }),
      ...(isActiveFilter(leaveDepartmentId) && {
        departmentId: leaveDepartmentId,
      }),
      ...(isActiveFilter(leaveEmployeeId) && { employeeId: leaveEmployeeId }),
      // koi filter nahi to apna balance dikhao (poori company ka total nahi)
      // company total chahiye to is line ko hata do
      ...(noScopeFilter && { scope: "self" as const }),
    };
  }, [summaryYear, leaveBranchId, leaveDepartmentId, leaveEmployeeId]);

  useEffect(() => {
    if (activeTab === "leave") {
      dispatch(getLeaveBalanceSummaryThunk(summaryFilters));
    }
  }, [dispatch, activeTab, summaryFilters]);

  const handleApply = async (data: {
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason: string;
  }) => {
    try {
      await dispatch(
        applyLeaveThunk({
          leaveType: data.leaveType,
          fromDate: data.fromDate,
          toDate: data.toDate,
          totalDays: daysBetween(data.fromDate, data.toDate),
          reason: data.reason,
        }),
      ).unwrap();

      setModalOpen(false);
      // apply ke baad bhi current filters ke saath hi refetch karo
      dispatch(getAllLeavesThunk(leaveFilters));
      dispatch(getLeaveBalanceSummaryThunk(summaryFilters)); // NEW
    } catch (err) {
      console.error("Failed to apply leave:", err);
    }
  };

  const handleAssign = (data: AssignLeaveFormData) => {
    console.log("Assign leave (not yet wired to API):", data);
  };

  // ---------- Approve/Reject handlers ----------
  const openStatusDialog = (id: string | number, name?: string) => {
    // permission na ho to dialog khulega hi nahi
    if (!canSeeFilters) return;
    setTargetLeave({ id, name });
    setStatusDialogOpen(true);
  };

  const handleConfirmStatus = async (
    status: "Approved" | "Rejected",
    rejectionReason: string | null,
  ) => {
    if (!canSeeFilters || !targetLeave) return;

    const result = await dispatch(
      updateLeaveStatusThunk({
        leaveId: targetLeave.id,
        status,
        rejectionReason,
      }),
    );

    // agar success hua, dialog band karo aur list refresh karo
    if (updateLeaveStatusThunk.fulfilled.match(result)) {
      setStatusDialogOpen(false);
      setTargetLeave(null);
      dispatch(getAllLeavesThunk(leaveFilters));
      dispatch(getLeaveBalanceSummaryThunk(summaryFilters)); // NEW
    }
    // agar fail hua, dialog khula rahega taaki user dubara try kare
  };

  const filteredRequests = useMemo(() => {
    const keyword = search.toLowerCase();
    if (!keyword) return leaves;
    return leaves.filter(
      (r) =>
        r.employeeName?.toLowerCase().includes(keyword) ||
        r.leave_type?.toLowerCase().includes(keyword) ||
        r.department?.toLowerCase().includes(keyword),
    );
  }, [leaves, search]);

  const recentlyAssigned = useMemo(
    () => leaves.filter((r) => r.reason === "Assigned by admin").slice(0, 5),
    [leaves],
  );

  const branches = useAppSelector((s: RootState) => s.branch.branches) ?? [];
  const {
    list: holidays,
    loading: holidaysLoading,
    creating,
  } = useAppSelector((s: RootState) => s.holiday);

  const today = new Date();
  const currentYear = today.getFullYear();
  const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

  const [branch, setBranch] = useState<string>("");
  const [holidayYear, setHolidayYear] = useState<number>(currentYear);

  useEffect(() => {
    if (!branch && branches.length > 0) {
      setBranch(String(branches[0].id));
    }
  }, [branches, branch]);

  const branchLabel =
    branches.find((b: any) => String(b.id) === branch)?.branch_name ??
    branches.find((b: any) => String(b.id) === branch)?.name ??
    "Branch";

  useEffect(() => {
    if (activeTab !== "holiday" || !branch) return;
    dispatch(fetchHolidays({ branchId: branch, year: holidayYear }));
  }, [dispatch, activeTab, branch, holidayYear]);

  const branchHolidays = useMemo(
    () => holidays.filter((h) => String(h.branch_id) === branch),
    [holidays, branch],
  );

  const handleAddHoliday = async (data: {
    branchId: string;
    date: string;
    name: string;
  }) => {
    try {
      await dispatch(
        createHolidayThunk({
          branchId: data.branchId,
          date: data.date,
          name: data.name,
        }),
      ).unwrap();

      dispatch(fetchHolidays({ branchId: branch, year: holidayYear }));
    } catch (err) {
      console.error("Failed to add holiday:", err);
    }
  };

  const handleEditHoliday = async (data: {
    id: string;
    branchId: string;
    date: string;
    name: string;
  }) => {
    try {
      await dispatch(
        updateHolidayThunk({
          id: data.id,
          branchId: data.branchId,
          date: data.date,
          name: data.name,
        }),
      ).unwrap();

      dispatch(fetchHolidays({ branchId: branch, year: holidayYear }));
    } catch (err) {
      console.error("Failed to update holiday:", err);
    }
  };

  const handleRemoveHoliday = (id: string) => {
    dispatch(deleteHolidayThunk(id));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl p-4 border-l-4"
          style={{ background: "#FFF7ED", borderColor: "#F97316" }}
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#166534" }}>
              {headerContent.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#EA580C" }}>
              {headerContent.subtitle}
            </p>
          </div>

          <TabsList
            className={`grid w-fit bg-white border border-orange-200 ${
              isSuperAdmin ? "grid-cols-6" : "grid-cols-2"
            }`}
          >
            {/* Comp Off + Leave: sabko dikhenge */}

            <TabsTrigger
              value="leave"
              className="gap-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Users size={14} />
              Leave
            </TabsTrigger>
            <TabsTrigger
              value="compoff"
              className="gap-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <CalendarClock size={14} />
              Comp Off
            </TabsTrigger>

            {/* Baaki tab sirf super admin ko */}
            {isSuperAdmin && (
              <>
                <TabsTrigger
                  value="assign"
                  className="gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <UserPlus size={14} />
                  Assign Leave
                </TabsTrigger>
                <TabsTrigger
                  value="holiday"
                  className="gap-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Gift size={14} />
                  Company Holiday
                </TabsTrigger>
                <TabsTrigger
                  value="duty-roster"
                  className="gap-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <ClipboardList size={14} />
                  Duty Roster
                </TabsTrigger>
                <TabsTrigger
                  value="leave-management"
                  className="gap-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <ClipboardList size={14} />
                  Leave Management
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="compoff" className="mt-6">
          <CompOffTable />
        </TabsContent>

        {/* Leave tab ab sabko dikhega */}
        <TabsContent value="leave" className="mt-6 space-y-4">
          {/* NEW: Balance cards */}
          <LeaveBalanceCards
            carryForward={balanceSummary?.carryForward ?? 0}
            totalLeave={balanceSummary?.totalLeave ?? 0}
            leavesTaken={balanceSummary?.leavesTaken ?? 0}
            leavesRemaining={balanceSummary?.leavesRemaining ?? 0}
            compOffBalance={balanceSummary?.compOffBalance ?? 0}
            loading={balanceSummaryLoading}
          />

          {/* ---------- Leave filters (left) + Apply Leave (right) ---------- */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* LEFT: filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-muted-foreground" />
                <BranchFilter
                  value={leaveBranchId}
                  onChange={(v) => {
                    setLeaveBranchId(v);
                    setLeaveEmployeeId("all"); // branch badalne par employee reset
                  }}
                />
              </div>

              <DepartmentFilter
                value={leaveDepartmentId}
                onChange={setLeaveDepartmentId}
              />

              <EmployeeFilter
                value={leaveEmployeeId}
                onChange={setLeaveEmployeeId}
                branchId={leaveBranchId}
              />

              <select
                value={leaveStatus}
                onChange={(e) => setLeaveStatus(e.target.value)}
                className="h-9 rounded-md border border-orange-200 px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {hasAnyLeaveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setLeaveBranchId("all");
                    setLeaveDepartmentId("all");
                    setLeaveEmployeeId("all");
                    setLeaveStatus("");
                  }}
                  className="h-9 rounded-md border border-orange-200 px-3 text-sm text-orange-600 hover:bg-orange-50"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* RIGHT: Apply Leave */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus size={16} />
              Apply Leave
            </button>
          </div>

          <LeaveRequestsTab
            requests={filteredRequests}
            search={search}
            onSearchChange={setSearch}
            onApprove={openStatusDialog}
            onReject={openStatusDialog}
            actionLoadingId={actionLoadingId}
            loading={leavesLoading}
            showActions={canSeeFilters}
          />

          {/* ---------- Pagination ---------- */}
          <Pagination
            currentPage={leavePage}
            totalPages={totalPages}
            total={total}
            limit={leaveLimit}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPageChange={setLeavePage}
            onLimitChange={(newLimit) => {
              setLeaveLimit(newLimit);
              setLeavePage(1);
            }}
          />
        </TabsContent>

        {/* Baaki tab sirf super admin ko */}
        {isSuperAdmin && (
          <>
            <TabsContent value="assign" className="mt-6">
              <AssignLeaveTab
                onAssign={handleAssign}
                recentlyAssigned={recentlyAssigned}
              />
            </TabsContent>

            <TabsContent value="holiday" className="space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-muted-foreground" />
                <BranchFilter value={branch} onChange={setBranch} />
              </div>

              <HolidayManager
                branch={branch}
                branchLabel={branchLabel}
                holidays={branchHolidays}
                loading={holidaysLoading}
                creating={creating}
                yearOptions={YEAR_OPTIONS}
                onAddHoliday={handleAddHoliday}
                onEditHoliday={handleEditHoliday}
                onRemoveHoliday={handleRemoveHoliday}
              />
            </TabsContent>

            <TabsContent value="duty-roster" className="mt-6">
              <DutyRoster />
            </TabsContent>

            <TabsContent value="leave-management" className="mt-6">
              <LeaveManagementTable />
            </TabsContent>
          </>
        )}
      </Tabs>

      <ApplyLeaveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleApply}
      />

      <UpdateLeaveStatusDialog
        open={statusDialogOpen}
        employeeName={targetLeave?.name}
        onClose={() => {
          setStatusDialogOpen(false);
          setTargetLeave(null);
        }}
        onConfirm={handleConfirmStatus}
        loading={actionLoadingId === targetLeave?.id}
      />
    </div>
  );
}

export default Leave;
