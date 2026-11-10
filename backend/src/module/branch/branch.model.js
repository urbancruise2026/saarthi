import { pool } from "../../config/mySqlDB.js";
import { generateUUID } from "../../utils/uuid.js";

export const BranchModel = {
  createBranch: async (branch_name, branch_code, location) => {
    const uuid = generateUUID();

    const [result] = await pool.query(
      `INSERT INTO branches (uuid, branch_name, branch_code, location)
       VALUES (?, ?, ?, ?)`,
      [uuid, branch_name, branch_code, location],
    );

    return {
      id: result.insertId,
      uuid,
      branch_name,
      branch_code,
      location,
    };
  },

  getBranchByCode: async (branch_code) => {
    const [rows] = await pool.query(
      `SELECT * FROM branches WHERE branch_code = ?`,
      [branch_code],
    );
    return rows[0];
  },

  getAllBranches: async () => {
    const [rows] = await pool.query(`SELECT * FROM branches ORDER BY id DESC`);
    return rows;
  },

  getBranchById: async (id) => {
    const [rows] = await pool.query(`SELECT * FROM branches WHERE id = ?`, [
      id,
    ]);
    return rows[0];
  },

  updateBranch: async (id, branch_name, branch_code, location) => {
    const [result] = await pool.query(
      `UPDATE branches 
       SET branch_name = ?, branch_code = ?, location = ?
       WHERE id = ?`,
      [branch_name, branch_code, location, id],
    );

    return result;
  },

  deleteBranch: async (id) => {
    const [result] = await pool.query(`DELETE FROM branches WHERE id = ?`, [
      id,
    ]);

    return result;
  },
};
