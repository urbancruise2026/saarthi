import pool from "../config/db.js"; // apna pool path yahan set karo
import { buildUpdate } from "./_helpers.js";

export const getAllDesignations = async ({
  onlyActive = false,
  gradeId = null,
} = {}) => {
  try {
    const where = [];
    const params = [];
    if (onlyActive) where.push("d.is_active = 1");
    if (gradeId) {
      where.push("d.grade_id = ?");
      params.push(gradeId);
    }
    const sql = `
      SELECT d.*, g.grade_code, g.grade_name
      FROM designations d
      JOIN grades g ON g.id = d.grade_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY d.grade_id, d.id`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("getAllDesignations error:", error);
    throw error;
  }
};

export const getDesignationById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.*, g.grade_code, g.grade_name
       FROM designations d JOIN grades g ON g.id = d.grade_id
       WHERE d.id = ?`,
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("getDesignationById error:", error);
    throw error;
  }
};

export const createDesignation = async ({
  grade_id,
  designation_name,
  is_active = 1,
}) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO designations (grade_id, designation_name, is_active) VALUES (?, ?, ?)",
      [grade_id, designation_name, is_active],
    );
    return { id: result.insertId, grade_id, designation_name, is_active };
  } catch (error) {
    console.error("createDesignation error:", error);
    throw error;
  }
};

export const updateDesignation = async (id, data) => {
  try {
    const { fields, values } = buildUpdate(data, [
      "grade_id",
      "designation_name",
      "is_active",
    ]);
    if (!fields.length) return { affectedRows: 0 };
    const [result] = await pool.execute(
      `UPDATE designations SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id],
    );
    return result;
  } catch (error) {
    console.error("updateDesignation error:", error);
    throw error;
  }
};

// Soft delete
export const deleteDesignation = async (id) => {
  try {
    const [result] = await pool.execute(
      "UPDATE designations SET is_active = 0 WHERE id = ?",
      [id],
    );
    return result;
  } catch (error) {
    console.error("deleteDesignation error:", error);
    throw error;
  }
};
