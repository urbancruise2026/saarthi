import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  insertRole,
  getRoles,
  getRoleById,
  getRoleByUUID,
  findRoleByName,
  getRolesByDepartmentId,
} from "./role.model.js";

// ✅ Create Role
const createRole = asyncHandler(async (req, res) => {
  const { role_name, subDepartment_id } = req.body;

  if (!role_name ) {
    throw new ApiError(400, "Role name and department ID are required");
  }

  // Duplicate check (same department)
  const existingRole = await findRoleByName(role_name, subDepartment_id);
  if (existingRole) {
    throw new ApiError(409, "Role already exists in this department");
  }

  const newRole = await insertRole({
    role_name,
    subDepartment_id,
  });

  if (!newRole) {
    throw new ApiError(500, "Role not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newRole, "Role created successfully"));
});

// ✅ Get All Roles
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await getRoles();

  return res
    .status(200)
    .json(new ApiResponse(200, roles || [], "Roles fetched successfully"));
});

// ✅ Get Role by ID
const getRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Role ID is required");
  }

  const role = await getRoleById(id);

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role fetched successfully"));
});

// ✅ Get Role by UUID
const getRoleByUuid = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    throw new ApiError(400, "Role UUID is required");
  }

  const role = await getRoleByUUID(uuid);

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role fetched successfully"));
});

// ✅ Get Roles by Department
const getDepartmentRoles = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  if (!departmentId) {
    throw new ApiError(400, "Department ID is required");
  }

  const roles = await getRolesByDepartmentId(departmentId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        roles || [],
        "Department roles fetched successfully",
      ),
    );
});

export { createRole, getAllRoles, getRole, getRoleByUuid, getDepartmentRoles };
