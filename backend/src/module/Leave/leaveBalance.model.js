import { pool } from "../../config/mySqlDB.js"; // apna pool path yahan set karo
import { ApiError } from "../../utils/ApiError.js";

const BALANCE_SELECT = `
  SELECT lb.*, lt.leave_code, lt.leave_name,
         (lb.opening_balance + lb.credited - lb.used) AS closing_balance
  FROM leave_balances lb
  JOIN leave_types lt ON lt.id = lb.leave_type_id`;

export const getBalancesByEmployee = async (employeeId, year) => {
  try {
    const [rows] = await pool.execute(
      `${BALANCE_SELECT} WHERE lb.employee_id = ? AND lb.year = ? ORDER BY lb.leave_type_id`,
      [employeeId, year],
    );
    return rows;
  } catch (error) {
    console.error("getBalancesByEmployee error:", error);
    throw error;
  }
};

export const getBalance = async (employeeId, leaveTypeId, year) => {
  try {
    const [rows] = await pool.execute(
      `${BALANCE_SELECT} WHERE lb.employee_id = ? AND lb.leave_type_id = ? AND lb.year = ?`,
      [employeeId, leaveTypeId, year],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("getBalance error:", error);
    throw error;
  }
};

// Closing balance (opening + credited - used). Row na ho to 0
export const getAvailableBalance = async (employeeId, leaveTypeId, year) => {
  const row = await getBalance(employeeId, leaveTypeId, year);
  return Number(row?.closing_balance || 0);
};

// Row nahi hai to banata hai, hai to kuch nahi karta
export const ensureBalanceRow = async (employeeId, leaveTypeId, year) => {
  try {
    await pool.execute(
      `INSERT INTO leave_balances (employee_id, leave_type_id, year)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE id = id`,
      [employeeId, leaveTypeId, year],
    );
    return await getBalance(employeeId, leaveTypeId, year);
  } catch (error) {
    console.error("ensureBalanceRow error:", error);
    throw error;
  }
};

// Leave approve hone par: used badhao + ledger me debit entry (ek transaction me)
export const deductLeave = async ({
  employee_id,
  leave_type_id,
  year,
  days,
  remarks = null,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT (opening_balance + credited - used) AS closing
       FROM leave_balances
       WHERE employee_id = ? AND leave_type_id = ? AND year = ?
       FOR UPDATE`,
      [employee_id, leave_type_id, year],
    );
    if (!rows.length || Number(rows[0].closing) < Number(days)) {
      throw new ApiError(400, "Insufficient leave balance");
    }

    await conn.execute(
      `UPDATE leave_balances SET used = used + ?
       WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
      [days, employee_id, leave_type_id, year],
    );
    await conn.execute(
      `INSERT INTO leave_ledger (employee_id, leave_type_id, year, month, txn_type, days, remarks)
       VALUES (?, ?, ?, ?, 'LEAVE_TAKEN', ?, ?)`,
      [
        employee_id,
        leave_type_id,
        year,
        new Date().getMonth() + 1,
        -Math.abs(days),
        remarks,
      ],
    );

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    console.error("deductLeave error:", error);
    throw error;
  } finally {
    conn.release();
  }
};

// Monthly credit: yearly_days / 12. Dobara chalane par duplicate credit nahi hota.
export const creditMonthlyLeave = async (year, month) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;

    // 1) Ledger entries (jinko is mahine ka credit mil chuka hai unhe skip)
    const [ins] = await conn.execute(
      `INSERT INTO leave_ledger (employee_id, leave_type_id, year, month, txn_type, days, remarks)
       SELECT e.id, p.leave_type_id, ?, ?, 'MONTHLY_CREDIT', ROUND(p.yearly_days / 12, 2), 'Monthly credit'
       FROM uc_staff e
       JOIN grade_leave_policies p ON p.grade_id = e.grade_id
       JOIN leave_types lt ON lt.id = p.leave_type_id
       WHERE lt.is_monthly_credit = 1
         AND e.is_active = 1
         AND e.date_of_joining <= LAST_DAY(?)
         AND ? BETWEEN p.effective_from AND COALESCE(p.effective_to, '9999-12-31')
         AND NOT EXISTS (
           SELECT 1 FROM leave_ledger l
           WHERE l.employee_id = e.id AND l.leave_type_id = p.leave_type_id
             AND l.year = ? AND l.month = ? AND l.txn_type = 'MONTHLY_CREDIT'
         )`,
      [year, month, firstDay, firstDay, year, month],
    );

    // 2) Balance rows ensure
    await conn.execute(
      `INSERT INTO leave_balances (employee_id, leave_type_id, year)
       SELECT DISTINCT employee_id, leave_type_id, year
       FROM leave_ledger
       WHERE year = ? AND txn_type = 'MONTHLY_CREDIT'
       ON DUPLICATE KEY UPDATE id = id`,
      [year],
    );

    // 3) credited = ledger ke MONTHLY_CREDIT ka total
    await conn.execute(
      `UPDATE leave_balances lb
       JOIN (
         SELECT employee_id, leave_type_id, year, SUM(days) AS total
         FROM leave_ledger
         WHERE txn_type = 'MONTHLY_CREDIT' AND year = ?
         GROUP BY employee_id, leave_type_id, year
       ) x ON x.employee_id = lb.employee_id
          AND x.leave_type_id = lb.leave_type_id
          AND x.year = lb.year
       SET lb.credited = x.total`,
      [year],
    );

    await conn.commit();
    return { credited_rows: ins.affectedRows };
  } catch (error) {
    await conn.rollback();
    console.error("creditMonthlyLeave error:", error);
    throw error;
  } finally {
    conn.release();
  }
};

