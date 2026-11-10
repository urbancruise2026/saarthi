import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  insertPolicy,
  getPolicies,
  getPolicyById,
  findPolicyByTitle,
  updatePolicy,
  deletePolicy,
  updateHrApproval,
  updateShoApproval,
} from "./policy.model.js";

export const createPolicy = asyncHandler(async (req, res) => {
  const { title, category, description, fileUrl, version, policy1 } = req.body;

  if (!title || !category || !description || !fileUrl) {
    throw new ApiError(400, "All fields including fileUrl are required");
  }

  // Policy.controller.js
  const allowedCategories = [
    "1. Organisation Structure",
    "2. Work Place Policy",
    "3. Leave & Attendance Policy",
    "4. Joining & Probation Policy",
    "4. Salary, Incentive, Promotion & Retention Policy",
    "4. Separation Policy",
    "5. IT Policy",
    "6. Travel Policy",
    "7. POSH Policy",
  ];

  if (!allowedCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  const existing = await findPolicyByTitle(title);

  if (existing) {
    throw new ApiError(409, "Policy already exists");
  }

  const policyId = await insertPolicy({
    title,
    category,
    description,
    fileUrl,
    version,
    lastUpdated: new Date(),
    status: "pending",
    policy1,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { id: policyId }, "Policy created successfully"),
    );
});

export const getAllPolicies = asyncHandler(async (req, res) => {
  const { category = "all" } = req.query;

  const policies = await getPolicies(category); // object nahi bhejna

  return res
    .status(200)
    .json(new ApiResponse(200, policies, "Policies fetched successfully"));
});
export const getSinglePolicy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policy = await getPolicyById(id);

  if (!policy) {
    throw new ApiError(404, "Policy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, policy, "Policy fetched successfully"));
});

export const updatePolicyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await getPolicyById(id);

  if (!existing) {
    throw new ApiError(404, "Policy not found");
  }

  const updated = await updatePolicy(id, req.body);

  if (!updated) {
    throw new ApiError(500, "Policy update failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Policy updated successfully"));
});

export const deletePolicyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await deletePolicy(id);

  if (!deleted) {
    throw new ApiError(404, "Policy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Policy deleted successfully"));
});

export const shoApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sho_remark, sho_status } = req.body;

  if (!id) {
    throw new ApiError(400, "Policy ID is required");
  }

  if (!sho_status || !["approved", "rejected"].includes(sho_status)) {
    throw new ApiError(
      400,
      "sho_status must be either 'approved' or 'rejected'",
    );
  }

  if (sho_status === "rejected" && (!sho_remark || !sho_remark.trim())) {
    throw new ApiError(400, "Remark is required when rejecting a policy");
  }

  const shodata = await updateShoApproval({
    id,
    sho_status,
    sho_remark,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, shodata, "Policy approved successfully by SHO"));
});

export const hrHeadApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hr_head_remark, hr_head_status } = req.body;

  if (!id) {
    throw new ApiError(400, "Policy ID is required");
  }

  if (!hr_head_status || !["approved", "rejected"].includes(hr_head_status)) {
    throw new ApiError(
      400,
      "hr_status must be either 'approved' or 'rejected'",
    );
  }

  if (
    hr_head_status === "rejected" &&
    (!hr_head_remark || !hr_head_remark.trim())
  ) {
    throw new ApiError(400, "Remark is required when rejecting a policy");
  }

  const hrData = await updateHrApproval({
    id,
    hr_head_status,
    hr_head_remark,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, hrData, "Policy approved successfully by HR Head"),
    );
});
