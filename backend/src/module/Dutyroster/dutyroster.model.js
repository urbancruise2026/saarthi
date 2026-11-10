import { pool } from "../../config/mySqlDB.js";

export const getDutyRosterList = async ({ isActive, employeeId } = {}) => {
  try {
    const conditions = [];
    const params = [];

    if (isActive !== undefined && isActive !== null && isActive !== "") {
      conditions.push("dr.is_active = ?");
      params.push(isActive);
    }

    if (employeeId) {
      conditions.push("dr.employee_id = ?");
      params.push(employeeId);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const sql = `
      SELECT
        dr.id,
        dr.branch_id,
        dr.employee_id,
        dr.duty_date,
        dr.status,
        dr.is_active,
        u.firstName,
        u.lastName,
        CONCAT(
          COALESCE(u.firstName, ''),
          CASE WHEN u.lastName IS NOT NULL AND u.lastName != ''
               THEN CONCAT(' ', u.lastName)
               ELSE ''
          END
        ) AS full_name,
        u.department_id,
        dept.department_name AS department_name,
        b.branch_name AS branch_name
      FROM duty_roster dr
      LEFT JOIN uc_staff_profile u ON u.id = dr.employee_id
      LEFT JOIN departments dept ON dept.id = u.department_id
      LEFT JOIN branches b ON b.id = dr.branch_id
      ${whereClause}
      ORDER BY dr.duty_date DESC, dr.id DESC
    `;

    const [rows] = await pool.execute(sql, params);

    return rows;
  } catch (error) {
    console.error("getDutyRosterList error:", error);
    throw error;
  }
};

// Add this alongside your existing createDutyRoster function in the same file.
// Add this alongside your existing createDutyRoster function in the same file.

export const createDutyRosterBulk = async (entries) => {
  // entries = [{ branchId, employeeId, dutyDate, status, isActive }, ...]
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("entries must be a non-empty array");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const insertedIds = [];

    const sql = `
      INSERT INTO duty_roster
      (
        branch_id,
        employee_id,
        duty_date,
        status,
        is_active
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const entry of entries) {
      const { branchId, employeeId, dutyDate, status, isActive = 1 } = entry;

      const [result] = await connection.execute(sql, [
        branchId,
        employeeId,
        dutyDate,
        status,
        isActive,
      ]);

      insertedIds.push(result.insertId);
    }

    await connection.commit();

    // Fetch all newly created rows in one query (individual rows, not JSON)
    const placeholders = insertedIds.map(() => "?").join(",");
    const [rows] = await pool.execute(
      `
      SELECT
        dr.id,
        dr.branch_id,
        b.branch_name,
        dr.employee_id,
        u.firstName,
        u.lastName,
        dr.duty_date,
        dr.status,
        dr.is_active,
        dr.created_at,
        dr.updated_at
      FROM duty_roster dr
      LEFT JOIN uc_staff_profile u
        ON u.id = dr.employee_id
      LEFT JOIN branches b
        ON b.id = dr.branch_id
      WHERE dr.id IN (${placeholders})
      ORDER BY dr.id ASC
      `,
      insertedIds,
    );

    return rows;
  } catch (error) {
    await connection.rollback();
    console.error("createDutyRosterBulk error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export const updateDutyRoster = async ({
  id,
  employeeId,
  dutyDate,
  dutyType,
  dutyTiming = null,
  location = null,
  remarks = null,
  isActive = 1,
}) => {
  try {
    const sql = `
      UPDATE duty_roster
      SET
        employee_id = ?,
        duty_date = ?,
        duty_type = ?,
        duty_timing = ?,
        location = ?,
        remarks = ?,
        is_active = ?
      WHERE id = ?
    `;

    await pool.execute(sql, [
      employeeId,
      dutyDate,
      dutyType,
      dutyTiming,
      location,
      remarks,
      isActive,
      id,
    ]);

    const [rows] = await pool.execute(
      `
      SELECT
        dr.id,
        dr.employee_id,
        u.full_name,
        dr.duty_date,
        dr.duty_type,
        dr.duty_timing,
        dr.location,
        dr.remarks,
        dr.is_active
      FROM duty_roster dr
      LEFT JOIN uc_staff_profile u ON u.id = dr.employee_id
      WHERE dr.id = ?
      `,
      [id],
    );

    return rows[0];
  } catch (error) {
    console.error("updateDutyRoster error:", error);
    throw error;
  }
};

export const deactivateDutyRoster = async (id) => {
  try {
    const sql = `
      UPDATE duty_roster
      SET is_active = 0
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [id]);

    return result;
  } catch (error) {
    console.error("deactivateDutyRoster error:", error);
    throw error;
  }
};

export const getEmployeeListDutyroster = async (
  branchId = null,
  departmentId = null,
) => {
  let sql = `
  SELECT
    id,
    firstName,
    lastName
  FROM uc_staff_profile
  WHERE is_active = 1
`;
  const params = [];

  // Branch filter
  if (branchId) {
    sql += ` AND branchOffice_id = ?`;
    params.push(branchId);
  }

  // Department filter
  if (departmentId) {
    sql += ` AND department_id = ?`;
    params.push(departmentId);
  }

  sql += ` ORDER BY firstName ASC`;

  const [rows] = await pool.query(sql, params);

  return rows;
};
