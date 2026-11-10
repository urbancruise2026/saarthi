import pool from "../config/db.js"; // apna pool path yahan set karo
import { buildUpdate } from "./_helpers.js";

export const getAllGrades = async ({ onlyActive = false } = {}) => {
  try {
    const sql = `SELECT * FROM grades ${onlyActive ? "WHERE is_active = 1" : ""} ORDER BY id`;
    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error("getAllGrades error:", error);
    throw error;
  }
};

export const getGradeById = async (id) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM grades WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  } catch (error) {
    console.error("getGradeById error:", error);
    throw error;
  }
};

export const createGrade = async ({
  grade_code,
  grade_name = null,
  is_active = 1,
}) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO grades (grade_code, grade_name, is_active) VALUES (?, ?, ?)",
      [grade_code, grade_name, is_active],
    );
    return { id: result.insertId, grade_code, grade_name, is_active };
  } catch (error) {
    console.error("createGrade error:", error);
    throw error;
  }
};

export const updateGrade = async (id, data) => {
  try {
    const { fields, values } = buildUpdate(data, [
      "grade_code",
      "grade_name",
      "is_active",
    ]);
    if (!fields.length) return { affectedRows: 0 };
    const [result] = await pool.execute(
      `UPDATE grades SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id],
    );
    return result;
  } catch (error) {
    console.error("updateGrade error:", error);
    throw error;
  }
};

// Soft delete
export const deleteGrade = async (id) => {
  try {
    const [result] = await pool.execute(
      "UPDATE grades SET is_active = 0 WHERE id = ?",
      [id],
    );
    return result;
  } catch (error) {
    console.error("deleteGrade error:", error);
    throw error;
  }
};
