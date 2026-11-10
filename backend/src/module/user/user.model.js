import { pool } from "../../config/mySqlDB.js";
import bcrypt from "bcrypt";
import { generateUUID } from "../../utils/uuid.js";
import {
  STAFF_VIEW,
  createStaff,
  updateStaff,
  setPasswordHash,
  createSession,
} from "./staff.repository.js";

// Staff are read through the `uc_staff_profile` view, which returns the same columns
// as the old `users` table. Writes go through staff.repository.js.
export const USER_TABLE = STAFF_VIEW;
export const USER_COLUMNS = {
  ID: "id",
  EMPLOYEE_ID: "employeeId",
  UUID: "uuid",

  // PERSONAL
  FIRST_NAME: "firstName",
  MIDDLE_NAME: "middleName",
  LAST_NAME: "lastName",
  DATE_OF_BIRTH: "dateOfBirth",
  GENDER: "gender",
  MARITAL_STATUS: "maritalStatus",
  BLOOD_GROUP: "bloodGroup",

  // CONTACT
  MOBILE: "mobile",
  ALTERNATE_NUMBER: "alternateNumber",
  EMERGENCY_CONTACT: "localRelation",
  PERSONAL_EMAIL: "personalEmail",

  // ADDRESS
  CURRENT_ADDRESS: "currentAddress",
  PERMANENT_ADDRESS: "permanentAddress",
  CITY: "city",
  STATE: "state",
  PINCODE: "pincode",

  // EMPLOYMENT
  COMPANY_EMAIL: "companyEmail",
  PASSWORD: "password",
  ROLE_ID: "role_id",
  DEPARTMENT_ID: "department_id",
  MANAGER_ID: "manager_id",
  subDepartment_id: "subDepartment_id",
  JOINING_DATE: "joiningDate",
  CONFIRMATION_DATE: "confirmationDate",
  EMPLOYEE_STATUS: "employeeStatus",
  GRADE: "grade",
  NOTICE_PERIOD: "noticePeriod",
  HR_MANAGER: "hrManager",
  PROBATION_TENURE: "probationTenure",
  EMPLOYMENT_TYPE: "employmentType",
  WORK_LOCATION: "workLocation",

  // OFFICIAL
  WORK_SHIFT: "workShift",
  WEEKLY_OFF: "weeklyoff",
  CTC: "ctc",
  BASIC_SALARY: "basicSalary",
  PF_NUMBER: "pfNumber",
  ESIC_NUMBER: "esicNumber",
  UAN_NUMBER: "uanNumber",
  SHIFT_TIMING: "shiftTiming",

  // BANK
  BANK_NAME: "bankName",
  ACCOUNT_HOLDER_NAME: "accountHolderName",
  ACCOUNT_NUMBER: "accountNumber",
  IFSC_CODE: "ifscCode",
  BRANCH: "branch",
  ACCOUNT_TYPE: "accountType",
  UPI_ID: "upiId",

  // EDUCATION (ARRAY)
  EDUCATION: "education",

  // EXPERIENCE (ARRAY)
  EXPERIENCE: "experience",

  // FAMILY
  FATHER_NAME: "fatherName",
  FATHER_RELATION: "fatherRelation",
  FATHER_CONTACT: "fatherContact",
  FATHER_OCCUPATION: "fatherOccupation",
  MOTHER_NAME: "motherName",
  MOTHER_RELATION: "motherRelation",
  MOTHER_CONTACT: "motherContact",
  MOTHER_OCCUPATION: "motherOccupation",
  SPOUSE_NAME: "spouseName",
  SPOUSE_RELATION: "spouseRelation",
  SPOUSE_CONTACT: "spouseContact",
  SPOUSE_OCCUPATION: "spouseOccupation",
  NOMINEE_NAME: "nomineeName",
  NOMINEE_RELATION: "nomineeRelation",
  NOMINEE_CONTACT: "nomineeContact",
  NOMINEE_OCCUPATION: "nomineeOccupation",

  // DOCUMENTS
  AADHAAR_UPLOADED: "aadhaarUploaded",
  PAN_UPLOADED: "panUploaded",
  RESUME_UPLOADED: "resumeUploaded",
  OFFER_LETTER_UPLOADED: "offerLetterUploaded",
  EXPERIENCE_LETTER_UPLOADED: "experienceLetterUploaded",
  TWELTH_CERTIFICATE_UPLOADED: "twelthCertificateUploaded",
  GRADUATION_CERTIFICATE_UPLOADED: "graduationCertificateUploaded",
  SALARY_SLIP_UPLOADED: "salarySlipUploaded",
  PASSPORT_PHOTO_UPLOADED: "passportPhotoUploaded",
  BANK_STATEMENT_UPLOADED: "bankStatementUploaded",
  CURRENT_ADDRESS_PROOF_UPLOADED: "currentAddressProofUploaded",
  PERMANENT_ADDRESS_PROOF_UPLOADED: "permanentAddressProofUploaded",

  // HR POLICY
  HR_POLICY_ACCEPTED: "hrPolicyAccepted",

  // STATUS
  STATUS: "status",

  // FORM LINK
  FORM_LINK: "formLink",
  FORM_LINK_ACTIVE: "formLinkActive",

  // SYSTEM FIELDS
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  REFRESH_TOKEN: "refreshToken",
};

