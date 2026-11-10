import { pool } from "../../config/mySqlDB.js";

export const getEmployeeCalendar = async ({
  employeeId,
  fromDate,
  toDate,
}) => {
  try {
    const sql = `
      SELECT
        u.id,
        CONCAT(u.firstName,' ',u.lastName) AS full_name,
        u.weekend AS permanent_weekend,

        tso.from_date,
        tso.to_date,
        tso.week_off AS temporary_weekend,

        CASE
          WHEN tso.id IS NOT NULL
          THEN tso.week_off
          ELSE u.weekend
        END AS effective_weekend

      FROM uc_staff_profile u

      LEFT JOIN employee_shift_override tso
      ON tso.employee_id = u.id
      AND tso.shift_type = 'Temporary'
      AND tso.is_active = 1
      AND tso.from_date <= ?
      AND tso.to_date >= ?

      WHERE u.id = ?
    `;

    const [rows] = await pool.execute(sql, [
      toDate,
      fromDate,
      employeeId,
    ]);

    return rows[0] || null;
  } catch (error) {
    console.error("getEmployeeCalendar error:", error);
    throw error;
  }
};