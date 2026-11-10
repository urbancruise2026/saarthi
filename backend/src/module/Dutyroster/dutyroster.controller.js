import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  createDutyRosterBulk,
  getDutyRosterList,
  getEmployeeListDutyroster,
  updateDutyRoster,
} from "./dutyroster.model.js";

export const getDutyRosterListController = asyncHandler(async (req, res) => {
  const { isActive, employeeId } = req.query;

  const result = await getDutyRosterList({ isActive, employeeId });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Duty roster fetched successfully"));
});

export const createDutyRosterController = asyncHandler(async (req, res) => {
  const { entries } = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(400, "entries must be a non-empty array");
  }

  for (const entry of entries) {
    const { branchId, employeeId, dutyDate, status } = entry;
    if (!branchId || !employeeId || !dutyDate || !status) {
      throw new ApiError(
        400,
        "Each entry requires branchId, employeeId, dutyDate and status",
      );
    }
  }

  const normalizedEntries = entries.map((entry) => ({
    branchId: entry.branchId,
    employeeId: entry.employeeId,
    dutyDate: entry.dutyDate,
    status: entry.status,
    isActive: entry.isActive === undefined ? 1 : entry.isActive,
  }));

  const result = await createDutyRosterBulk(normalizedEntries);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        result,
        `${result.length} duty roster ${
          result.length === 1 ? "entry" : "entries"
        } created successfully`,
      ),
    );
});

export const updatePunchOutController = asyncHandler(async (req, res) => {
  const {
    id,
    employeeId,
    dutyDate,
    dutyType,
    dutyTiming,
    location,
    remarks,
    isActive,
  } = req.body;

  if (!id) {
    throw new ApiError(400, "id is required");
  }

  if (!employeeId || !dutyDate || !dutyType) {
    throw new ApiError(400, "employeeId, dutyDate and dutyType are required");
  }

  const result = await updateDutyRoster({
    id,
    employeeId,
    dutyDate,
    dutyType,
    dutyTiming: dutyTiming ?? null,
    location: location ?? null,
    remarks: remarks ?? null,
    isActive: isActive === undefined ? 1 : isActive,
  });

  if (!result) {
    throw new ApiError(404, "Duty roster entry not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Duty roster entry updated successfully"),
    );
});

export const deactivateDutyRosterController = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError(400, "id is required");
  }

  const result = await deactivateDutyRoster(id);

  if (!result || result.affectedRows === 0) {
    throw new ApiError(404, "Duty roster entry not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id },
        "Duty roster entry deactivated successfully",
      ),
    );
});

export const getEmployeesDutyroster = asyncHandler(async (req, res) => {
  const { branchId, departmentId } = req.query;

  const employees = await getEmployeeListDutyroster(
    branchId || null,
    departmentId || null,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, employees, "Employee list fetched successfully"),
    );
});