export const insertUser = async (userData) => {
  try {
    const userUuid = generateUUID();
    const {
      firstName = null,
      middleName = null,
      lastName = null,
      dateOfBirth = null,
      gender = null,
      maritalStatus = null,
      bloodGroup = null,

      personalEmail = null,
      mobile = null,
      alternateNumber = null,
      localRelation = null,
      localName = null,

      permanentAddress = null,
      permanentCity = null,
      permanentState = null,
      permanentPincode = null,
      currentAddress = null,

      currentCity = null,
      currentState = null,
      currentPincode = null,

      pfNumber = null,
      esicNumber = null,
      uanNumber = null,

      bankName = null,
      accountHolderName = null,
      accountNumber = null,
      ifscCode = null,
      branch = null,
      accountType = null,
      upiId = null,

      education = null,
      experience = null,

      fatherName = null,
      fatherRelation = null,
      fatherContact = null,
      fatherOccupation = null,

      motherName = null,
      motherRelation = null,
      motherContact = null,
      motherOccupation = null,

      spouseName = null,
      spouseRelation = null,
      spouseContact = null,
      spouseOccupation = null,

      siblingName = null,
      siblingRelation = null,
      siblingContact = null,
      siblingOccupation = null,
      // ✅ ADD THESE
      hrPolicyAccepted = null,
      commitmentDeclarationAccepted = null,
      informationDeclarationAccepted = null,

      aadhaarUploaded = null,
      panUploaded = null,
      resumeUploaded = null,
      offerLetterUploaded = null,
      experienceLetterUploaded = null,
      twelthCertificateUploaded = null,
      graduationCertificateUploaded = null,
      salarySlipUploaded = null,
      passportPhotoUploaded = null,
      qrCodeUploaded = null,
      signatureUploaded = null,
      bankStatementUploaded = null,
      currentAddressProofUploaded = null,
      permanentAddressProofUploaded = null,
    } = userData;

    // Same rule as before: only non-empty values are saved.
    const fields = {};
    const addField = (column, value) => {
      if (value !== null && value !== undefined && value !== "") {
        fields[column.trim()] = value;
      }
    };
    // Personal
    addField("firstName", firstName);
    addField("middleName", middleName);
    addField("lastName", lastName);
    addField("dateOfBirth", dateOfBirth);
    addField("gender", gender);
    addField("maritalStatus", maritalStatus);
    addField("bloodGroup", bloodGroup);

    // Contact
    addField("personalEmail", personalEmail);
    addField("mobile", mobile);
    addField("alternateNumber", alternateNumber);
    addField("localRelation", localRelation);
    addField("localName", localName);

    // Address
    addField("permanentAddress", permanentAddress);
    addField("permanentCity", permanentCity);
    addField("permanentState", permanentState);
    addField("permanentPincode", permanentPincode);
    addField("currentAddress", currentAddress);
    addField("currentCity", currentCity);
    addField("currentState", currentState);
    addField("currentPincode", currentPincode);

    // PF / ESIC / UAN
    addField("pfNumber", pfNumber);
    addField("esicNumber", esicNumber);
    addField("uanNumber", uanNumber);

    // Bank
    addField("bankName", bankName);
    addField("accountHolderName", accountHolderName);
    addField("accountNumber", accountNumber);
    addField("ifscCode", ifscCode);
    addField("branch", branch);
    addField("accountType", accountType);
    addField("upiId", upiId);

    // Education & Experience (Stored as JSON)
    if (education) addField("education", JSON.stringify(education));
    if (experience) addField("experience", JSON.stringify(experience));

    // Family
    addField("fatherName", fatherName);
    addField("fatherRelation", fatherRelation);
    addField("fatherContact", fatherContact);
    addField("fatherOccupation", fatherOccupation);

    addField("motherName", motherName);
    addField("motherRelation", motherRelation);
    addField("motherContact", motherContact);
    addField("motherOccupation", motherOccupation);

    addField("spouseName", spouseName);
    addField("spouseRelation", spouseRelation);
    addField("spouseContact", spouseContact);
    addField("spouseOccupation", spouseOccupation);

    addField(" siblingName", siblingName);
    addField(" siblingRelation", siblingRelation);
    addField(" siblingContact", siblingContact);
    addField(" siblingOccupation", siblingOccupation);

    addField("hrPolicyAccepted", hrPolicyAccepted);
    addField("commitmentDeclarationAccepted", commitmentDeclarationAccepted);
    addField("informationDeclarationAccepted", informationDeclarationAccepted);

    // Documents
    addField("aadhaarUploaded", aadhaarUploaded);
    addField("panUploaded", panUploaded);
    addField("resumeUploaded", resumeUploaded);
    addField("offerLetterUploaded", offerLetterUploaded);
    addField("experienceLetterUploaded", experienceLetterUploaded);
    addField("twelthCertificateUploaded", twelthCertificateUploaded);
    addField("graduationCertificateUploaded", graduationCertificateUploaded);
    addField("salarySlipUploaded", salarySlipUploaded);
    addField("passportPhotoUploaded", passportPhotoUploaded);
    addField("qrCodeUploaded", qrCodeUploaded);
    addField("signatureUploaded", signatureUploaded);
    addField("bankStatementUploaded", bankStatementUploaded);
    addField("currentAddressProofUploaded", currentAddressProofUploaded);
    addField("permanentAddressProofUploaded", permanentAddressProofUploaded);

    const insertId = await createStaff(userUuid, fields);

    return {
      id: insertId,
      message: "User inserted successfully",
    };
  } catch (error) {
    console.error("Insert User Error:", error);
    throw error;
  }
};

