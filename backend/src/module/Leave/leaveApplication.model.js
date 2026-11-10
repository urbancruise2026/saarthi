import { pool } from "../../config/mySqlDB.js";
import { buildUpdate } from "./leave.service.js";

const BASE_SELECT = `
  SELECT a.*,
         e.employee_id, e.first_name, e.last_name,
         CONCAT_WS(' ', e.first_name, e.last_name) AS employeeName,
         b.branch_name,
         d.department_name,
         d.department_name AS department,
         lt.leave_code, lt.leave_name, lt.leave_name AS leave_type,
         lt.is_monthly_credit
  FROM leave_applications a
  JOIN uc_staff e ON e.id = a.employee_id
  JOIN leave_types lt ON lt.id = a.leave_type_id
  LEFT JOIN branches b ON b.id = e.branchOffice_id
  LEFT JOIN departments d ON d.id = e.department_id`;

export const getAllApplications = async ({
  employeeId = null,
  status = null,
  leaveTypeId = null,
  branchId = null,
  departmentId = null,
  managerId = null, // NEW: reporting manager ki id
} = {}) => {
  try {
    const where = [];
    const params = [];

    if (employeeId) {
      where.push("a.employee_id = ?");
      params.push(employeeId);
    }
    if (status) {
      where.push("a.status = ?");
      params.push(status);
    }
    if (leaveTypeId) {
      where.push("a.leave_type_id = ?");
      params.push(leaveTypeId);
    }
    if (branchId) {
      where.push("e.branch_id = ?");
      params.push(branchId);
    }
    if (departmentId) {
      where.push("e.department_id = ?");
      params.push(departmentId);
    }
    // NEW: sirf us manager ke under wale employees ki leaves
    if (managerId) {
      where.push("(e.manager_id = ? OR a.employee_id = ?)");
      params.push(managerId, managerId);
    }

    const sql = `${BASE_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY a.id DESC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("getAllApplications error:", error);
    throw error;
  }
};

export const getApplicationById = async (id) => {
  try {
    const [rows] = await pool.execute(`${BASE_SELECT} WHERE a.id = ?`, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("getApplicationById error:", error);
    throw error;
  }
};

export const createApplication = async ({
  employee_id,
  leave_type_id,
  from_date,
  to_date,
  total_days,
  reason = null,
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO leave_applications
        (employee_id, leave_type_id, from_date, to_date, total_days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, leave_type_id, from_date, to_date, total_days, reason],
    );
    return { id: result.insertId, status: "PENDING" };
  } catch (error) {
    console.error("createApplication error:", error);
    throw error;
  }
};

export const updateApplication = async (id, data) => {
  try {
    const { fields, values } = buildUpdate(data, [
      "leave_type_id",
      "from_date",
      "to_date",
      "total_days",
      "reason",
    ]);
    if (!fields.length) return { affectedRows: 0 };
    // Sirf PENDING application edit ho sakti hai
    const [result] = await pool.execute(
      `UPDATE leave_applications SET ${fields.join(", ")} WHERE id = ? AND status = 'PENDING'`,
      [...values, id],
    );
    return result;
  } catch (error) {
    console.error("updateApplication error:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const [result] = await pool.execute(
      "UPDATE leave_applications SET status = ? WHERE id = ?",
      [status, id],
    );
    return result;
  } catch (error) {
    console.error("updateApplicationStatus error:", error);
    throw error;
  }
};

export const deleteApplication = async (id) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM leave_applications WHERE id = ? AND status = 'PENDING'",
      [id],
    );
    return result;
  } catch (error) {
    console.error("deleteApplication error:", error);
    throw error;
  }
};

export const hasOverlappingLeave = async (employee_id, from_date, to_date) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM leave_applications
        WHERE employee_id = ?
          AND status NOT IN ('REJECTED', 'CANCELLED')
          AND from_date <= ? AND to_date >= ?
        LIMIT 1`,
      [employee_id, to_date, from_date],
    );
    return rows.length > 0;
  } catch (error) {
    console.error("hasOverlappingLeave error:", error);
    throw error;
  }
};
// export const updateApplicationStatus = async (
//   id,
//   status,
//   approvedBy = null,
//   rejectionReason = null,
// ) => {
//   const [result] = await pool.execute(
//     "UPDATE leave_applications SET status = ?, approved_by = ?, rejection_reason = ? WHERE id = ?",
//     [status, approvedBy, rejectionReason, id],
//   );
//   return result;
// };
// excludeId: approve karte waqt us leave ko ginti se bahar rakhne ke liye
export const getPendingDays = async (
  employeeId,
  leaveTypeId,
  year,
  excludeId = null,
) => {
  try {
    const params = [employeeId, leaveTypeId, year];
    let excludeSql = "";
    if (excludeId) {
      excludeSql = "AND id <> ?";
      params.push(excludeId);
    }
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(total_days), 0) AS pending
         FROM leave_applications
        WHERE employee_id = ? AND leave_type_id = ?
          AND status = 'PENDING' AND YEAR(from_date) = ? ${excludeSql}`,
      params,
    );
    return Number(rows[0].pending);
  } catch (error) {
    console.error("getPendingDays error:", error);
    throw error;
  }
};
