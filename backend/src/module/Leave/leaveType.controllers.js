import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createLeaveType } from "../../models/leaveType.model.js";

export const createLeaveTypeController = asyncHandler(async (req, res) => {
  const { code, name, isActive } = req.body;

  if (!code || !name) {
    throw new ApiError(400, "code and name are required");
  }

  const leaveType = await createLeaveType({
    code: code.trim().toUpperCase(),
    name: name.trim(),
    isActive: isActive === undefined ? 1 : Number(isActive) ? 1 : 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, leaveType, "Leave type created successfully"));
});
