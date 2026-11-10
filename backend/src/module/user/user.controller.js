import { getIO } from "../../socket/socket.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  insertUser,
  saveRefreshToken,
  updateUserManagerRoleDepartment,
  findUserByUUID,
  getUsersWithDepartment,
  getUsersByRole,
  allEmployee,
  updateUserById,
  getEmployeeByStatus,
  updateEmployeeStatus,
  findUserByUserName,
  findUserById,
  updatePasswordByUsername,
  updatePasswordById,
  getReportingManagerWithDepartment,
  getHREmployees,
  getAllEmployeesWithShift,
  getEmployeeList,
} from "./user.model.js";

import {
  generateEmployeeId,
  generateTempId,
  generateTokens,
  isPasswordCorrect,
} from "./user.service.js";
import { clientInfo, logLoginEvent } from "./staff.repository.js";

const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    gender,
    maritalStatus,
    bloodGroup,
    personalEmail,
    mobile,
    alternateNumber,
    localRelation,
    localName,

    permanentAddress,
    permanentCity,
    permanentState,
    permanentPincode,

    currentAddress,
    currentCity,
    currentState,
    currentPincode,

    pfNumber,
    esicNumber,
    uanNumber,

    bankName,
    accountHolderName,
    accountNumber,
    ifscCode,
    branch,
    accountType,
    upiId,

    education,
    experience,

    fatherName,
    fatherRelation,
    fatherContact,
    fatherOccupation,

    motherName,
    motherRelation,
    motherContact,
    motherOccupation,

    spouseName,
    spouseRelation,
    spouseContact,
    spouseOccupation,

    siblingName,
    siblingRelation,
    siblingContact,
    siblingOccupation,

    hrPolicyAccepted,
    commitmentDeclarationAccepted,
    informationDeclarationAccepted,

    // ✅ DOCUMENT URLS (Frontend से आएंगे)
    aadhaarUploaded,
    panUploaded,
    resumeUploaded,
    currentAddressProofUploaded,
    permanentAddressProofUploaded,

    twelthCertificateUploaded,
    graduationCertificateUploaded,

    passportPhotoUploaded,
    qrCodeUploaded,
    signatureUploaded,
  } = req.body;

  // ✅ SAFE JSON PARSE
  let parsedEducation = null;
  let parsedExperience = null;

  try {
    parsedEducation = education ? JSON.parse(education) : null;
  } catch (err) {
    parsedEducation = null;
  }

  try {
    parsedExperience = experience ? JSON.parse(experience) : null;
  } catch (err) {
    parsedExperience = null;
  }

  // ✅ Insert into DB
  const newUser = await insertUser({
    firstName,
    middleName: middleName || null,
    lastName,

    dateOfBirth: dateOfBirth || null,
    gender: gender || null,
    maritalStatus: maritalStatus || null,
    bloodGroup: bloodGroup || null,

    personalEmail,
    mobile,
    alternateNumber: alternateNumber || null,
    localRelation: localRelation || null,
    localName: localName || null,

    permanentAddress: permanentAddress || null,
    permanentCity: permanentCity || null,
    permanentState: permanentState || null,
    permanentPincode: permanentPincode || null,

    currentAddress: currentAddress || null,
    currentCity: currentCity || null,
    currentState: currentState || null,
    currentPincode: currentPincode || null,

    pfNumber: pfNumber || null,
    esicNumber: esicNumber || null,
    uanNumber: uanNumber || null,

    bankName: bankName || null,
    accountHolderName: accountHolderName || null,
    accountNumber: accountNumber || null,
    ifscCode: ifscCode || null,
    branch: branch || null,
    accountType: accountType || null,
    upiId: upiId || null,

    education: parsedEducation,
    experience: parsedExperience,

    fatherName: fatherName || null,
    fatherRelation: fatherRelation || null,
    fatherContact: fatherContact || null,
    fatherOccupation: fatherOccupation || null,

    motherName: motherName || null,
    motherRelation: motherRelation || null,
    motherContact: motherContact || null,
    motherOccupation: motherOccupation || null,

    spouseName: spouseName || null,
    spouseRelation: spouseRelation || null,
    spouseContact: spouseContact || null,
    spouseOccupation: spouseOccupation || null,

    siblingName: siblingName || null,
    siblingRelation: siblingRelation || null,
    siblingContact: siblingContact || null,
    siblingOccupation: siblingOccupation || null,

    hrPolicyAccepted: hrPolicyAccepted || null,
    commitmentDeclarationAccepted: commitmentDeclarationAccepted || null,
    informationDeclarationAccepted: informationDeclarationAccepted || null,

    // ✅ DIRECT URL SAVE
    aadhaarUploaded: aadhaarUploaded || null,
    panUploaded: panUploaded || null,
    resumeUploaded: resumeUploaded || null,
    currentAddressProofUploaded: currentAddressProofUploaded || null,
    permanentAddressProofUploaded: permanentAddressProofUploaded || null,

    twelthCertificateUploaded: twelthCertificateUploaded || null,
    graduationCertificateUploaded: graduationCertificateUploaded || null,

    passportPhotoUploaded: passportPhotoUploaded || null,
    qrCodeUploaded: qrCodeUploaded || null,
    signatureUploaded: signatureUploaded || null,
  });

  if (!newUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const client = clientInfo(req);
  const user = await findUserByUserName(username);
  if (!user) {
    await logLoginEvent({ username, eventType: "login_failed", failureReason: "user_not_found", ...client });
    throw new ApiError(404, "User does not exist");
  }
  if (Number(user.is_active) !== 1) {
    await logLoginEvent({ staffId: user.id, username, eventType: "login_failed", failureReason: "inactive", ...client });
    throw new ApiError(403, "Your account is inactive. Please contact admin.");
  }

  const validPassword = await isPasswordCorrect(password, user.password);
  if (!validPassword) {
    await logLoginEvent({ staffId: user.id, username, eventType: "login_failed", failureReason: "invalid_password", ...client });
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  const sessionId = await saveRefreshToken(user.id, refreshToken, client);
  await logLoginEvent({ staffId: user.id, sessionId, username, eventType: "login_success", ...client });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const fullUser = await findUserById(user.id);

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: fullUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const currentUser = await findUserById(id);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, currentUser, "Current user fetched successfully"),
    );
});

