import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { applyRoleBasedFilters } from "../../utils/applyRoleBasedFilters.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  carryForwardLeave,
  creditMonthlyLeave,
  getBalancesByEmployee,
  getLeaveSummary,
} from "./leaveBalance.model.js";
import { getLedgerByEmployee } from "./leaveledger.model.js";

const currentYear = () => new Date().getFullYear();

export const getMyBalanceController = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || currentYear();
  const data = await getBalancesByEmployee(req.user.id, year);
  return res.status(200).json(new ApiResponse(200, data, "Balances fetched"));
});

export const getMyLedgerController = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || currentYear();
  const data = await getLedgerByEmployee(req.user.id, { year });
  return res.status(200).json(new ApiResponse(200, data, "Ledger fetched"));
});

// Body: { year, fromMonth, toMonth }  (toMonth na do to sirf fromMonth)
export const creditMonthlyController = asyncHandler(async (req, res) => {
  const year = Number(req.body.year);
  const fromMonth = Number(req.body.fromMonth);
  const toMonth = Number(req.body.toMonth || fromMonth);

  if (!year || fromMonth < 1 || toMonth > 12 || fromMonth > toMonth) {
    throw new ApiError(400, "Valid year, fromMonth and toMonth are required");
  }

  const results = [];
  for (let m = fromMonth; m <= toMonth; m++) {
    results.push({ month: m, ...(await creditMonthlyLeave(year, m)) });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, results, "Monthly credit done"));
});

export const carryForwardController = asyncHandler(async (req, res) => {
  const fromYear = Number(req.body.fromYear);
  if (!fromYear) throw new ApiError(400, "fromYear is required");
  const result = await carryForwardLeave(fromYear);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Carry forward done"));
});

export const getSummaryController = asyncHandler(async (req, res) => {
  const { employeeId, branchId, departmentId, managerId, scope, year } =
    req.query;

  const filters = {
    year: Number(year) || currentYear(),
    employeeId: employeeId ? Number(employeeId) : undefined,
    branchId: branchId ? Number(branchId) : undefined,
    departmentId: departmentId ? Number(departmentId) : undefined,
    managerId: managerId ? Number(managerId) : undefined,
  };

  // Role ke hisaab se filters override (security yahin se)
  await applyRoleBasedFilters(filters, req);

  // scope=self ho to manager/admin bhi sirf apna dekh sake
  if (scope === "self") {
    filters.employeeId = req.user.id;
    filters.managerId = undefined;
    filters.branchId = undefined;
    filters.departmentId = undefined;
  }

  const summary = await getLeaveSummary(filters);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year: filters.year, ...summary },
        "Summary fetched successfully",
      ),
    );
});