export const findUserByUserName = async (userName) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE username = ?`,
      [userName],
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const findUserByUUID = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE id = ?`,
      [id],
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const updateUserManagerRoleDepartment = async ({
  user_id,
  manager_id,
  role_id,
  department_id, // 🔹 New parameter
}) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const fields = [];
    const values = [];

    if (manager_id !== undefined) {
      fields.push(`${USER_COLUMNS.MANAGER_ID} = ?`);
      values.push(manager_id);
    }

    if (role_id !== undefined) {
      fields.push(`${USER_COLUMNS.ROLE_ID} = ?`);
      values.push(role_id);
    }

    // 🔹 New department update
    if (department_id !== undefined) {
      fields.push(`${USER_COLUMNS.DEPARTMENT_ID} = ?`);
      values.push(department_id);
    }

    if (fields.length === 0) {
      throw new Error("Nothing to update");
    }

    // Add updated_at timestamp
    fields.push(`${USER_COLUMNS.UPDATED_AT} = NOW()`);

    const sql = `
      UPDATE uc_staff
      SET ${fields.join(", ")}
      WHERE ${USER_COLUMNS.ID} = ?
    `;

    values.push(user_id);

    const [result] = await pool.execute(sql, values);

    return result.affectedRows > 0;
  } catch (error) {
    console.error("updateUserManagerRoleDepartment error:", error);
    throw error;
  }
};

