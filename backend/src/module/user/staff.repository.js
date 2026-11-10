// Staff data access for the normalized schema.
//
// The rest of the app still speaks the old `users` field names (firstName, employeeId,
// education, ...). Reads go through the `uc_staff_profile` view, which returns exactly
// those names. Writes come through here and are routed to the right normalized table.

import crypto from "crypto";
import bcrypt from "bcrypt";
import { pool } from "../../config/mySqlDB.js";

export const STAFF_VIEW = "uc_staff_profile";

// ─── Field routing: old field name -> [table, column] ─────────────────────────
const ONE_TO_ONE = {
  uc_staff: {
    employeeId: "employee_id",
    tempId: "temp_id",
    emp_code: "emp_code",
    firstName: "first_name",
    middleName: "middle_name",
    lastName: "last_name",
    aliasName: "alias_name",
    shortName: "short_name",
    dateOfBirth: "date_of_birth",
    gender: "gender",
    maritalStatus: "marital_status",
    bloodGroup: "blood_group",
    role_id: "role_id",
    department_id: "department_id",
    subDepartment_id: "sub_department_id",
    manager_id: "manager_id",
    ho_id: "ho_id",
    is_active: "is_active",
    status: "onboarding_status",
  },
  uc_staff_contacts: {
    personalEmail: "personal_email",
    mobile: "mobile",
    alternateNumber: "alternate_number",
    officeEmail: "office_email",
    officeNumber: "office_number",
    localName: "local_contact_name",
    localRelation: "local_contact_relation",
  },
  uc_staff_statutory: {
    pfNumber: "pf_number",
    esicNumber: "esic_number",
    uanNumber: "uan_number",
  },
  uc_staff_bank_accounts: {
    bankName: "bank_name",
    accountHolderName: "account_holder_name",
    accountNumber: "account_number",
    ifscCode: "ifsc_code",
    branch: "branch",
    accountType: "account_type",
    upiId: "upi_id",
  },
  uc_staff_employment: {
    branchOffice_id: "branch_id",
    companyName: "company_name",
    workLocation: "work_location",
    zoneName: "zone_name",
    grade: "grade",
    designation: "designation",
    employmentType: "employment_type",
    employeeType: "employee_type",
    employeeStatus: "employee_status",
    joiningDate: "joining_date",
    confirmationDate: "confirmation_date",
    probationTenure: "probation_tenure",
    noticePeriod: "notice_period",
    hrManager: "hr_manager",
    workShift: "work_shift",
    shiftTiming: "shift_timing",
    weeklyoff: "weekly_off",
  },
  uc_staff_compensation: {
    ctc: "ctc",
    basicSalary: "basic_salary",
  },
  uc_staff_declarations: {
    hrPolicyAccepted: "hr_policy_accepted",
    commitmentDeclarationAccepted: "commitment_declaration_accepted",
    informationDeclarationAccepted: "information_declaration_accepted",
    formLink: "form_link",
  },
  auth_credentials: {
    username: "username",
    password: "password_hash",
    access_role: "access_role",
    is_online: "is_online",
  },
};

// Columns that are typed in the new schema; '' cannot be stored there, so it becomes NULL.
const NULL_IF_BLANK = new Set([
  "date_of_birth", "joining_date", "confirmation_date", "branch_id",
  "role_id", "department_id", "sub_department_id", "manager_id", "ho_id", "is_active",
]);

const ADDRESS_FIELDS = {
  current: { currentAddress: "address", currentCity: "city", currentState: "state", currentPincode: "pincode" },
  permanent: { permanentAddress: "address", permanentCity: "city", permanentState: "state", permanentPincode: "pincode" },
};

const FAMILY_TYPES = ["father", "mother", "spouse", "sibling"];
// The old table defaulted these two relations; keep that when a new row is created.
const FAMILY_DEFAULT_RELATION = { father: "Father", mother: "Mother" };

const DOCUMENT_FIELDS = {
  aadhaarUploaded: "aadhaar",
  panUploaded: "pan",
  resumeUploaded: "resume",
  twelthCertificateUploaded: "twelfth_certificate",
  graduationCertificateUploaded: "graduation_certificate",
  passportPhotoUploaded: "passport_photo",
  qrCodeUploaded: "qr_code",
  signatureUploaded: "signature",
  currentAddressProofUploaded: "current_address_proof",
  permanentAddressProofUploaded: "permanent_address_proof",
};

