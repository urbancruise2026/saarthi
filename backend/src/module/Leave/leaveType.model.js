import { pool } from "../../config/mySqlDB.js"; // apna pool path yahan set karo
import { buildUpdate } from "./leave.service.js";

export const getAllLeaveTypes = async ({ onlyActive = false } = {}) => {
  try {
    const sql = `SELECT * FROM leave_types ${onlyActive ? "WHERE is_active = 1" : ""} ORDER BY id`;
    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error("getAllLeaveTypes error:", error);
    throw error;
  }
};

export const getLeaveTypeById = async (id) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM leave_types WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("getLeaveTypeById error:", error);
    throw error;
  }
};

// leaveType code ("CO", "PL") ya naam ("Comp Off") dono se match karega
export const getLeaveType = async (value) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, leave_code, leave_name, is_monthly_credit, is_carry_forward
         FROM leave_types
        WHERE (leave_code = ? OR leave_name = ?) AND is_active = 1
        LIMIT 1`,
      [value, value],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getLeaveType error:", error);
    throw error;
  }
};
// Same employee ki overlapping leave check

export const createLeaveType = async ({
  leave_code,
  leave_name = null,
  is_monthly_credit = 0,
  is_carry_forward = 0,
  max_carry_forward = null,
  is_active = 1,
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO leave_types
        (leave_code, leave_name, is_monthly_credit, is_carry_forward, max_carry_forward, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        leave_code,
        leave_name,
        is_monthly_credit,
        is_carry_forward,
        max_carry_forward,
        is_active,
      ],
    );
    return { id: result.insertId, leave_code, leave_name };
  } catch (error) {
    console.error("createLeaveType error:", error);
    throw error;
  }
};

export const updateLeaveType = async (id, data) => {
  try {
    const { fields, values } = buildUpdate(data, [
      "leave_code",
      "leave_name",
      "is_monthly_credit",
      "is_carry_forward",
      "max_carry_forward",
      "is_active",
    ]);
    if (!fields.length) return { affectedRows: 0 };
    const [result] = await pool.execute(
      `UPDATE leave_types SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id],
    );
    return result;
  } catch (error) {
    console.error("updateLeaveType error:", error);
    throw error;
  }
};

// Soft delete
export const deleteLeaveType = async (id) => {
  try {
    const [result] = await pool.execute(
      "UPDATE leave_types SET is_active = 0 WHERE id = ?",
      [id],
    );
    return result;
  } catch (error) {
    console.error("deleteLeaveType error:", error);
    throw error;
  }
};