export const updateUserDepartment = async (user_id, department_id) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const sql = `
      UPDATE uc_staff
      SET ${USER_COLUMNS.DEPARTMENT_ID} = ?, ${USER_COLUMNS.UPDATED_AT} = NOW()
      WHERE ${USER_COLUMNS.ID} = ?
    `;

    const [result] = await pool.execute(sql, [department_id, user_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("updateUserDepartment error:", error);
    throw error;
  }
};

export const getUsersByDepartment = async (department_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE ${USER_COLUMNS.DEPARTMENT_ID} = ?`,
      [department_id],
    );
    return rows;
  } catch (error) {
    console.error("getUsersByDepartment error:", error);
    throw error;
  }
};

export const getUsersWithDepartment = async () => {
  try {
    const sql = `
      SELECT 
        u.*,
        d.department_name,
        r.role_name,
        m.name as manager_name
      FROM ${USER_TABLE} u
      LEFT JOIN departments d ON u.${USER_COLUMNS.DEPARTMENT_ID} = d.id
      LEFT JOIN roles r ON u.${USER_COLUMNS.ROLE_ID} = r.id
      LEFT JOIN ${USER_TABLE} m ON u.${USER_COLUMNS.MANAGER_ID} = m.id
      ORDER BY u.${USER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error("getUsersWithDepartment error:", error);
    throw error;
  }
};

export const getDepartmentWiseUserCount = async () => {
  try {
    const sql = `
      SELECT 
        d.id,
        d.department_name,
        COUNT(u.id) as total_users,
        SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active_users
      FROM departments d
      LEFT JOIN ${USER_TABLE} u ON d.id = u.${USER_COLUMNS.DEPARTMENT_ID}
      GROUP BY d.id, d.department_name
      ORDER BY total_users DESC
    `;

    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error("getDepartmentWiseUserCount error:", error);
    throw error;
  }
};

// Stores the login as a new row in auth_sessions (token kept only as a SHA-256 hash).
// Returns the session id.
export const saveRefreshToken = async (
  userId,
  refreshToken,
  clientMeta = {},
) => {
  try {
    return await createSession(userId, refreshToken, clientMeta);
  } catch (error) {
    console.error("saveRefreshToken error:", error);
    throw error;
  }
};

export const getUsersWithoutDepartment = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE ${USER_COLUMNS.DEPARTMENT_ID} IS NULL`,
    );
    return rows;
  } catch (error) {
    console.error("getUsersWithoutDepartment error:", error);
    throw error;
  }
};

export const getUsersByRole = async (roleId) => {
  if (!roleId) throw new Error("Role ID is required");

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        u.role_id,
        r.role_name,
        c.id AS city_id,
        c.city_name
      FROM uc_staff_profile u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employee_cities ec ON u.id = ec.employee_id
      LEFT JOIN cities c ON ec.city_id = c.id
      WHERE u.role_id = ?
      ORDER BY u.id DESC
      `,
      [roleId],
    );

    const usersMap = {};

    rows.forEach((row) => {
      if (!usersMap[row.user_id]) {
        usersMap[row.user_id] = {
          id: row.user_id,
          name: row.user_name,
          email: row.email,
          role_id: row.role_id,
          role_name: row.role_name,
          cities: [],
        };
      }

      if (row.city_id) {
        usersMap[row.user_id].cities.push({
          id: row.city_id,
          name: row.city_name,
        });
      }
    });

    return Object.values(usersMap);
  } catch (error) {
    console.error("getUsersByRole error:", error);
    throw error;
  }
};