const EDUCATION_KEYS = {
  qualificationTypes: "qualification_type", qualification: "qualification", schoolName: "school_name",
  institute: "institute", university: "university", board: "board", location: "location", city: "city",
  yearOfPassing: "year_of_passing", cgpa: "cgpa", pursuing: "pursuing", pursuingCourse: "pursuing_course",
  currentYear: "current_year", currentStatus: "current_status", educationLeft: "education_left",
  vocationalCourse: "vocational_course",
};

const EXPERIENCE_KEYS = {
  previousCompany: "previous_company", jobTitle: "job_title", duration: "duration",
  joiningDate: "joining_date", relievingDate: "relieving_date", lastSalary: "last_salary",
  reasonforLeaving: "reason_for_leaving", referenceName: "reference_name", referenceRoll: "reference_role",
  referenceContact: "reference_contact", offerLetterUploaded: "offer_letter_url",
  experienceLetterUploaded: "experience_letter_url", salarySlipUploaded: "salary_slip_url",
  bankStatementUploaded: "bank_statement_url",
};

// Present in old payloads but not stored (system fields, derived, or never real columns).
const IGNORED_FIELDS = new Set([
  "id", "uuid", "created_at", "updated_at", "refreshToken",
  "offerLetterUploaded", "experienceLetterUploaded", "salarySlipUploaded", "bankStatementUploaded",
  "formLinkActive",
]);

const KNOWN_FIELDS = new Set([
  ...Object.values(ONE_TO_ONE).flatMap((m) => Object.keys(m)),
  ...Object.values(ADDRESS_FIELDS).flatMap((m) => Object.keys(m)),
  ...FAMILY_TYPES.flatMap((t) => ["Name", "Relation", "Contact", "Occupation"].map((f) => t + f)),
  ...Object.keys(DOCUMENT_FIELDS),
  "education",
  "experience",
]);

const badRequest = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const has = (data, key) => Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined;

const toDbValue = (column, value) => {
  if (value === "" && NULL_IF_BLANK.has(column)) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return value;
};

// ─── Low-level writers (all take an open connection) ──────────────────────────

const rowExists = async (conn, table, where, params) => {
  const [rows] = await conn.query(`SELECT 1 FROM \`${table}\` WHERE ${where} LIMIT 1`, params);
  return rows.length > 0;
};