const updateUserRoleManagerDepartment = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { manager_id, role_id, department_id } = req.body; // 🔹 Added department_id

  // Find user by UUID
  const user = await findUserById(uuid);
  if (!user) {
    throw new ApiError(404, "User not found by uuid");
  }

  // Update user
  const updated = await updateUserManagerRoleDepartment({
    user_id: user.id,
    manager_id,
    role_id,
    department_id, // 🔹 Added department_id
  });

  if (!updated) {
    throw new ApiError(404, "User not found or not updated");
  }

  // Get updated user details
  const updatedUser = await findUserById(user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const getAllUsersWithDepartment = asyncHandler(async (req, res) => {
  const users = await getUsersWithDepartment();

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getUserDetailsByRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Role ID is required");
  }

  const roleId = Number(id);

  if (isNaN(roleId)) {
    throw new ApiError(400, "Invalid Role ID");
  }

  const users = await getUsersByRole(roleId);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "User details fetched by role"));
});

const getAllEmployee = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const employee = await allEmployee(page, limit);

  const parsedEmployees = employee.employees.map((emp) => ({
    ...emp,
    education: emp.education ? JSON.parse(emp.education) : [],
    experience: emp.experience ? JSON.parse(emp.experience) : [],
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...employee,
        employees: parsedEmployees, // 🔥 parsed data replace
      },
      "All Employee fetched successfully",
    ),
  );
});

