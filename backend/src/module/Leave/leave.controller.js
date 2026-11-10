import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { applyRoleBasedFilters } from "../../utils/applyRoleBasedFilters.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { useCompOffBalance } from "../CompOff/compOff.model.js";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  hasOverlappingLeave,
  updateApplicationStatus,
} from "./leaveApplication.model.js";
import { getLeaveType } from "./leaveType.model.js";
import { deductLeave } from "./leaveBalance.model.js";
import {
  assertBalance,
  tracksBalanceFor,
  COMP_OFF_CODE,
} from "./leave.service.js";

const applyLeaveController = asyncHandler(async (req, res) => {
  const employeeId = req.user?.id;
  const { leaveType, fromDate, toDate, totalDays, reason } = req.body;

  if (!employeeId) {
    throw new ApiError(401, "Unauthorized: employee id not found on request");
  }

  if (!leaveType || !fromDate || !toDate || !totalDays) {
    throw new ApiError(
      400,
      "leaveType, fromDate, toDate and totalDays are required",
    );
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new ApiError(400, "fromDate and toDate must be valid dates");
  }

  if (from > to) {
    throw new ApiError(400, "fromDate cannot be after toDate");
  }

  const days = Number(totalDays);
  if (Number.isNaN(days) || days <= 0) {
    throw new ApiError(400, "totalDays must be a number greater than 0");
  }

  const leaveTypeRow = await getLeaveType(leaveType);
  if (!leaveTypeRow) {
    throw new ApiError(400, `Invalid leave type: ${leaveType}`);
  }

  if (await hasOverlappingLeave(employeeId, fromDate, toDate)) {
    throw new ApiError(409, "You already have a leave in these dates");
  }

  // Selected leave type ka balance check (save hone se pehle)
  await assertBalance({
    employeeId,
    leaveTypeId: leaveTypeRow.id,
    leaveCode: leaveTypeRow.leave_code,
    year: from.getFullYear(),
    days,
  });

  const result = await createApplication({
    employee_id: employeeId,
    leave_type_id: leaveTypeRow.id,
    from_date: fromDate,
    to_date: toDate,
    total_days: days,
    reason: reason || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Leave applied successfully"));
});

const updateLeaveStatusController = asyncHandler(async (req, res) => {
  const approvedBy = req.user?.id;
  const { leaveId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!approvedBy) {
    throw new ApiError(401, "Unauthorized: approver id not found on request");
  }

  if (!leaveId || !status) {
    throw new ApiError(400, "leaveId and status are required");
  }

  // Model me status uppercase me store hota hai
  const newStatus = String(status).toUpperCase();

  if (!["APPROVED", "REJECTED"].includes(newStatus)) {
    throw new ApiError(400, "status must be 'APPROVED' or 'REJECTED'");
  }

  if (newStatus === "REJECTED" && !rejectionReason) {
    throw new ApiError(400, "rejectionReason is required when rejecting");
  }

  // Pehle application fetch karo, update se pehle saari validation
  const application = await getApplicationById(leaveId);

  if (!application) {
    throw new ApiError(404, "Leave not found");
  }

  if (application.status !== "PENDING") {
    throw new ApiError(
      409,
      `Leave is already ${application.status.toLowerCase()}`,
    );
  }

  const isCompOff = application.leave_code === COMP_OFF_CODE;
  const tracksBalance = !isCompOff && tracksBalanceFor(application.leave_code);
  const leaveYear = new Date(application.from_date).getFullYear();
  const totalDays = Number(application.total_days);

  // Approve se pehle balance verify karo (apply jaisa hi check)
  if (newStatus === "APPROVED") {
    await assertBalance({
      employeeId: application.employee_id,
      leaveTypeId: application.leave_type_id,
      leaveCode: application.leave_code,
      year: leaveYear,
      days: totalDays,
      excludeId: application.id, // is leave ko pending me ginti se bahar rakho
    });
  }

  const updateResult = await updateApplicationStatus(leaveId, newStatus);

  if (!updateResult?.affectedRows) {
    throw new ApiError(500, "Failed to update leave status");
  }

  // Status update ke baad balance deduct; fail hua to status wapas PENDING
  if (newStatus === "APPROVED" && (isCompOff || tracksBalance)) {
    try {
      if (isCompOff) {
        await useCompOffBalance(
          application.employee_id,
          application.total_days,
          application.id,
        );
      } else {
        await deductLeave({
          employee_id: application.employee_id,
          leave_type_id: application.leave_type_id,
          year: leaveYear,
          days: totalDays,
          remarks: `Leave application #${application.id} approved`,
        });
      }
    } catch (error) {
      await updateApplicationStatus(leaveId, "PENDING");
      throw error;
    }
  }

  const updated = await getApplicationById(leaveId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        `Leave ${newStatus.toLowerCase()} successfully`,
      ),
    );
});

const getMyLeavesController = asyncHandler(async (req, res) => {
  const employeeId = req.user?.id;

  if (!employeeId) {
    throw new ApiError(401, "Unauthorized: employee id not found on request");
  }

  const leaves = await getAllApplications({ employeeId });

  return res
    .status(200)
    .json(new ApiResponse(200, leaves, "Leaves fetched successfully"));
});

const getLeaveByIdController = asyncHandler(async (req, res) => {
  const { leaveId } = req.params;

  if (!leaveId) {
    throw new ApiError(400, "leaveId is required");
  }

  const leave = await getApplicationById(leaveId);

  if (!leave) {
    throw new ApiError(404, "Leave not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, leave, "Leave fetched successfully"));
});

const getAllLeavesController = asyncHandler(async (req, res) => {
  const {
    status,
    leaveType,
    employeeId,
    branchId,
    departmentId,
    managerId, // NEW
    page,
    limit,
  } = req.query;

  const filters = {
    status: status ? String(status).toUpperCase() : undefined,
    leaveType,
    employeeId: employeeId ? Number(employeeId) : undefined,
    branchId: branchId ? Number(branchId) : undefined,
    departmentId: departmentId ? Number(departmentId) : undefined,
    managerId: managerId ? Number(managerId) : undefined, // NEW
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  };

  // Role ke hisaab se filters override (e.g. employee sirf apni leaves dekhe)
  applyRoleBasedFilters(filters, req);

  // leaveType (code/name) ko id me convert karo
  let leaveTypeId = null;
  if (filters.leaveType) {
    const typeRow = await getLeaveType(filters.leaveType);
    if (!typeRow) {
      throw new ApiError(400, `Invalid leave type: ${filters.leaveType}`);
    }
    leaveTypeId = typeRow.id;
  }

  const rows = await getAllApplications({
    employeeId: filters.employeeId || null,
    status: filters.status || null,
    leaveTypeId,
    branchId: filters.branchId || null,
    departmentId: filters.departmentId || null,
    managerId: filters.managerId || null, // NEW
  });

  // Model me pagination nahi hai, isliye yahin slice kiya hai
  const currentPage = Math.max(1, filters.page);
  const pageSize = Math.max(1, filters.limit);
  const start = (currentPage - 1) * pageSize;

  const result = {
    data: rows.slice(start, start + pageSize),
    pagination: {
      page: currentPage,
      limit: pageSize,
      total: rows.length,
      totalPages: Math.ceil(rows.length / pageSize),
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leaves fetched successfully"));
});

export {
  applyLeaveController,
  updateLeaveStatusController,
  getMyLeavesController,
  getLeaveByIdController,
  getAllLeavesController,
};
