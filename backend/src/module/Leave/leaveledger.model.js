import { pool } from "../../config/mySqlDB.js";

export const getLedgerByEmployee = async (
  employeeId,
  { year = null, leaveTypeId = null } = {},
) => {
  try {
    const where = ["l.employee_id = ?"];
    const params = [employeeId];
    if (year) {
      where.push("l.year = ?");
      params.push(year);
    }
    if (leaveTypeId) {
      where.push("l.leave_type_id = ?");
      params.push(leaveTypeId);
    }
    const [rows] = await pool.execute(
      `SELECT l.*, lt.leave_code
       FROM leave_ledger l
       JOIN leave_types lt ON lt.id = l.leave_type_id
       WHERE ${where.join(" AND ")}
       ORDER BY l.id`,
      params,
    );
    return rows;
  } catch (error) {
    console.error("getLedgerByEmployee error:", error);
    throw error;
  }
};

// days: credit +, debit -
export const createLedgerEntry = async ({
  employee_id,
  leave_type_id,
  year,
  month = null,
  txn_type,
  days,
  remarks = null,
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO leave_ledger (employee_id, leave_type_id, year, month, txn_type, days, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, leave_type_id, year, month, txn_type, days, remarks],
    );
    return { id: result.insertId };
  } catch (error) {
    console.error("createLedgerEntry error:", error);
    throw error;
  }
};

export const hasMonthlyCredit = async (year, month) => {
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM leave_ledger WHERE txn_type = 'MONTHLY_CREDIT' AND year = ? AND month = ?",
      [year, month],
    );
    return rows[0].cnt > 0;
  } catch (error) {
    console.error("hasMonthlyCredit error:", error);
    throw error;
  }
};