export const allEmployee = async (page, limit) => {
  try {
    // ─── Sanitize inputs ────────────────────────────────────────────────────
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const limitNumber = Number(limit) > 0 ? Number(limit) : 10; // default 10

    const isPagination = page !== undefined && page !== null && page !== "";
    const offset = (pageNumber - 1) * limitNumber;

    // ─── Main Query ─────────────────────────────────────────────────────────
    let query = `
      SELECT 
        u.id,
        u.employeeId,
        u.tempId,
        u.uuid,
        u.firstName,
        u.middleName,
        u.lastName,
        u.dateOfBirth,
        u.gender,
        u.maritalStatus,
        u.bloodGroup,
        u.personalEmail,
        u.mobile,
        u.alternateNumber,
        u.localName,
        u.localRelation,
        u.currentAddress,
        u.currentCity,
        u.currentState,
        u.currentPincode,
        u.permanentAddress,
        u.permanentCity,
        u.permanentState,
        u.permanentPincode,
        u.pfNumber,
        u.esicNumber,
        u.uanNumber,
        u.bankName,
        u.accountHolderName,
        u.accountNumber,
        u.branch,
        u.ifscCode,
        u.branchOffice_id,
        b.branch_name,
        u.zoneName,
        u.accountType,
        u.upiId,
        u.education,
        u.experience,
        u.fatherName,
        u.fatherRelation,
        u.fatherContact,
        u.fatherOccupation,
        u.motherName,
        u.motherRelation,
        u.motherContact,
        u.motherOccupation,
        u.spouseName,
        u.spouseRelation,
        u.spouseContact,
        u.spouseOccupation,
        u.siblingName,
        u.siblingRelation,
        u.siblingContact,
        u.siblingOccupation,
        u.aadhaarUploaded,
        u.panUploaded,
        u.resumeUploaded,
        u.twelthCertificateUploaded,
        u.graduationCertificateUploaded,
        u.passportPhotoUploaded,
        u.qrCodeUploaded,
        u.signatureUploaded,
        u.officeEmail,
        u.officeNumber,
        u.designation,
        u.password,
        u.role_id,
        u.shortName,
        r.role_name,
        u.department_id,
        d.department_name,
        u.ho_id,
        h.ho_name,
        u.subDepartment_id,
        des.subDepartment_name,
        u.manager_id,
        m.firstName as manager_firstName,
        m.lastName as manager_lastName,
        CONCAT(m.firstName, ' ', m.lastName) as manager_name,
        u.is_active,
        u.refreshToken,
        u.joiningDate,
        u.confirmationDate,
        u.employeeStatus,
        u.grade,
        u.noticePeriod,
        u.hrManager,
        hr.firstName as manager_firstName,
        hr.lastName as manager_lastName,
        CONCAT(hr.firstName, ' ', hr.lastName) as hrManager_name,
        u.probationTenure,
        u.employmentType,
        u.workLocation,
        u.workShift,
        u.weeklyoff,
        u.ctc,
        u.basicSalary,
        u.shiftTiming,
        u.hrPolicyAccepted,
        u.commitmentDeclarationAccepted,
        u.informationDeclarationAccepted,
        u.status,
        u.formLink,
        u.created_at,
        u.updated_at
      FROM uc_staff_profile u
      LEFT JOIN branches b ON u.branchOffice_id = b.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN hos h ON u.ho_id = h.id
      LEFT JOIN sub_department des ON u.subDepartment_id = des.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN uc_staff_profile m ON u.manager_id = m.id
      LEFT JOIN uc_staff_profile hr ON u.hrManager = hr.id
      ORDER BY u.created_at DESC
    `;

    // ─── Apply pagination only when page param is provided ──────────────────
    if (isPagination) {
      query += ` LIMIT ${limitNumber} OFFSET ${offset}`;
    }

    const [rows] = await pool.query(query);

    // ─── Total count ────────────────────────────────────────────────────────
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM uc_staff_profile`,
    );
    const total = countResult[0].total;
    const totalPages = isPagination ? Math.ceil(total / limitNumber) : 1;

    return {
      employees: rows,
      pagination: {
        currentPage: isPagination ? pageNumber : 1,
        totalPages,
        total,
        limit: limitNumber,
        hasPrevPage: isPagination ? pageNumber > 1 : false,
        hasNextPage: isPagination ? pageNumber < totalPages : false,
      },
    };
  } catch (error) {
    console.error("allEmployee Model Error:", error);
    throw error;
  }
};

export const updateUserById = async (userId, data) => {
  try {
    const fieldsToExclude = ["created_at", "id", "uuid", "updated_at"];
    fieldsToExclude.forEach((field) => {
      delete data[field];
    });

    const dateFields = ["dateOfBirth", "joiningDate", "confirmationDate"];
    dateFields.forEach((field) => {
      if (data[field]) {
        data[field] = new Date(data[field]).toISOString().split("T")[0];
      }
    });

    if (Object.keys(data).length === 0) {
      return { affectedRows: 0 };
    }

    // Routes every field to its normalized table (and bcrypt-hashes a new password).
    return await updateStaff(userId, data);
  } catch (error) {
    console.error("updateUserById error:", error);
    throw error;
  }
};

export const updateEmployeeStatus = async (employeeId, status) => {
  try {
    const [result] = await pool.query(
      `UPDATE uc_staff
       SET onboarding_status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, employeeId],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    // 🔥 realtime ke liye minimal payload return
    return {
      id: Number(employeeId),
      status,
    };
  } catch (error) {
    console.error("updateEmployeeStatus Model Error:", error);
    throw error;
  }
};

