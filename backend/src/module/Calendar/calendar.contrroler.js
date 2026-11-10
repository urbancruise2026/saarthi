import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createHolidayModel,
  findHolidayByBranchAndDate,
  getEmployeeCalendar,
  getHolidaysModel,
  getHolidayYearsModel,
} from "./calendar.model.js";

export const getEmployeeCalendarController = asyncHandler(async (req, res) => {
  const { employeeId, fromDate, toDate } = req.query;

  if (!employeeId || !fromDate || !toDate) {
    throw new ApiError(400, "employeeId, fromDate and toDate are required");
  }

  const calendar = await getEmployeeCalendar({
    employeeId,
    fromDate,
    toDate,
  });

  if (!calendar) {
    throw new ApiError(404, "Employee not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, calendar, "Employee calendar fetched successfully"),
    );
});

export const getHolidaysController = asyncHandler(async (req, res) => {
  const { branchId, year } = req.query;

  const holidays = await getHolidaysModel({ branchId, year });

  return res
    .status(200)
    .json(new ApiResponse(200, holidays, "Holidays fetched successfully"));
});

export const getHolidayYearsController = asyncHandler(async (req, res) => {
  const years = await getHolidayYearsModel();

  return res
    .status(200)
    .json(new ApiResponse(200, years, "Holiday years fetched successfully"));
});

export const createHolidayController = asyncHandler(async (req, res) => {
  const { branchId, date, name } = req.body;

  if (!branchId || !date || !name?.trim()) {
    throw new ApiError(400, "branchId, date and name are required");
  }

  const existing = await findHolidayByBranchAndDate({ branchId, date });
  if (existing) {
    throw new ApiError(
      409,
      "A holiday already exists for this branch on this date",
    );
  }

  const holiday = await createHolidayModel({
    branchId,
    date,
    name: name.trim(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, holiday, "Holiday added successfully"));
});

export const updateHolidayController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branchId, date, name } = req.body;

  const result = await updateHolidayModel({
    id,
    branchId,
    date,
    name: name?.trim(),
  });

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Holiday not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Holiday updated successfully"));
});

export const deleteHolidayController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await deleteHolidayModel(id);

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Holiday not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Holiday removed successfully"));
});