// controller
const updateUserByIdController = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User ID is required"));
  }
  const TEMP_ID_TYPES = ["Probation", "Intern", "Contractual"];

  // ✅ Full-time → employeeId generate karo
  if (updateData.employmentType === "Full-time") {
    const generatedEmployeeId = await generateEmployeeId(
      updateData.branchOffice_id,
      userId,
    );

    // ✅ force string
    updateData.employeeId =
      typeof generatedEmployeeId === "object"
        ? generatedEmployeeId.employeeId
        : generatedEmployeeId;

    console.log(
      "[update] Employee ID:",
      updateData.employeeId,
      typeof updateData.employeeId,
    );
  }

  if (updateData.employmentType === "Full-time") {
    const generatedEmployeeId = await generateEmployeeId(
      updateData.branchOffice_id,
      userId,
    );

    // ✅ force string
    updateData.employeeId =
      typeof generatedEmployeeId === "object"
        ? generatedEmployeeId.employeeId
        : generatedEmployeeId;
  }

  if (TEMP_ID_TYPES.includes(updateData.employmentType)) {
    const generatedTempId = await generateTempId(userId);

    updateData.tempId = generatedTempId;
  }

  const updatedUser = await updateUserById(userId, updateData);

  const io = getIO();
  io.emit("employeeUpdated", updatedUser);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const getEmployeeBYStatus = asyncHandler(async (req, res) => {
  let { page, status } = req.query;

  // Page validation
  page = parseInt(page);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const employee = await getEmployeeByStatus(page, status);

  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employees fetched successfully"));
});

const getEmployeePandingStatus = asyncHandler(async (req, res) => {
  let { page } = req.query;

  // Page validation
  page = parseInt(page);
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (!status) {
    throw new ApiError(" Status are invailed");
  }

  const employee = await getEmployeeByStatus(page, "pending");

  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employees fetched successfully"));
});

const updateEmployeeStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    throw new ApiError(400, "Employee ID is required");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const result = await updateEmployeeStatus(id, status);

  const io = getIO();
  io.emit("employeeStatusUpdated", result);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Status updated successfully"));
});

const getSingaleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, " ID is Invailed");
  }
  const currentUser = await findUserByUUID(id);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, currentUser, "Current user fetched successfully"),
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const { confirmPassword, newPassword } = req.body;
  console.log(confirmPassword, newPassword);

  if (!confirmPassword || !newPassword) {
    throw new ApiError(400, "Username and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const user = await findUserById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const result = await updatePasswordById(id, confirmPassword);

  if (result.affectedRows === 0) {
    throw new ApiError(500, "Password update failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const changePasswordbyUserName = asyncHandler(async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    throw new ApiError(400, "username and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const user = await findUserByUserName(username);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const result = await updatePasswordByUsername(username, newPassword);

  if (result.affectedRows === 0) {
    throw new ApiError(500, "Password update failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const getAllReportingManagerWithDepartment = asyncHandler(async (req, res) => {
  const { departmentName } = req.params;
  const users = await getReportingManagerWithDepartment(departmentName);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getHREmployeesController = asyncHandler(async (req, res) => {
  const employees = await getHREmployees();

  return res
    .status(200)
    .json(new ApiResponse(200, employees, "HR Employees fetched successfully"));
});

const getAllEmployeesWithShiftController = asyncHandler(async (req, res) => {
  const employees = await getAllEmployeesWithShift();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        employees,
        "Employees with department and shift timing fetched successfully",
      ),
    );
});

export const getEmployees = asyncHandler(async (req, res) => {
  const { branchId } = req.query;

  const employees = await getEmployeeList(branchId);

  if (!employees || employees.length === 0) {
    throw new ApiError(404, "Employees not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, employees, "Employee list fetched successfully"),
    );
});
export {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserRoleManagerDepartment,
  getAllUsersWithDepartment,
  getUserDetailsByRole,
  getAllEmployee,
  updateUserByIdController,
  getEmployeeBYStatus,
  updateEmployeeStatusController,
  getSingaleUser,
  changePassword,
  changePasswordbyUserName,
  getAllReportingManagerWithDepartment,
  getHREmployeesController,
  getAllEmployeesWithShiftController,
};
