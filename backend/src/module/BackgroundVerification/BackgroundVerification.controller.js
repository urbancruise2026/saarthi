import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  insertBackgroundVerification,
  getVerificationByEmployeeId,
  getBackgroundVerifications,
} from "./BackgroundVerification.model.js";

const createBackgroundVerification = asyncHandler(async (req, res) => {
  const data = req.body;

  // ✅ dono handle karo
  const employeeId = data.employee_id || data.employeeId;

  if (!employeeId) {
    throw new ApiError(400, "Employee ID is Required");
  }

  const existing = await getVerificationByEmployeeId(employeeId);

  if (existing) {
    throw new ApiError(
      409,
      "Is employee ka background verification already ho chuka hai",
    );
  }

  const result = await insertBackgroundVerification({
    employee_id: employeeId,
    overall_status: data.overall_status,
    remarks: data.remarks,
    alternate_number: data.alternate_number,
    contact_number: data.contact_number,
    criminal_record: data.criminal_record,
    current_address: data.current_address,
    education_proof: data.education_proof,
    father_contact: data.father_contact,

    identity_proof: data.identity_proof,
    mother_contact: data.mother_contact,

    permanent_address: data.permanent_address,
    previous_employment: data.previous_employment,
    reference_check: data.reference_check,
  });

  if (!result) {
    throw new ApiError(404, "Result is Empty");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { insertId: result },
        "Background Verification Successfully Completed",
      ),
    );
});

const getAllBackgroundVerifications = asyncHandler(async (req, res) => {
  const { page = 1, limit, overall_status } = req.query;
  const result = await getBackgroundVerifications({
    page,
    limit,
    overall_status: overall_status || null,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Background verifications fetched successfully",
      ),
    );
});
export { createBackgroundVerification, getAllBackgroundVerifications }; 