// Insert or update one row keyed by staff_id (+ extra key columns). A missing row is
// only created when at least one value is non-null, so empty rows are never added.
const upsertRow = async (conn, table, keyCols, cols) => {
  const keyNames = Object.keys(keyCols);
  const names = Object.keys(cols);
  if (!names.length) return;
  const where = keyNames.map((k) => `\`${k}\` = ?`).join(" AND ");
  const keyVals = Object.values(keyCols);

  if (await rowExists(conn, table, where, keyVals)) {
    await conn.query(
      `UPDATE \`${table}\` SET ${names.map((n) => `\`${n}\` = ?`).join(", ")} WHERE ${where}`,
      [...Object.values(cols), ...keyVals],
    );
    return;
  }
  if (Object.values(cols).every((v) => v === null)) return;
  const all = { ...keyCols, ...cols };
  await conn.query(
    `INSERT INTO \`${table}\` (${Object.keys(all).map((n) => `\`${n}\``).join(", ")})
     VALUES (${Object.keys(all).map(() => "?").join(", ")})`,
    Object.values(all),
  );
};

const parseList = (value, field) => {
  if (value === null || value === "") return [];
  let list = value;
  if (typeof value === "string") {
    try {
      list = JSON.parse(value);
    } catch {
      throw badRequest(`${field} must be valid JSON`);
    }
  }
  if (list === null) return [];
  if (!Array.isArray(list)) throw badRequest(`${field} must be an array`);
  return list;
};

const replaceList = async (conn, staffId, table, keyMap, value, field) => {
  const items = parseList(value, field);
  const rows = items.map((item, i) => {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw badRequest(`${field}[${i}] must be an object`);
    }
    const unknown = Object.keys(item).filter((k) => !(k in keyMap));
    if (unknown.length) {
      // Refuse rather than silently dropping data the schema has no column for.
      throw badRequest(`${field}[${i}] has unsupported field(s): ${unknown.join(", ")}`);
    }
    const row = { staff_id: staffId, sort_order: i + 1 };
    for (const [k, col] of Object.entries(keyMap)) {
      const v = item[k];
      row[col] = v === undefined || v === null ? null : typeof v === "object" ? JSON.stringify(v) : String(v);
    }
    return row;
  });

  await conn.query(`DELETE FROM \`${table}\` WHERE staff_id = ?`, [staffId]);
  for (const row of rows) {
    await conn.query(
      `INSERT INTO \`${table}\` (${Object.keys(row).map((n) => `\`${n}\``).join(", ")})
       VALUES (${Object.keys(row).map(() => "?").join(", ")})`,
      Object.values(row),
    );
  }
};

// Applies a payload that uses the old `users` field names to the normalized tables.
const applyStaffFields = async (conn, staffId, data, { isNew = false } = {}) => {
  const unknown = Object.keys(data).filter(
    (k) => data[k] !== undefined && !KNOWN_FIELDS.has(k) && !IGNORED_FIELDS.has(k),
  );
  if (unknown.length) {
    console.warn(`[staff] ignoring unknown field(s) for staff ${staffId}: ${unknown.join(", ")}`);
  }

  // 1:1 tables
  for (const [table, map] of Object.entries(ONE_TO_ONE)) {
    const cols = {};
    for (const [field, col] of Object.entries(map)) {
      if (has(data, field)) cols[col] = toDbValue(col, data[field]);
    }
    if (table === "auth_credentials" && "password_hash" in cols) {
      // Same as before: a non-empty password is bcrypt-hashed. One fix: the edit form loads the
      // stored hash and sends it back on save; that hash is kept instead of being hashed again
      // (which used to lock the person out).
      const pw = cols.password_hash;
      const [currentRows] = await conn.query(
        "SELECT password_hash FROM auth_credentials WHERE staff_id = ?", [staffId],
      );
      if (currentRows.length && pw === currentRows[0].password_hash) {
        delete cols.password_hash;
      } else if (pw) {
        cols.password_hash = await bcrypt.hash(String(pw), 10);
      }
    }
    if (table === "uc_staff") {
      if (!Object.keys(cols).length) continue;
      await conn.query(
        `UPDATE uc_staff SET ${Object.keys(cols).map((c) => `\`${c}\` = ?`).join(", ")} WHERE id = ?`,
        [...Object.values(cols), staffId],
      );
    } else {
      await upsertRow(conn, table, { staff_id: staffId }, cols);
    }
  }

  // Addresses
  for (const [type, map] of Object.entries(ADDRESS_FIELDS)) {
    const cols = {};
    for (const [field, col] of Object.entries(map)) if (has(data, field)) cols[col] = data[field];
    await upsertRow(conn, "uc_staff_addresses", { staff_id: staffId, address_type: type }, cols);
  }

  // Family members
  for (const type of FAMILY_TYPES) {
    const cols = {};
    for (const f of ["Name", "Relation", "Contact", "Occupation"]) {
      if (has(data, type + f)) cols[f.toLowerCase()] = data[type + f];
    }
    if (!Object.keys(cols).length) continue;
    const exists = await rowExists(conn, "uc_staff_family_members",
      "staff_id = ? AND member_type = ?", [staffId, type]);
    if (!exists && !("relation" in cols) && FAMILY_DEFAULT_RELATION[type]) {
      cols.relation = FAMILY_DEFAULT_RELATION[type];
    }
    if (!exists && Object.entries(cols).every(([k, v]) =>
      v === null || (k === "relation" && v === FAMILY_DEFAULT_RELATION[type]))) {
      continue; // nothing beyond the default relation: same as the old empty columns
    }
    await upsertRow(conn, "uc_staff_family_members", { staff_id: staffId, member_type: type }, cols);
  }

  // Documents: one row per document type; null removes it
  for (const [field, docType] of Object.entries(DOCUMENT_FIELDS)) {
    if (!has(data, field)) continue;
    if (data[field] === null) {
      await conn.query("DELETE FROM uc_staff_documents WHERE staff_id = ? AND doc_type = ?", [staffId, docType]);
    } else {
      await upsertRow(conn, "uc_staff_documents", { staff_id: staffId, doc_type: docType },
        { file_url: String(data[field]) });
    }
  }

  // Education / experience lists
  if (has(data, "education")) {
    await replaceList(conn, staffId, "uc_staff_education", EDUCATION_KEYS, data.education, "education");
  }
  if (has(data, "experience")) {
    await replaceList(conn, staffId, "uc_staff_experience", EXPERIENCE_KEYS, data.experience, "experience");
  }

  if (!isNew) {
    await conn.query("UPDATE uc_staff SET updated_at = NOW() WHERE id = ?", [staffId]);
  }
};

const withTransaction = async (fn) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const createStaff = async (uuid, data) =>
  withTransaction(async (conn) => {
    const [result] = await conn.query(
      "INSERT INTO uc_staff (uuid, created_at, updated_at) VALUES (?, NOW(), NOW())",
      [uuid],
    );
    await applyStaffFields(conn, result.insertId, data, { isNew: true });
    return result.insertId;
  });

// Returns { affectedRows } like the old UPDATE users statement did.
export const updateStaff = async (staffId, data) =>
  withTransaction(async (conn) => {
    const [rows] = await conn.query("SELECT id FROM uc_staff WHERE id = ? FOR UPDATE", [staffId]);
    if (!rows.length) return { affectedRows: 0, changedRows: 0 };
    await applyStaffFields(conn, Number(staffId), data);
    return { affectedRows: 1, changedRows: 1 };
  });

export const setPasswordHash = async ({ staffId, username }, passwordHash) => {
  if (staffId != null) {
    const [r] = await pool.query(
      `INSERT INTO auth_credentials (staff_id, password_hash, password_changed_at)
       VALUES (?, ?, UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password_changed_at = UTC_TIMESTAMP()`,
      [staffId, passwordHash],
    );
    return { affectedRows: r.affectedRows ? 1 : 0 };
  }
  const [r] = await pool.query(
    "UPDATE auth_credentials SET password_hash = ?, password_changed_at = UTC_TIMESTAMP() WHERE username = ?",
    [passwordHash, username],
  );
  return { affectedRows: r.affectedRows };
};

// ─── Sessions & login audit (all auth timestamps are UTC) ─────────────────────

export const hashToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

export const clientInfo = (req) => ({
  ip: (req?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || req?.ip || null,
  userAgent: (req?.headers?.["user-agent"] || "").slice(0, 512) || null,
});

const jwtExpiry = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(String(token).split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

export const createSession = async (staffId, refreshToken, { ip = null, userAgent = null } = {}) => {
  const exp = jwtExpiry(refreshToken);
  const [r] = await pool.query(
    // Two logins by the same person in the same second produce the same JWT; in that case
    // the existing session row is reused (and re-opened) instead of failing on the unique hash.
    `INSERT INTO auth_sessions (staff_id, refresh_token_hash, ip_address, user_agent, created_at, last_used_at, expires_at)
     VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(),
             IF(? IS NULL, NULL, DATE_ADD('1970-01-01 00:00:00', INTERVAL ? SECOND)))
     ON DUPLICATE KEY UPDATE
       id = LAST_INSERT_ID(id), revoked_at = NULL, revoked_reason = NULL,
       ip_address = VALUES(ip_address), user_agent = VALUES(user_agent), last_used_at = UTC_TIMESTAMP()`,
    [staffId, hashToken(refreshToken), ip, userAgent, exp, exp],
  );
  await pool.query("UPDATE auth_credentials SET last_login_at = UTC_TIMESTAMP() WHERE staff_id = ?", [staffId]);
  return r.insertId;
};

export const findActiveSessionByToken = async (refreshToken) => {
  const [rows] = await pool.query(
    `SELECT * FROM auth_sessions
     WHERE refresh_token_hash = ? AND revoked_at IS NULL
       AND (expires_at IS NULL OR expires_at > UTC_TIMESTAMP())
     LIMIT 1`,
    [hashToken(refreshToken)],
  );
  return rows[0] || null;
};

export const touchSession = async (refreshToken) => {
  const [r] = await pool.query(
    "UPDATE auth_sessions SET last_used_at = UTC_TIMESTAMP() WHERE refresh_token_hash = ? AND revoked_at IS NULL",
    [hashToken(refreshToken)],
  );
  return r.affectedRows > 0;
};

// Revokes the session for this token, or every open session of the staff member when no token is given.
export const revokeSessions = async (staffId, refreshToken = null, reason = "logout") => {
  const params = [reason, staffId];
  let sql = `UPDATE auth_sessions SET revoked_at = UTC_TIMESTAMP(), revoked_reason = ?
             WHERE staff_id = ? AND revoked_at IS NULL`;
  if (refreshToken) {
    sql += " AND refresh_token_hash = ?";
    params.push(hashToken(refreshToken));
  }
  const [r] = await pool.query(sql, params);
  return r.affectedRows;
};

// Never lets an audit-log failure break a login or logout.
export const logLoginEvent = async ({
  staffId = null, sessionId = null, username = null, eventType, failureReason = null, ip = null, userAgent = null,
}) => {
  try {
    await pool.query(
      `INSERT INTO login_events (staff_id, session_id, username_attempted, event_type, failure_reason, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [staffId, sessionId, username, eventType, failureReason, ip, userAgent],
    );
  } catch (err) {
    console.error("[auth] login_events write failed:", err.message);
  }
};
