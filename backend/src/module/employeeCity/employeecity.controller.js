import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  getCitiesByEmployeeId,
  getEmployeesByCityId,
  findEmployeeCity,
  removeCityFromEmployee,
  removeAllCitiesOfEmployee,
  assignCitiesToEmployee,
} from "../employeeCity/employeecity.model.js";

// ✅ Assign One or Multiple Cities to an Employee
const assignCity = asyncHandler(async (req, res) => {
  const { employee_id, city_id } = req.body;
  console.log(req.body);

  if (
    !employee_id ||
    !city_id ||
    !Array.isArray(city_id) ||
    city_id.length === 0
  ) {
    throw new ApiError(400, "Employee ID and city_ids array are required");
  }

  // Optional: Filter out already assigned cities
  const filteredCityIds = [];
  for (const cityId of city_id) {
    const existing = await findEmployeeCity(employee_id, cityId);
    if (!existing) filteredCityIds.push(cityId);
  }

  if (filteredCityIds.length === 0) {
    throw new ApiError(
      409,
      "All selected cities are already assigned to this employee",
    );
  }

  const assignment = await assignCitiesToEmployee(employee_id, filteredCityIds);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { assignedCities: filteredCityIds },
        "City/Cities assigned successfully",
      ),
    );
});

// ✅ Get all cities assigned to an employee
const getEmployeeCities = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) throw new ApiError(400, "Employee ID is required");

  const cities = await getCitiesByEmployeeId(employeeId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        cities || [],
        "Employee cities fetched successfully",
      ),
    );
});

// ✅ Get all employees assigned to a city
const getCityEmployees = asyncHandler(async (req, res) => {
  const { cityId } = req.params;

  if (!cityId) throw new ApiError(400, "City ID is required");

  const employees = await getEmployeesByCityId(cityId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        employees || [],
        "City employees fetched successfully",
      ),
    );
});

// ✅ Remove a single city from an employee
const removeCity = asyncHandler(async (req, res) => {
  const { employee_id, city_id } = req.body;

  if (!employee_id || !city_id)
    throw new ApiError(400, "Employee ID and City ID are required");

  const removed = await removeCityFromEmployee(employee_id, city_id);

  if (!removed) throw new ApiError(404, "Assignment not found");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "City removed successfully"));
});

// ✅ Remove all cities of an employee
const removeAllCities = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  if (!employeeId) throw new ApiError(400, "Employee ID is required");

  const count = await removeAllCitiesOfEmployee(employeeId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { removedCount: count },
        "All cities removed successfully",
      ),
    );
});

export {
  assignCity,
  getEmployeeCities,
  getCityEmployees,
  removeCity,
  removeAllCities,
};
