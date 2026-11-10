import { ApiResponse } from "../../utils/ApiResponse.js";
import { applyRoleBasedFilters } from "../../utils/applyRoleBasedFilters.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCompOffBalance, getCompOffs } from "./compOff.model.js";

const getCompOffController = asyncHandler(async (req, res) => {
  const { month, employeeId, branchId, departmentId, status, page, limit } =
    req.query;

  const filters = {
    employeeId,
    branchId,
    departmentId,
    status,
    page,
    limit,
  };

  // Month filter
  if (month) {
    const [year, mon] = month.split("-").map(Number);

    filters.startDate = new Date(year, mon - 1, 1).toISOString().slice(0, 10);

    filters.endDate = new Date(year, mon, 0).toISOString().slice(0, 10);
  }

  // Apply role-based filters
  applyRoleBasedFilters(filters, req);

  // getCompOffs ab { rows, pagination } return karta hai (pehle sirf rows array tha)
  const { rows, pagination } = await getCompOffs(filters);

  const response = new ApiResponse(
    200,
    { rows, pagination },
    "Comp Off fetched successfully",
  );

  return res.status(200).json(response);
});

const getCompOffBalanceByEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "employeeId is required"));
  }

  const balance = await getCompOffBalance(employeeId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, balance, "Comp-off balance fetched successfully"),
    );
});
export { getCompOffController, getCompOffBalanceByEmployee };
