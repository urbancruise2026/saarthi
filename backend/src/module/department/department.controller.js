import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  findDepartmentByName,
  getDepartmentData,
  getDepartments,
  getHoData,
  getRoleBySubDepartmentId,
  insertDepartment,
} from "./department.model.js";

const createDepartment = asyncHandler(async (req, res) => {
  const { department_name } = req.body;

  if (!department_name) {
    throw new ApiError(400, "All fields are required");
  }

  const existingDepartment = await findDepartmentByName(department_name);
  if (existingDepartment) {
    throw new ApiError(409, "Zone already exists in this region");
  }

  const department = await insertDepartment({ department_name });

  if (!department) {
    throw new ApiError(500, "Zone not created");
  }

  res
    .status(201)
    .json(new ApiResponse(201, department, " created successfully"));
});

const getAllDepartment = asyncHandler(async (req, res) => {
  const DepartmentList = await getDepartments();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        DepartmentList || [],
        "Zone list fetched successfully",
      ),
    );
});
const getDepartmentRoles = asyncHandler(async (req, res) => {
  const { department_id } = req.params;

  if (!department_id) {
    throw new ApiError(400, "Department ID is required");
  }

  const departmentData = await getDepartmentData(department_id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        departmentData || { sub_department: [] },
        "Department sub_department and roles fetched successfully",
      ),
    );
});

const getHoByDepartment = asyncHandler(async (req, res) => {
  const { department_id } = req.params;

  if (!department_id) {
    throw new ApiError(400, "Department ID is required");
  }

  const hoData = await getHoData(department_id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hos: Array.isArray(hoData) ? hoData : hoData?.hos || [],
      },
      "HO list fetched successfully",
    ),
  );
});
const getRolesSubDepartment = asyncHandler(async (req, res) => {
  const { subDepartment_id } = req.params;
  console.log(subDepartment_id);
  if (!subDepartment_id) {
    throw new ApiError(400, "subDepartment ID is required");
  }

  const departmentData = await getRoleBySubDepartmentId(subDepartment_id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        departmentData || { roles: [] },
        "  roles fetched successfully",
      ),
    );
});
export {
  createDepartment,
  getAllDepartment,
  getDepartmentRoles,
  getRolesSubDepartment,
  getHoByDepartment,
};
