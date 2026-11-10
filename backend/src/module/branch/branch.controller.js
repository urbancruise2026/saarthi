import {asyncHandler} from "../../utils/asyncHandler.js";
import {ApiResponse} from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import { getIO } from "../../socket/socket.js";
import { BranchModel } from "./branch.model.js";

const createBranchController = asyncHandler(async (req, res) => {
  const { branch_name, branch_code, location } = req.body;

  if (!branch_name || !branch_code || !location) {
    throw new ApiError(400, "All fields are required");
  }

  const existingBranch = await BranchModel.getBranchByCode(branch_code);

  if (existingBranch) {
    throw new ApiError(409, "Branch code already exists");
  }

  const branch = await BranchModel.createBranch(
    branch_name,
    branch_code,
    location,
  );

  const io = getIO();
  io.emit("branchCreated", branch);

  return res
    .status(201)
    .json(new ApiResponse(201, branch, "Branch created successfully"));
});

const getAllBranchesController = asyncHandler(async (req, res) => {
  const branches = await BranchModel.getAllBranches();

  return res
    .status(200)
    .json(new ApiResponse(200, branches, "Branches fetched successfully"));
});

const getBranchByIdController = asyncHandler(async (req, res) => {
  const branchId = req.params.id;

  if (!branchId) {
    throw new ApiError(400, "Branch ID is required");
  }

  const branch = await BranchModel.getBranchById(branchId);

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, branch, "Branch fetched successfully"));
});

const updateBranchByIdController = asyncHandler(async (req, res) => {
  const branchId = req.params.id;
  const { branch_name, branch_code, location } = req.body;

  if (!branchId) {
    throw new ApiError(400, "Branch ID is required");
  }

  const existingBranch = await BranchModel.getBranchByCode(branch_code);

  if (existingBranch && existingBranch.id !== Number(branchId)) {
    throw new ApiError(409, "Branch code already used by another branch");
  }

  const updatedBranch = await BranchModel.updateBranch(
    branchId,
    branch_name,
    branch_code,
    location,
  );

  const io = getIO();
  io.emit("branchUpdated", updatedBranch);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBranch, "Branch updated successfully"));
});

const deleteBranchByIdController = asyncHandler(async (req, res) => {
  const branchId = req.params.id;

  if (!branchId) {
    throw new ApiError(400, "Branch ID is required");
  }

  const branch = await BranchModel.getBranchById(branchId);

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  await BranchModel.deleteBranch(branchId);

  const io = getIO();
  io.emit("branchDeleted", { branchId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Branch deleted successfully"));
});

export {
  createBranchController,
  getAllBranchesController,
  getBranchByIdController,
  updateBranchByIdController,
  deleteBranchByIdController,
};