export const getEmployeeByStatus = async (page = 1, status) => {
  try {
    const limit = 10;
    const pageNumber = Number(page) || 1;
    const offset = (pageNumber - 1) * limit;

    let whereClause = "";
    let params = [];

    if (status) {
      whereClause = "WHERE u.status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(
      `
      SELECT 
        u.id,
        u.employeeId,
        u.tempId,
        u.uuid,
        u.firstName,
        u.middleName,
        u.lastName,
        u.dateOfBirth,
        u.gender,
        u.maritalStatus,
        u.bloodGroup,
        u.personalEmail,
        u.mobile,
        u.alternateNumber,
        u.currentAddress,
        u.currentCity,
        u.currentState,
        u.currentPincode,
        u.permanentAddress,
        u.permanentCity,
        u.permanentState,
        u.permanentPincode,
        u.pfNumber,
        u.esicNumber,
        u.uanNumber,
        u.bankName,
        u.accountHolderName,
        u.accountNumber,
        u.branch,
        u.ifscCode,
        u.branchOffice_id,
        b.branch_name,
        u.zoneName,
        u.accountType,
        u.upiId,
        u.education,
        u.experience,
        u.fatherName,
        u.fatherRelation,
        u.fatherContact,
        u.fatherOccupation,
        u.motherName,
        u.motherRelation,
        u.motherContact,
        u.motherOccupation,
        u.spouseName,
        u.spouseRelation,
        u.spouseContact,
        u.spouseOccupation,
        u.siblingName,
        u.siblingRelation,
        u.siblingContact,
        u.siblingOccupation,
        u.aadhaarUploaded,
        u.panUploaded,
        u.resumeUploaded,
       
        u.twelthCertificateUploaded,
        u.graduationCertificateUploaded,
       
        u.passportPhotoUploaded,
        u.qrCodeUploaded,
        u.signatureUploaded,
       
        u.officeEmail,
        u.officeNumber,
        u.password,
        u.role_id,
        r.role_name,
        u.department_id,
        d.department_name,
        u.ho_id,
        h.ho_name,
        u.subDepartment_id,
        des.subDepartment_name,
        u.manager_id,
        m.firstName as manager_firstName,
        m.lastName as manager_lastName,
        CONCAT(m.firstName, ' ', m.lastName) as manager_name,
        u.is_active,
        u.refreshToken,
        u.joiningDate,
        u.confirmationDate,
        u.employeeStatus,
        u.grade,
        u.noticePeriod,
        u.hrManager,
        u.probationTenure,
        u.employmentType,
        u.workLocation,
        u.workShift,
        u.weeklyoff,
        u.ctc,
        u.basicSalary,
        u.shiftTiming,
        
        u.hrPolicyAccepted,
        u.commitmentDeclarationAccepted,
        u.informationDeclarationAccepted,
        u.status,
        u.formLink,
       
        
        u.created_at,
        u.updated_at
      FROM uc_staff_profile u
      LEFT JOIN branches b ON u.branchOffice_id = b.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN hos h ON u.ho_id = h.id
      LEFT JOIN sub_department des ON u.subDepartment_id = des.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN uc_staff_profile m ON u.manager_id = m.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const [countResult] = await pool.query(
      `
      SELECT COUNT(*) as total 
      FROM uc_staff_profile u
      ${whereClause}
      `,
      params,
    );

    const total = countResult[0].total;

    return {
      employees: rows,
      currentPage: pageNumber,
      totalEmployees: total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("getEmployeeByStatus Model Error:", error);
    throw error;
  }
};

export const updatePasswordById = async (id, confirmPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    return await setPasswordHash({ staffId: id }, hashedPassword);
  } catch (error) {
    throw error;
  }
};

export const findUserById = async (id) => {
  if (!id) throw new Error("User ID is required");

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        u.*, 
        r.role_name,
        h.ho_name,
        d.department_name,
        des.subDepartment_name
      FROM uc_staff_profile u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN hos h ON u.ho_id = h.id
      LEFT JOIN sub_department des ON u.subDepartment_id = des.id
      WHERE u.id = ?
      `,
      [id],
    );

    const user = rows[0];
    if (!user) return null;

    // Get access control data (regions, zones, cities)
    let accessData = {
      region_ids: [],
      region_names: [],
      zone_ids: [],
      zone_names: [],
      city_ids: [],
      city_names: [],
    };

    try {
      const [acRows] = await pool.execute(
        `SELECT ac.id, ac.subdepartment_id, sd.subDepartment_name
         FROM access_control ac
         LEFT JOIN sub_department sd ON ac.subdepartment_id = sd.id
         WHERE ac.employee_id = ?`,
        [id],
      );

      if (acRows.length > 0) {
        const acId = acRows[0].id;

        // Get regions
        const [regionRows] = await pool.execute(
          `SELECT r.id, r.region_name 
           FROM access_control_regions acr
           JOIN regions r ON acr.region_id = r.id
           WHERE acr.access_control_id = ?`,
          [acId],
        );
        accessData.region_ids = regionRows.map((r) => r.id);
        accessData.region_names = regionRows.map((r) => r.region_name);

        // Get zones
        const [zoneRows] = await pool.execute(
          `SELECT z.id, z.zone_name 
           FROM access_control_zones acz
           JOIN zones z ON acz.zone_id = z.id
           WHERE acz.access_control_id = ?`,
          [acId],
        );
        accessData.zone_ids = zoneRows.map((z) => z.id);
        accessData.zone_names = zoneRows.map((z) => z.zone_name);

        // Get cities
        const [cityRows] = await pool.execute(
          `SELECT c.id, c.city_name 
           FROM access_control_cities acc
           JOIN city c ON acc.city_id = c.id
           WHERE acc.access_control_id = ?`,
          [acId],
        );
        accessData.city_ids = cityRows.map((c) => c.id);
        accessData.city_names = cityRows.map((c) => c.city_name);
      }
    } catch (acError) {
      console.error("Error fetching access control data:", acError);
    }

    return {
      ...user,

      // extra mapped fields (clean naming ke liye)
      role: user.role_name || null,
      department: user.department_name || null,
      subDepartment: user.subDepartment_name || null,

      fullName: [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" "),

      isActive: Boolean(user.is_active),

      // Access control data
      region_ids: accessData.region_ids,
      region_names: accessData.region_names,
      zone_ids: accessData.zone_ids,
      zone_names: accessData.zone_names,
      city_ids: accessData.city_ids,
      city_names: accessData.city_names,
    };
  } catch (error) {
    console.error("findUserById error:", error);
    throw error;
  }
};

