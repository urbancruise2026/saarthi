import { pool } from "../../config/mySqlDB.js";

import { randomUUID } from "crypto";

export const createCompOffIfEligible = async (
  employeeId,
  attendanceDate,
  workedMinutes,
) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      COALESCE(eso.week_off, u.weeklyOff) AS week_off,
      h.id AS holiday_id
    FROM uc_staff_profile u

    LEFT JOIN employee_shift_override eso
      ON eso.employee_id = u.id
      AND eso.is_active = 1
      AND ? BETWEEN eso.from_date AND eso.to_date

    LEFT JOIN holidays h
      ON h.date = ?
      AND h.is_active = 1
      AND h.branch_id = u.branchOffice_id

    WHERE u.id = ?
    `,
    [attendanceDate, attendanceDate, employeeId],
  );

  if (!rows.length) return;

  const dayName = new Date(`${attendanceDate}T00:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "long" },
  );

  const isWeekOff = rows[0].week_off === dayName;
  const isHoliday = !!rows[0].holiday_id;

  // Neither holiday nor weekly off -> not eligible
  if (!isWeekOff && !isHoliday) return;

  // Holiday/Week-off hai, lekin 7:45 (465 min) se kam kaam kiya -> not eligible
  const REQUIRED_MINUTES = 465; // 7:45 hrs
  if (workedMinutes < REQUIRED_MINUTES) return;

  const remarks = isHoliday ? "Worked on Holiday" : "Worked on Weekly Off";

  const uuid = randomUUID();

  await pool.execute(
    `
    INSERT INTO comp_offs
    (uuid, employee_id, earned_date, days, status, remarks)
    VALUES (?, ?, ?, 1, 'Available', ?)
    ON DUPLICATE KEY UPDATE
      remarks = VALUES(remarks)
    `,
    [uuid, employeeId, attendanceDate, remarks],
  );
};

export const getCompOffs = async (filters = {}) => {
  const {
    employeeId,
    managerId,
    branchId,
    departmentId,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = filters;

  const conditions = [];
  const values = [];

  if (managerId) {
    conditions.push("(u.manager_id = ? OR c.employee_id = ?)");
    values.push(managerId, managerId);
  }

  if (employeeId) {
    conditions.push("c.employee_id = ?");
    values.push(employeeId);
  }

  if (branchId) {
    conditions.push("u.branchOffice_id = ?");
    values.push(branchId);
  }

  if (departmentId) {
    conditions.push("u.department_id = ?");
    values.push(departmentId);
  }

  if (status) {
    conditions.push("c.status = ?");
    values.push(status);
  }

  if (startDate && endDate) {
    conditions.push("c.earned_date BETWEEN ? AND ?");
    values.push(startDate, endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Total count for pagination (same WHERE, no LIMIT)
  const [countRows] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM comp_offs c
    JOIN uc_staff_profile u
      ON u.id = c.employee_id
    ${whereClause}
    `,
    values,
  );
  const total = countRows[0]?.total ?? 0;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const offset = (pageNum - 1) * limitNum;

  // MySQL 8 rejects LIMIT/OFFSET bound as prepared-statement parameters (MariaDB allowed it),
  // so this paginated query uses pool.query, which sends the numbers inline.
  const [rows] = await pool.query(
    `
    SELECT
      c.*,
      DATE_FORMAT(c.earned_date, '%Y-%m-%d') AS earned_date,
     CONCAT_WS(' ', u.firstName, NULLIF(u.lastName, '')) AS employee_name,
      u.branchOffice_id AS branch_id,
      b.branch_name AS branch_name,
      u.department_id AS department_id,
      d.department_name AS department_name
    FROM comp_offs c
    JOIN uc_staff_profile u
      ON u.id = c.employee_id
    LEFT JOIN branches b
      ON b.id = u.branchOffice_id
    LEFT JOIN departments d
      ON d.id = u.department_id
    ${whereClause}
    ORDER BY c.earned_date DESC
    LIMIT ? OFFSET ?
    `,
    [...values, limitNum, offset],
  );

  const totalPages = Math.max(1, Math.ceil(total / limitNum));

  return {
    rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasPrevPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
    },
  };
};

// model
export const getCompOffBalance = async (employeeId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN status = 'Available'
            THEN days
            ELSE 0
          END
        ),
      0) AS balance
    FROM comp_offs
    WHERE employee_id = ?
    `,
    [employeeId],
  );

  return rows[0];
};

export const useCompOffBalance = async (employeeId, totalDays, leaveId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [availableCompOffs] = await connection.execute(
      `
      SELECT id, days
      FROM comp_offs
      WHERE employee_id = ? AND status = 'Available'
      ORDER BY earned_date ASC
      FOR UPDATE
      `,
      [employeeId],
    );

    let remainingDays = Number(totalDays);

    for (const compOff of availableCompOffs) {
      if (remainingDays <= 0) break;

      if (Number(compOff.days) <= remainingDays) {
        // Poora record consume ho gaya
        await connection.execute(
          `UPDATE comp_offs SET status = 'Used', leave_id = ? WHERE id = ?`,
          [leaveId, compOff.id],
        );
        remainingDays -= Number(compOff.days);
      } else {
        // Partial consume — split karna padega
        const usedDays = remainingDays;
        const leftoverDays = Number(compOff.days) - usedDays;

        await connection.execute(
          `UPDATE comp_offs SET status = 'Used', days = ?, leave_id = ? WHERE id = ?`,
          [usedDays, leaveId, compOff.id],
        );

        await connection.execute(
          `
          INSERT INTO comp_offs (employee_id, attendance_id, earned_date, days, status, remarks)
          VALUES (?, NULL, ?, ?, 'Available', 'Split remainder')
          `,
          [employeeId, compOff.earned_date, leftoverDays],
        );

        remainingDays = 0;
      }
    }

    if (remainingDays > 0) {
      throw new Error("Insufficient comp-off balance to complete deduction");
    }

    await connection.commit();
    return { success: true, deductedDays: totalDays };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
