import { pool } from "../../config/mySqlDB.js";
import { v4 as generateUUID } from "uuid";

const TABLE = "training_reviews";
const EMP_TABLE = "uc_staff_profile";

const PUBLIC_FIELDS = `
  id,
  employee_id AS employeeId,
  department,
  sub_department AS subDepartment,
  day_number AS day,
  module_name AS moduleName,
  understood,
  learned,
  suggestions,
  assistance,
  assistance_details AS assistanceDetails,
  updated_at AS completedAt
`;

// ✅ Save ya update (ek employee + ek din = ek review)
export const upsertTrainingReview = async ({
  employeeId,
  department,
  subDepartment,
  day,
  moduleName,
  understood,
  learned,
  suggestions,
  assistance,
  assistanceDetails,
}) => {
  await pool.execute(
    `
    INSERT INTO ${TABLE}
      (uuid, employee_id, department, sub_department, day_number, module_name,
       understood, learned, suggestions, assistance, assistance_details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      module_name = VALUES(module_name),
      understood = VALUES(understood),
      learned = VALUES(learned),
      suggestions = VALUES(suggestions),
      assistance = VALUES(assistance),
      assistance_details = VALUES(assistance_details)
    `,
    [
      generateUUID(),
      employeeId,
      department,
      subDepartment,
      day,
      moduleName ?? null,
      understood,
      learned,
      suggestions || null,
      assistance,
      assistanceDetails || null,
    ],
  );

  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM ${TABLE}
     WHERE employee_id = ? AND sub_department = ? AND day_number = ?`,
    [employeeId, subDepartment, day],
  );
  return rows[0] || null;
};

// ✅ Sirf current employee ke reviews
export const getReviewsByEmployee = async ({ employeeId, subDepartment }) => {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM ${TABLE}
     WHERE employee_id = ? AND sub_department = ?
     ORDER BY day_number ASC`,
    [employeeId, subDepartment],
  );
  return rows;
};

// ✅ Sabhi employees ke reviews (Track Table ke liye)
export const getAllReviews = async ({
  subDepartment,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const where = [];
  const params = [];

  if (subDepartment) {
    where.push("tr.sub_department = ?");
    params.push(subDepartment);
  }

  if (search) {
    where.push(
      "(CONCAT(e.firstName, ' ', e.lastName) LIKE ? OR tr.module_name LIKE ?)",
    );
    const like = `%${search}%`;
    params.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM ${TABLE} tr
     LEFT JOIN ${EMP_TABLE} e ON e.id = tr.employee_id
     ${whereSql}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT
        tr.id,
        tr.employee_id AS employeeId,
        CONCAT(e.firstName, ' ', e.lastName) AS employeeName,
        tr.department,
        tr.sub_department AS subDepartment,
        tr.day_number AS day,
        tr.module_name AS moduleName,
        tr.understood,
        tr.learned,
        tr.suggestions,
        tr.assistance,
        tr.assistance_details AS assistanceDetails,
        tr.updated_at AS completedAt
     FROM ${TABLE} tr
     LEFT JOIN ${EMP_TABLE} e ON e.id = tr.employee_id
     ${whereSql}
     ORDER BY tr.updated_at DESC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset],
  );

  return { rows, total, page: Number(page) || 1, limit: safeLimit };
};
