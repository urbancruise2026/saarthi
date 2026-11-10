// apna actual path daalna
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { applyRoleBasedFilters } from "../../utils/applyRoleBasedFilters.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createCompOffIfEligible } from "../CompOff/compOff.model.js";
import {
  getAttendanceByDate,
  getAttendanceByMonth,
  markAttendance,
  runAutoAttendanceMarking,
  updateEarlyExitDetails,
  updatePunchOut,
  updateStatus,
} from "./attendance.model.js";

const getAttendanceController = asyncHandler(async (req, res) => {
  const {
    date,
    month,
    startDate,
    endDate,
    employeeId,
    branchId,
    departmentId,
    status,
  } = req.query;

  const filters = {
    branchId,
    departmentId,
    status,
  };

  // Current Month Helper
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  if (employeeId) {
    filters.employeeId = employeeId;
    filters.startDate = firstDay;
    filters.endDate = lastDay;
  } else {
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    } else if (month) {
      const [year, mon] = month.split("-").map(Number);

      const first = new Date(year, mon - 1, 1);
      const last = new Date(year, mon, 0);

      filters.startDate = first.toISOString().slice(0, 10);
      filters.endDate = last.toISOString().slice(0, 10);
    } else if (date) {
      filters.attendanceDate = date;
    }
  }

  /**
   * Role Based Restriction (shared function)
   */
  applyRoleBasedFilters(filters, req, {
    firstDay,
    lastDay,
    clearAttendanceDate: true,
  });

  const attendance = await getAttendanceByDate(filters);

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Attendance fetched successfully"));
});

const getMonthlyAttendanceController = asyncHandler(async (req, res) => {
  const { month, employeeId, branchId, departmentId } = req.query;

  const filters = {
    branchId,
    departmentId,
  };

  // Current Month Helper (fallback jab month query param na aaye)
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  // Resolve month -> startDate/endDate
  if (month) {
    const [year, mon] = month.split("-").map(Number);

    const first = new Date(year, mon - 1, 1);
    const last = new Date(year, mon, 0);

    filters.startDate = first.toISOString().slice(0, 10);
    filters.endDate = last.toISOString().slice(0, 10);
  } else {
    filters.startDate = firstDay;
    filters.endDate = lastDay;
  }

  if (employeeId) {
    filters.employeeId = employeeId;
  }

  /**
   * Role Based Restriction (shared function)
   */
  applyRoleBasedFilters(filters, req);

  const attendance = await getAttendanceByMonth(filters);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attendance,
        "Monthly attendance fetched successfully",
      ),
    );
});

const markAttendanceController = asyncHandler(async (req, res) => {
  const employeeId = 70;
  const { attendanceDate, punchIn } = req.body;

  if (!employeeId) {
    throw new ApiError(401, "Unauthorized: employee id not found on request");
  }

  if (!attendanceDate || !punchIn) {
    throw new ApiError(400, "attendanceDate and punchIn are required");
  }

  const result = await markAttendance({
    employeeId,
    attendanceDate,
    status: "Present",
    punchIn,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Attendance marked successfully"));
});

const updatePunchOutController = asyncHandler(async (req, res) => {
  const employeeId = 77;

  const { attendanceDate, punchOut, punch_out } = req.body;

  const finalPunchOut = punchOut || punch_out;

  if (!attendanceDate || !finalPunchOut) {
    throw new ApiError(400, "attendanceDate and punchOut are required");
  }

  const result = await updatePunchOut({
    employeeId,
    attendanceDate,
    punch_out: finalPunchOut,
  });

  if (result.affectedRows === 0) {
    throw new ApiError(
      404,
      "No attendance record found for this employee on this date",
    );
  }

  await createCompOffIfEligible(employeeId, attendanceDate);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Punch-out updated successfully"));
});

const updateStatusController = asyncHandler(async (req, res) => {
  const { employeeId, attendanceDate, status } = req.body;
  if (!employeeId || !attendanceDate || !status) {
    throw new ApiError(
      400,
      "employeeId, attendanceDate and status are required",
    );
  }

  const result = await updateStatus({
    employeeId,
    attendanceDate,
    status,
  });

  if (result.affectedRows === 0) {
    throw new ApiError(
      404,
      "No attendance record found for this employee on this date",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Attendance status updated successfully"),
    );
});

const triggerAutoAttendanceController = asyncHandler(async (req, res) => {
  const role = req.user.access_role;

  if (role !== "SUPER_ADMIN") {
    throw new ApiError(403, "You are not authorized to run this action");
  }

  const result = await runAutoAttendanceMarking();

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Auto attendance marking completed"));
});

const updateEarlyExitDetailsController = asyncHandler(async (req, res) => {
  const { attendanceId, earlyExitReason, earlyExitApprovedBy } = req.body;

  if (!attendanceId || !earlyExitReason?.trim()) {
    throw new ApiError(400, "attendanceId and earlyExitReason are required");
  }

  const result = await updateEarlyExitDetails({
    attendanceId,
    earlyExitReason: earlyExitReason.trim(),
    earlyExitApprovedBy,
  });

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Attendance record not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { attendanceId, earlyExitReason, earlyExitApprovedBy },
        "Early exit details updated successfully",
      ),
    );
});

export {
  getAttendanceController,
  getMonthlyAttendanceController,
  markAttendanceController,
  updatePunchOutController,
  updateStatusController,
  triggerAutoAttendanceController,
  updateEarlyExitDetailsController,
};
