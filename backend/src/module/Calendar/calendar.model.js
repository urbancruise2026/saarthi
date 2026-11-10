import { pool } from "../../config/mySqlDB.js";

export const getEmployeeCalendar = async ({ employeeId, fromDate, toDate }) => {
  try {
    // Employee + Effective Weekend
    const employeeSql = `
      SELECT
          u.id,
          CONCAT(u.firstName,' ',u.lastName) AS full_name,
          u.branchOffice_id,

          u.weekend AS permanent_weekend,

          tso.week_off AS temporary_weekend,
          tso.from_date,
          tso.to_date,

          CASE
              WHEN tso.id IS NOT NULL
              THEN tso.week_off
              ELSE u.weekend
          END AS effective_weekend

      FROM uc_staff_profile u

      LEFT JOIN employee_shift_override tso
          ON tso.employee_id = u.id
          AND tso.shift_type='Temporary'
          AND tso.is_active=1
          AND tso.from_date <= ?
          AND tso.to_date >= ?

      WHERE u.id = ?
    `;

    const [employee] = await pool.execute(employeeSql, [
      toDate,
      fromDate,
      employeeId,
    ]);

    if (!employee.length) return null;

    const branchOfficeId = employee[0].branchOffice_id;

    // Branch Holidays
    const holidaySql = `
        SELECT
            id,
            holiday_name,
            holiday_date
        FROM office_holiday_calendar
        WHERE branchOffice_id=?
        AND holiday_date BETWEEN ? AND ?
        ORDER BY holiday_date
    `;

    const [holidays] = await pool.execute(holidaySql, [
      branchOfficeId,
      fromDate,
      toDate,
    ]);

    return {
      employee: employee[0],
      holidays,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getHolidaysModel = async ({ branchId, year } = {}) => {
  try {
    let sql = `
      SELECT h.id, h.branch_id, 
             DATE_FORMAT(h.date, '%Y-%m-%d') AS date,
             h.year, h.name, h.is_active,
             b.branch_name
      FROM holidays h
      LEFT JOIN branches b ON b.id = h.branch_id
      WHERE h.is_active = 1
    `;
    const params = [];

    if (branchId) {
      sql += " AND h.branch_id = ?";
      params.push(branchId);
    }

    if (year) {
      sql += " AND h.year = ?";
      params.push(year);
    }

    sql += " ORDER BY h.date ASC";

    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("getHolidays error:", error);
    throw error;
  }
};

// Distinct years already used — optional, dynamic year dropdown ke liye
export const getHolidayYearsModel = async () => {
  try {
    const sql = `SELECT DISTINCT year FROM holidays ORDER BY year DESC`;
    const [rows] = await pool.execute(sql);
    return rows.map((r) => r.year);
  } catch (error) {
    console.error("getHolidayYears error:", error);
    throw error;
  }
};

// Ek specific holiday check karne ke liye (duplicate date guard)
export const findHolidayByBranchAndDate = async ({ branchId, date }) => {
  try {
    const sql = `
      SELECT id FROM holidays
      WHERE branch_id = ? AND date = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [branchId, date]);
    return rows[0] || null;
  } catch (error) {
    console.error("findHolidayByBranchAndDate error:", error);
    throw error;
  }
};

export const createHolidayModel = async ({ branchId, date, name }) => {
  try {
    const year = new Date(date).getFullYear();

    const sql = `
      INSERT INTO holidays (branch_id, date, year, name)
      VALUES (?, ?, ?, ?)
    `;
    const params = [branchId, date, year, name];

    const [result] = await pool.execute(sql, params);
    return { id: result.insertId, branch_id: branchId, date, year, name };
  } catch (error) {
    console.error("createHoliday error:", error);
    throw error;
  }
};

export const updateHoliday = async ({ id, branchId, date, name }) => {
  try {
    const fields = [];
    const params = [];

    if (branchId !== undefined) {
      fields.push("branch_id = ?");
      params.push(branchId);
    }
    if (date !== undefined) {
      fields.push("date = ?", "year = ?");
      params.push(date, new Date(date).getFullYear());
    }
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }

    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    params.push(id);

    const sql = `UPDATE holidays SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error("updateHoliday error:", error);
    throw error;
  }
};

export const deleteHoliday = async (id) => {
  try {
    const sql = `DELETE FROM holidays WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result;
  } catch (error) {
    console.error("deleteHoliday error:", error);
    throw error;
  }
};
