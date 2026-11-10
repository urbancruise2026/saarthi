import { pool } from "../config/mySqlDB.js";

export const generateEmployeeId = async (branchOffice_Id, employmentType) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ✅ normalize properly (MAIN FIX 🔥)
    const type = employmentType?.toString().toLowerCase().trim();

    console.log("Normalized Type:", type);

    // ✅ 1️⃣ Intern / Probation / Contract → tempId
    if (["intern", "probation", "contract"].includes(type)) {
      const [rows] = await connection.execute(
        `SELECT tempId 
         FROM uc_staff_profile 
         WHERE tempId IS NOT NULL
         ORDER BY id DESC 
         LIMIT 1`,
      );

      let nextNumber = 1;

      if (rows.length > 0 && rows[0].tempId) {
        const lastNumber = parseInt(rows[0].tempId, 10) || 0;
        nextNumber = lastNumber + 1;
      }

      const tempId = String(nextNumber).padStart(5, "0");

      await connection.commit();

      return {
        tempId,
        employeeId: null,
      };
    }

    // ✅ 2️⃣ Full-Time employee → employeeId generate

    const [branchRows] = await connection.execute(
      "SELECT branch_code FROM branches WHERE id = ?",
      [branchOffice_Id],
    );

    if (!branchRows.length || !branchRows[0].branch_code) {
      throw new Error("Branch not found or branch_code missing");
    }

    const branch_code = branchRows[0].branch_code.trim();

    console.log("Branch Code:", branch_code);

    const [empRows] = await connection.execute(
      `SELECT employeeId 
       FROM uc_staff_profile 
       WHERE branchOffice_id = ?
       AND employeeId LIKE ?
       ORDER BY id DESC
       LIMIT 1`,
      [branchOffice_Id, `${branch_code}%`],
    );

    let nextNumber = 1;

    if (empRows.length > 0 && empRows[0].employeeId) {
      const lastEmployeeId = empRows[0].employeeId;

      // ✅ SAFE parsing (FIX 🔥)
      const numericPart = lastEmployeeId.slice(branch_code.length);
      const lastNumber = parseInt(numericPart, 10) || 0;

      nextNumber = lastNumber + 1;
    }

    const employeeId = `${branch_code}${String(nextNumber).padStart(6, "0")}`;

    await connection.commit();

    return {
      tempId: null,
      employeeId,
    };
  } catch (error) {
    await connection.rollback();
    console.error("ID Generation Error:", error);
    throw error;
  } finally {
    connection.release();
  }
};
