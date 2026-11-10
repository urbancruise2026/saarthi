import { pool } from "../../config/mySqlDB.js"; // apna pool path yahan set karo
import { buildUpdate } from "./leave.service.js";

const BASE_SELECT = `
  SELECT p.*, g.grade_code, lt.leave_code, lt.leave_name
  FROM grade_leave_policies p
  JOIN grades g ON g.id = p.grade_id
  JOIN leave_types lt ON lt.id = p.leave_type_id`;

export const getAllPolicies = async ({
  gradeId = null,
  leaveTypeId = null,
} = {}) => {
  try {
    const where = [];
    const params = [];
    if (gradeId) {
      where.push("p.grade_id = ?");
      params.push(gradeId);
    }
    if (leaveTypeId) {
      where.push("p.leave_type_id = ?");
      params.push(leaveTypeId);
    }
    const sql = `${BASE_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.grade_id, p.leave_type_id, p.effective_from`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("getAllPolicies error:", error);
    throw error;
  }
};

export const getPolicyById = async (id) => {
  try {
    const [rows] = await pool.execute(`${BASE_SELECT} WHERE p.id = ?`, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("getPolicyById error:", error);
    throw error;
  }
};

// Kisi grade ki given date par chal rahi saari policies (L1 -> PL 30, EL ...)
export const getActivePoliciesByGrade = async (
  gradeId,
  onDate = new Date().toISOString().slice(0, 10),
) => {
  try {
    const [rows] = await pool.execute(
      `${BASE_SELECT}
       WHERE p.grade_id = ?
         AND ? BETWEEN p.effective_from AND COALESCE(p.effective_to, '9999-12-31')`,
      [gradeId, onDate],
    );
    return rows;
  } catch (error) {
    console.error("getActivePoliciesByGrade error:", error);
    throw error;
  }
};

export const createPolicy = async ({
  grade_id,
  leave_type_id,
  yearly_days,
  effective_from,
  effective_to = null,
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO grade_leave_policies
        (grade_id, leave_type_id, yearly_days, effective_from, effective_to)
       VALUES (?, ?, ?, ?, ?)`,
      [grade_id, leave_type_id, yearly_days, effective_from, effective_to],
    );
    return {
      id: result.insertId,
      grade_id,
      leave_type_id,
      yearly_days,
      effective_from,
      effective_to,
    };
  } catch (error) {
    console.error("createPolicy error:", error);
    throw error;
  }
};

export const updatePolicy = async (id, data) => {
  try {
    const { fields, values } = buildUpdate(data, [
      "grade_id",
      "leave_type_id",
      "yearly_days",
      "effective_from",
      "effective_to",
    ]);
    if (!fields.length) return { affectedRows: 0 };
    const [result] = await pool.execute(
      `UPDATE grade_leave_policies SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id],
    );
    return result;
  } catch (error) {
    console.error("updatePolicy error:", error);
    throw error;
  }
};

export const deletePolicy = async (id) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM grade_leave_policies WHERE id = ?",
      [id],
    );
    return result;
  } catch (error) {
    console.error("deletePolicy error:", error);
    throw error;
  }
};