export const updatePasswordByUsername = async (username, confirmPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    return await setPasswordHash({ username }, hashedPassword);
  } catch (error) {
    throw error;
  }
};

export const getReportingManagerWithDepartment = async (departmentName) => {
  try {
    const sql = `
      SELECT 
        u.id,
        CONCAT(
          u.firstName, ' ',
          COALESCE(CONCAT(u.middleName, ' '), ''),
          u.lastName
        ) AS full_name,
        u.access_role,
        d.department_name,
        r.role_name
      FROM ${USER_TABLE} u
      LEFT JOIN departments d ON u.${USER_COLUMNS.DEPARTMENT_ID} = d.id
      LEFT JOIN roles r ON u.${USER_COLUMNS.ROLE_ID} = r.id
      LEFT JOIN ${USER_TABLE} m ON u.${USER_COLUMNS.MANAGER_ID} = m.id
      WHERE d.department_name = ?
        AND u.access_role != 'EMPLOYEE'
        AND u.access_role IS NOT NULL
      ORDER BY u.${USER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.execute(sql, [departmentName]);
    return rows;
  } catch (error) {
    console.error("getReportingManagerWithDepartment error:", error);
    throw error;
  }
};

export const getHREmployees = async () => {
  try {
    const sql = `
      SELECT 
        u.id,
        CONCAT(
          u.firstName, ' ',
          COALESCE(CONCAT(u.middleName, ' '), ''),
          u.lastName
        ) AS full_name
      FROM ${USER_TABLE} u
      LEFT JOIN departments d ON u.${USER_COLUMNS.DEPARTMENT_ID} = d.id
      WHERE d.department_name = 'HR'
      ORDER BY u.${USER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error("getHREmployees error:", error);
    throw error;
  }
};

export const getAllEmployeesWithShift = async () => {
  try {
    const sql = `
      SELECT 
        u.id,
        CONCAT(
          u.firstName, ' ',
          COALESCE(CONCAT(u.middleName, ' '), ''),
          u.lastName
        ) AS full_name,
        d.department_name,
        u.shiftTiming
      FROM ${USER_TABLE} u
      LEFT JOIN departments d ON u.${USER_COLUMNS.DEPARTMENT_ID} = d.id
      ORDER BY u.${USER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error("getAllEmployeesWithShift error:", error);
    throw error;
  }
};

export const getEmployeeList = async (branchId = null) => {
  let sql = `
    SELECT
      id,
      TRIM(CONCAT_WS(' ', firstName, NULLIF(lastName, ''))) AS full_name
    FROM uc_staff_profile
    WHERE is_active = 1
  `;

  const params = [];

  if (branchId) {
    sql += ` AND branchOffice_id = ?`;
    params.push(branchId);
  }

  sql += ` ORDER BY firstName ASC, id ASC`;

  const [rows] = await pool.query(sql, params);

  return rows;
};