// Year end: bacha hua balance (carry forward wale leave types ka) agle saal ke opening me
export const carryForwardLeave = async (fromYear) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const toYear = fromYear + 1;

    const [res] = await conn.execute(
      `INSERT INTO leave_balances (employee_id, leave_type_id, year, opening_balance)
       SELECT lb.employee_id, lb.leave_type_id, ?,
              GREATEST(
                LEAST(lb.opening_balance + lb.credited - lb.used, COALESCE(lt.max_carry_forward, 99999)),
                0
              )
       FROM leave_balances lb
       JOIN leave_types lt ON lt.id = lb.leave_type_id
       WHERE lb.year = ? AND lt.is_carry_forward = 1
       ON DUPLICATE KEY UPDATE opening_balance = VALUES(opening_balance)`,
      [toYear, fromYear],
    );

    // Audit ke liye ledger entry (sirf jahan pehle se nahi hai)
    await conn.execute(
      `INSERT INTO leave_ledger (employee_id, leave_type_id, year, month, txn_type, days, remarks)
       SELECT b.employee_id, b.leave_type_id, b.year, NULL, 'CARRY_FORWARD', b.opening_balance,
              CONCAT('Carry forward from ', ?)
       FROM leave_balances b
       WHERE b.year = ? AND b.opening_balance > 0
         AND NOT EXISTS (
           SELECT 1 FROM leave_ledger l
           WHERE l.employee_id = b.employee_id AND l.leave_type_id = b.leave_type_id
             AND l.year = b.year AND l.txn_type = 'CARRY_FORWARD'
         )`,
      [fromYear, toYear],
    );

    await conn.commit();
    return { to_year: toYear, affectedRows: res.affectedRows };
  } catch (error) {
    await conn.rollback();
    console.error("carryForwardLeave error:", error);
    throw error;
  } finally {
    conn.release();
  }
};

export const getLeaveSummary = async ({
  year,
  employeeId = null,
  branchId = null,
  departmentId = null,
  managerId = null, // diya to: manager ki apni + uski team
} = {}) => {
  try {
    // leave_balances ke filters
    const where = ["lb.year = ?"];
    const params = [year];

    // comp_offs ke filters (year nahi lagta)
    const coWhere = ["c.status = 'Available'"];
    const coParams = [];

    if (employeeId) {
      where.push("lb.employee_id = ?");
      params.push(employeeId);
      coWhere.push("c.employee_id = ?");
      coParams.push(employeeId);
    }
    if (branchId) {
      where.push("e.branch_id = ?");
      params.push(branchId);
      coWhere.push("e.branch_id = ?");
      coParams.push(branchId);
    }
    if (departmentId) {
      where.push("e.department_id = ?");
      params.push(departmentId);
      coWhere.push("e.department_id = ?");
      coParams.push(departmentId);
    }
    if (managerId) {
      where.push("(e.manager_id = ? OR lb.employee_id = ?)");
      params.push(managerId, managerId);
      coWhere.push("(e.manager_id = ? OR c.employee_id = ?)");
      coParams.push(managerId, managerId);
    }

    const [[bal]] = await pool.execute(
      `SELECT
         COALESCE(SUM(lb.opening_balance), 0)                          AS carry_forward,
         COALESCE(SUM(lb.opening_balance + lb.credited), 0)            AS total_leave,
         COALESCE(SUM(lb.used), 0)                                     AS leaves_taken,
         COALESCE(SUM(lb.opening_balance + lb.credited - lb.used), 0)  AS leaves_remaining
       FROM leave_balances lb
       JOIN uc_staff e ON e.id = lb.employee_id
       WHERE ${where.join(" AND ")}`,
      params,
    );

    // Comp off year-wise nahi hota, jitna Available hai sab dikhega
    const [[co]] = await pool.execute(
      `SELECT COALESCE(SUM(c.days), 0) AS comp_off_balance
       FROM comp_offs c
       JOIN uc_staff e ON e.id = c.employee_id
       WHERE ${coWhere.join(" AND ")}`,
      coParams,
    );

    return {
      carryForward: Number(bal.carry_forward),
      totalLeave: Number(bal.total_leave),
      leavesTaken: Number(bal.leaves_taken),
      leavesRemaining: Number(bal.leaves_remaining),
      compOffBalance: Number(co.comp_off_balance),
    };
  } catch (error) {
    console.error("getLeaveSummary error:", error);
    throw error;
  }
};
