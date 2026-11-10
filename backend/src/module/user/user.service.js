import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../../config/mySqlDB.js";
const isPasswordCorrect = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const generateEmployeeId = async (branchId, employeeId) => {
  const [branch] = await pool.query(
    "SELECT branch_code FROM branches WHERE id = ?",
    [branchId],
  );

  if (branch.length === 0) {
    throw new Error("Branch not found");
  }

  const code = branch[0].branch_code;

  // ✅ current employee ka existing employeeId check
  if (employeeId) {
    const [employee] = await pool.query(
      `
        SELECT employeeId
        FROM uc_staff_profile
        WHERE id = ?
        LIMIT 1
      `,
      [employeeId],
    );

    if (employee.length > 0 && employee[0].employeeId) {
      const existingId = employee[0].employeeId;

      // ✅ kisi aur user ke paas same id hai?
      const [duplicate] = await pool.query(
        `
          SELECT id
          FROM uc_staff_profile
          WHERE employeeId = ?
          AND id != ?
          LIMIT 1
        `,
        [existingId, employeeId],
      );

      // ✅ safe existing id
      if (duplicate.length === 0) {
        console.log("Existing Safe ID:", existingId);

        return existingId;
      }

      console.log("Duplicate existing ID found");
    }
  }

  // ✅ branch ke saare employeeId fetch karo
  const [rows] = await pool.query(
    `
      SELECT employeeId
      FROM uc_staff_profile
      WHERE employeeId LIKE ?
    `,
    [`${code}%`],
  );

  let maxNumber = 0;

  for (const row of rows) {
    if (!row.employeeId) continue;

    const numericPart = row.employeeId.replace(code, "");

    const parsed = parseInt(numericPart, 10);

    if (!isNaN(parsed) && parsed > maxNumber) {
      maxNumber = parsed;
    }
  }

  // ✅ next id
  const nextId = code + String(maxNumber + 1).padStart(6, "0");

  return nextId;
};

const generateTempId = async (userId) => {
  // User fetch
  const [currentUser] = await pool.query(
    "SELECT tempId FROM uc_staff_profile WHERE id = ? LIMIT 1",
    [userId],
  );

  if (currentUser.length === 0) {
    throw new Error("User not found");
  }

  // ✅ Agar already tempId hai to wahi return karo
  if (currentUser[0].tempId && currentUser[0].tempId !== "") {
    console.log(`[generateTempId] Already exists: ${currentUser[0].tempId}`);

    return currentUser[0].tempId;
  }

  // Last tempId fetch
  const [result] = await pool.query(
    `SELECT tempId
     FROM uc_staff_profile
     WHERE tempId IS NOT NULL
       AND tempId != ''
     ORDER BY CAST(tempId AS UNSIGNED) DESC
     LIMIT 1`,
  );

  let number = 1;

  if (result.length > 0 && result[0].tempId) {
    const lastNumber = parseInt(result[0].tempId, 10);

    if (!isNaN(lastNumber)) {
      number = lastNumber + 1;
    }
  }

  const MAX_RETRIES = 10;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const candidateId = String(number + i).padStart(5, "0");

    const [existing] = await pool.query(
      `SELECT id
       FROM uc_staff_profile
       WHERE tempId = ?
       LIMIT 1`,
      [candidateId],
    );

    if (existing.length === 0) {
      await pool.query(
        `UPDATE uc_staff
         SET temp_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [candidateId, userId],
      );

      console.log(`[generateTempId] Generated & Updated: ${candidateId}`);

      return candidateId;
    }
  }

  throw new Error("Could not generate unique tempId");
};

const cleanUserUpdateData = (data) => {
  const allowedFields = [
    "firstName",
    "middleName",
    "lastName",
    "dateOfBirth",
    "gender",
    "maritalStatus",
    "bloodGroup",
    "personalEmail",
    "mobile",
    "alternateNumber",
    "currentAddress",
    "currentCity",
    "currentState",
    "currentPincode",
    "permanentAddress",
    "permanentCity",
    "permanentState",
    "permanentPincode",
    "bankName",
    "accountHolderName",
    "accountNumber",
    "ifscCode",
    "branch",
    "accountType",
    "upiId",
    "education",
    "experience",
    "fatherName",
    "fatherRelation",
    "fatherContact",
    "fatherOccupation",
    "motherName",
    "motherRelation",
    "motherContact",
    "motherOccupation",
    "siblingName",
    "siblingRelation",
    "siblingContact",
    "siblingOccupation",
    "aadhaarUploaded",
    "panUploaded",
    "resumeUploaded",
    "twelthCertificateUploaded",
    "graduationCertificateUploaded",
    "passportPhotoUploaded",
    "qrCodeUploaded",
    "signatureUploaded",
    "password",
    "username",
    "role_id",
    "department_id",
    "subDepartment_id",
    "manager_id",
    "is_active",
    "refreshToken",
    "joiningDate",
    "confirmationDate",
    "employeeStatus",
    "grade",
    "noticePeriod",
    "hrManager",
    "probationTenure",
    "employmentType",
    "workLocation",
    "workShift",
    "weeklyoff",
    "ctc",
    "basicSalary",
    "shiftTiming",
    "hrPolicyAccepted",
    "commitmentDeclarationAccepted",
    "informationDeclarationAccepted",
    "status",
    "formLinkActive",
    "branchOffice_id",
    "companyName",
    "officeEmail",
    "officeNumber",
    "shortName",
    "employeeType",
  ];

  const cleanData = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      cleanData[key] = data[key];
    }
  }

  return cleanData;
};

export {
  generateTokens,
  isPasswordCorrect,
  generateEmployeeId,
  cleanUserUpdateData,
  generateTempId,
};
