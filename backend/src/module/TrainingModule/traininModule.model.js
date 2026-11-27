import { pool } from "../../config/mySqlDB.js";
import { v4 as generateUUID } from "uuid";

export const TRAINING_MODULE_TABLE = "training_modules";

export const TRAINING_MODULE_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  DEPARTMENT: "department",
  SUB_DEPARTMENT: "sub_department",
  CATEGORY: "category", // lead_video | lead_ppt
  MODULE_KEY: "module_key", // joining | veh1 | veh2 | ...
  FILE_TYPE: "file_type",
  FILE_NAME: "file_name",
  VIDEO_URL: "video_url", // video / ppt dono ka URL
  PUBLIC_ID: "public_id",
  DURATION: "duration",
  CREATED_AT: "created_at",
};

// Frontend ko camelCase chahiye (public_id yahan nahi bhejte)
const PUBLIC_FIELDS = `
  id,
  uuid,
  department,
  sub_department AS subDepartment,
  category,
  module_key AS moduleKey,
  file_type AS fileType,
  file_name AS fileName,
  video_url AS fileUrl,
  duration,
  created_at AS createdAt
`;

// ✅ Create Training Module
export const createTrainingModule = async ({
  department,
  subDepartment,
  category,
  moduleKey,
  fileType,
  fileName,
  fileUrl,
  publicId,
  duration,
}) => {
  const sql = `
    INSERT INTO ${TRAINING_MODULE_TABLE}
    (${TRAINING_MODULE_COLUMNS.UUID}, ${TRAINING_MODULE_COLUMNS.DEPARTMENT}, ${TRAINING_MODULE_COLUMNS.SUB_DEPARTMENT},
     ${TRAINING_MODULE_COLUMNS.CATEGORY}, ${TRAINING_MODULE_COLUMNS.MODULE_KEY},
     ${TRAINING_MODULE_COLUMNS.FILE_TYPE}, ${TRAINING_MODULE_COLUMNS.FILE_NAME},
     ${TRAINING_MODULE_COLUMNS.VIDEO_URL}, ${TRAINING_MODULE_COLUMNS.PUBLIC_ID}, ${TRAINING_MODULE_COLUMNS.DURATION})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    generateUUID(),
    department,
    subDepartment,
    category,
    moduleKey,
    fileType,
    fileName,
    fileUrl,
    publicId,
    duration ?? null,
  ]);

  return result.insertId;
};

// ✅ Get by ID (public_id + file_type ke saath - delete ke liye)
export const findTrainingModuleById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TRAINING_MODULE_TABLE} WHERE ${TRAINING_MODULE_COLUMNS.ID} = ?`,
    [id],
  );
  return rows[0] || null;
};

// ✅ Get by ID (response format)
export const getTrainingModuleById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM ${TRAINING_MODULE_TABLE} WHERE ${TRAINING_MODULE_COLUMNS.ID} = ?`,
    [id],
  );
  return rows[0] || null;
};

// ✅ Get All (optional filter: department, subDepartment, category, moduleKey, fileType)
export const getAllTrainingModules = async ({
  department,
  subDepartment,
  category,
  moduleKey,
  fileType,
}) => {
  const conditions = [];
  const params = [];

  if (department) {
    conditions.push(`${TRAINING_MODULE_COLUMNS.DEPARTMENT} = ?`);
    params.push(department);
  }
  if (subDepartment) {
    conditions.push(`${TRAINING_MODULE_COLUMNS.SUB_DEPARTMENT} = ?`);
    params.push(subDepartment);
  }
  if (category) {
    conditions.push(`${TRAINING_MODULE_COLUMNS.CATEGORY} = ?`);
    params.push(category);
  }
  if (moduleKey) {
    conditions.push(`${TRAINING_MODULE_COLUMNS.MODULE_KEY} = ?`);
    params.push(moduleKey);
  }
  if (fileType) {
    conditions.push(`${TRAINING_MODULE_COLUMNS.FILE_TYPE} = ?`);
    params.push(fileType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.execute(
    `
    SELECT ${PUBLIC_FIELDS}
    FROM ${TRAINING_MODULE_TABLE}
    ${where}
    ORDER BY ${TRAINING_MODULE_COLUMNS.CREATED_AT} DESC
    `,
    params,
  );
  return rows;
};

// ✅ Delete
export const deleteTrainingModuleById = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM ${TRAINING_MODULE_TABLE} WHERE ${TRAINING_MODULE_COLUMNS.ID} = ?`,
    [id],
  );
  return result.affectedRows > 0;
};


export const getStartDate = async (department, subDepartment) => {
  const [rows] = await pool.execute(
    `SELECT DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate
     FROM training_start_dates
     WHERE department = ? AND sub_department = ?`,
    [department, subDepartment],
  );
  return rows[0]?.startDate || null;
};

export const saveStartDate = async (department, subDepartment, startDate) => {
  await pool.execute(
    `INSERT INTO training_start_dates (department, sub_department, start_date)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE start_date = VALUES(start_date)`,
    [department, subDepartment, startDate],
  );
};