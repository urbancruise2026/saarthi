import { v4 as uuidv4 } from "uuid";
import { pool } from "../../config/mySqlDB.js";

export const applyLeave = async ({
  employeeId,
  leaveType,
  fromDate,
  toDate,
  totalDays,
  reason,
}) => {
  try {
    const uuid = uuidv4();

    const sql = `
      INSERT INTO leaves
      (
        uuid,
        employee_id,
        leave_type,
        from_date,
        to_date,
        total_days,
        reason,
        status,
        applied_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `;

    const [result] = await pool.execute(sql, [
      uuid,
      employeeId,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
    ]);

    return {
      ...result,
      uuid,
    };
  } catch (error) {
    console.error("applyLeave error:", error);
    throw error;
  }
};

export const updateLeaveStatus = async ({
  leaveId,
  status, // 'Approved' | 'Rejected'
  approvedBy,
  rejectionReason = null,
}) => {
  try {
    // 1. Fetch the leave row first so we have leaveType, employeeId, totalDays
    const [rows] = await pool.execute(`SELECT * FROM leaves WHERE id = ?`, [
      leaveId,
    ]);

    const leave = rows[0];
    if (!leave) {
      return null; // let controller handle "not found"
    }

    // 2. Now update
    const sql = `
      UPDATE leaves
      SET
        status = ?,
        approved_by = ?,
        approved_at = NOW(),
        rejection_reason = ?
      WHERE id = ?
    `;

    await pool.execute(sql, [
      status,
      approvedBy,
      status === "Rejected" ? rejectionReason : null,
      leaveId,
    ]);

    // 3. Return the merged data (original row + updated fields)
    return {
      ...leave,
      status,
      approved_by: approvedBy,
      rejection_reason: status === "Rejected" ? rejectionReason : null,
    };
  } catch (error) {
    console.error("updateLeaveStatus error:", error);
    throw error;
  }
};

export const getLeavesByEmployee = async (employeeId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM leaves WHERE employee_id = ? ORDER BY applied_at DESC`,
      [employeeId],
    );
    return rows;
  } catch (error) {
    console.error("getLeavesByEmployee error:", error);
    throw error;
  }
};

export const getLeaveById = async (leaveId) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM leaves WHERE id = ?`, [
      leaveId,
    ]);
    return rows[0] || null;
  } catch (error) {
    console.error("getLeaveById error:", error);
    throw error;
  }
};

export const getAllLeaves = async (filters = {}) => {
  const {
    status,
    leaveType,
    employeeId,
    managerId,
    branchId,
    departmentId,
    fromDate,
    toDate,
    search,
    page = 1,
    limit = 20,
  } = filters;

  try {
    const conditions = [];
    const params = [];

    // Manager / Team Lead: apni team ki leaves + apni khud ki leaves
    // (getCompOffs wala same pattern)
    if (managerId) {
      conditions.push("(u.manager_id = ? OR l.employee_id = ?)");
      params.push(managerId, managerId);
    }

    if (employeeId) {
      conditions.push("l.employee_id = ?");
      params.push(employeeId);
    }

    if (branchId) {
      conditions.push("u.branchOffice_id = ?");
      params.push(branchId);
    }

    if (departmentId) {
      conditions.push("u.department_id = ?");
      params.push(departmentId);
    }

    if (status) {
      conditions.push("l.status = ?");
      params.push(status);
    }

    if (leaveType) {
      conditions.push("l.leave_type = ?");
      params.push(leaveType);
    }

    // Date range: jo leaves is range se overlap karti hain
    if (fromDate) {
      conditions.push("l.to_date >= ?");
      params.push(fromDate);
    }

    if (toDate) {
      conditions.push("l.from_date <= ?");
      params.push(toDate);
    }

    if (search) {
      conditions.push(
        "(u.firstName LIKE ? OR u.lastName LIKE ? OR u.employeeId LIKE ? OR b.branch_name LIKE ? OR d.department_name LIKE ?)",
      );
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const offset = (pageNum - 1) * limitNum;

    // =========================
    // Total count (same WHERE, no LIMIT)
    // =========================
    const [countRows] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM leaves l
      LEFT JOIN uc_staff_profile u
        ON u.id = l.employee_id
      LEFT JOIN branches b
        ON b.id = u.branchOffice_id
      LEFT JOIN departments d
        ON d.id = u.department_id
      ${whereClause}
      `,
      params,
    );

    const total = Number(countRows[0]?.total || 0);

    // =========================
    // Actual leaves
    // =========================
    // MySQL 8 rejects LIMIT/OFFSET bound as prepared-statement parameters (MariaDB allowed it),
    // so this paginated query uses pool.query, which sends the numbers inline.
    const [rows] = await pool.query(
      `
      SELECT
        l.*,
        TRIM(
          CONCAT(
            COALESCE(u.firstName, ''),
            ' ',
            COALESCE(u.lastName, '')
          )
        ) AS full_name,
        u.employeeId,
        u.department_id,
        u.branchOffice_id,
        b.branch_name AS branch_name,
        d.department_name AS department_name,
        approver.firstName AS approved_by_name
      FROM leaves l
      LEFT JOIN uc_staff_profile u
        ON u.id = l.employee_id
      LEFT JOIN branches b
        ON b.id = u.branchOffice_id
      LEFT JOIN departments d
        ON d.id = u.department_id
      LEFT JOIN uc_staff_profile approver
        ON approver.id = l.approved_by
      ${whereClause}
      ORDER BY l.applied_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limitNum, offset],
    );

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return {
      leaves: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
      },
    };
  } catch (error) {
    console.error("getAllLeaves error:", error);
    throw error;
  }
};

// const pad = (n) => String(n).padStart(2, "0");

// const leaveModel = {
//   // =========================
//   // LEAVE TYPES (PL, EL)
//   // =========================
//   createLeaveType: async (code, name) => {
//     const [result] = await pool.query(
//       `INSERT INTO leave_types (code, name) VALUES (?, ?)`,
//       [code, name],
//     );

//     return { id: result.insertId, code, name };
//   },

//   getLeaveTypes: async () => {
//     const [rows] = await pool.query(
//       `SELECT * FROM leave_types WHERE is_active = 1`,
//     );
//     return rows;
//   },

//   // =========================
//   // GRADE LEAVE POLICY
//   // =========================
//   createPolicy: async (
//     grade_id,
//     leave_type_id,
//     annual_days,
//     credit_frequency, // 'MONTHLY' (PL) / 'YEARLY' (EL)
//     carry_forward_allowed,
//     carry_forward_limit,
//     effective_from,
//     effective_to = null,
//   ) => {
//     const [result] = await pool.query(
//       `INSERT INTO grade_leave_policy
//         (grade_id, leave_type_id, annual_days, credit_frequency,
//          carry_forward_allowed, carry_forward_limit, effective_from, effective_to)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         grade_id,
//         leave_type_id,
//         annual_days,
//         credit_frequency,
//         carry_forward_allowed ? 1 : 0,
//         carry_forward_limit,
//         effective_from,
//         effective_to,
//       ],
//     );

//     return {
//       id: result.insertId,
//       grade_id,
//       leave_type_id,
//       annual_days,
//       credit_frequency,
//       carry_forward_allowed,
//       carry_forward_limit,
//       effective_from,
//       effective_to,
//     };
//   },

//   getPolicies: async (grade_id = null) => {
//     let sql = `
//       SELECT p.*, g.grade_code, lt.code AS leave_code
//       FROM grade_leave_policy p
//       JOIN grademaster g ON g.id = p.grade_id
//       JOIN leave_types lt ON lt.id = p.leave_type_id`;
//     const params = [];

//     if (grade_id) {
//       sql += ` WHERE p.grade_id = ?`;
//       params.push(grade_id);
//     }

//     const [rows] = await pool.query(sql, params);
//     return rows;
//   },

//   // =========================
//   // LEDGER ENTRY (manual / debit / adjustment)
//   // =========================
//   addTransaction: async ({
//     employee_id,
//     leave_type_id,
//     transaction_type, // CREDIT / DEBIT / CARRY_FORWARD / LAPSE / ADJUSTMENT
//     days, // credit = +, debit/lapse = -
//     transaction_date,
//     source_type,
//     source_key,
//     grade_id = null,
//     annual_days = null,
//     reference_id = null,
//     remarks = null,
//     created_by = "SYSTEM",
//   }) => {
//     const d = new Date(transaction_date);
//     const period_year = d.getFullYear();
//     const period_month = d.getMonth() + 1;

//     // INSERT IGNORE: same source_key dobara aaye to duplicate insert nahi hoga
//     const [result] = await pool.query(
//       `INSERT IGNORE INTO employee_leave_transactions
//         (employee_id, leave_type_id, transaction_type, days, transaction_date,
//          period_year, period_month, grade_id, annual_days,
//          source_type, source_key, reference_id, remarks, created_by)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         employee_id,
//         leave_type_id,
//         transaction_type,
//         days,
//         transaction_date,
//         period_year,
//         period_month,
//         grade_id,
//         annual_days,
//         source_type,
//         source_key,
//         reference_id,
//         remarks,
//         created_by,
//       ],
//     );

//     return {
//       inserted: result.affectedRows > 0, // false = duplicate tha
//       id: result.insertId || null,
//       source_key,
//     };
//   },

//   // =========================
//   // MONTHLY CREDIT (PL) - har mahine ki 1 tareekh
//   // annual_days / 12
//   // =========================
//   creditMonthly: async (leave_code, year, month) => {
//     const creditDate = `${year}-${pad(month)}-01`;
//     const ym = `${year}-${pad(month)}`;

//     const [result] = await pool.query(
//       `INSERT IGNORE INTO employee_leave_transactions
//         (employee_id, leave_type_id, transaction_type, days, transaction_date,
//          period_year, period_month, grade_id, annual_days,
//          source_type, source_key, remarks)
//        SELECT
//          u.id,
//          lt.id,
//          'CREDIT',
//          ROUND(p.annual_days / 12, 2),
//          ?, ?, ?,
//          u.grade_id,
//          p.annual_days,
//          'MONTHLY_CREDIT',
//          CONCAT(lt.code, '_CREDIT:', u.id, ':', ?),
//          CONCAT('Monthly ', lt.code, ' credit')
//        FROM uc_staff_profile u
//        JOIN grade_leave_policy p
//          ON p.grade_id = u.grade_id
//         AND p.credit_frequency = 'MONTHLY'
//         AND ? >= p.effective_from
//         AND (p.effective_to IS NULL OR ? <= p.effective_to)
//        JOIN leave_types lt
//          ON lt.id = p.leave_type_id AND lt.code = ?
//        WHERE u.status = 'ACTIVE'`,
//       [creditDate, year, month, ym, creditDate, creditDate, leave_code],
//     );

//     return { leave_code, period: ym, credited: result.affectedRows };
//   },

//   // =========================
//   // YEARLY CREDIT (EL) - 1 Jan ko, constant
//   // =========================
//   creditYearly: async (leave_code, year) => {
//     const creditDate = `${year}-01-01`;

//     const [result] = await pool.query(
//       `INSERT IGNORE INTO employee_leave_transactions
//         (employee_id, leave_type_id, transaction_type, days, transaction_date,
//          period_year, period_month, grade_id, annual_days,
//          source_type, source_key, remarks)
//        SELECT
//          u.id,
//          lt.id,
//          'CREDIT',
//          p.annual_days,
//          ?, ?, 1,
//          u.grade_id,
//          p.annual_days,
//          'YEARLY_CREDIT',
//          CONCAT(lt.code, '_CREDIT:', u.id, ':', ?),
//          CONCAT('Yearly ', lt.code, ' credit')
//        FROM uc_staff_profile u
//        JOIN grade_leave_policy p
//          ON p.grade_id = u.grade_id
//         AND p.credit_frequency = 'YEARLY'
//         AND ? >= p.effective_from
//         AND (p.effective_to IS NULL OR ? <= p.effective_to)
//        JOIN leave_types lt
//          ON lt.id = p.leave_type_id AND lt.code = ?
//        WHERE u.status = 'ACTIVE'`,
//       [creditDate, year, year, creditDate, creditDate, leave_code],
//     );

//     return { leave_code, year, credited: result.affectedRows };
//   },

//   // =========================
//   // YEAR END CARRY FORWARD
//   // 1) limit se zyada / allowed nahi to LAPSE (fromYear me)
//   // 2) bacha hua CARRY_FORWARD (toYear me)
//   // =========================
//   carryForward: async (leave_code, fromYear) => {
//     const toYear = fromYear + 1;
//     const lapseDate = `${fromYear}-12-31`;
//     const cfDate = `${toYear}-01-01`;

//     const balanceSub = `
//       SELECT t.employee_id, t.leave_type_id, SUM(t.days) AS balance
//       FROM employee_leave_transactions t
//       JOIN leave_types l ON l.id = t.leave_type_id AND l.code = ?
//       WHERE t.period_year = ?
//       GROUP BY t.employee_id, t.leave_type_id`;

//     const conn = await pool.getConnection();
//     try {
//       await conn.beginTransaction();

//       // 1) LAPSE
//       const [lapse] = await conn.query(
//         `INSERT IGNORE INTO employee_leave_transactions
//           (employee_id, leave_type_id, transaction_type, days, transaction_date,
//            period_year, period_month, grade_id, annual_days,
//            source_type, source_key, remarks)
//          SELECT
//            b.employee_id,
//            b.leave_type_id,
//            'LAPSE',
//            -(b.balance - IF(p.carry_forward_allowed = 1,
//                             LEAST(b.balance, COALESCE(p.carry_forward_limit, b.balance)),
//                             0)),
//            ?, ?, 12,
//            u.grade_id,
//            p.annual_days,
//            'YEAR_END_LAPSE',
//            CONCAT(?, '_LAPSE:', b.employee_id, ':', ?),
//            'Excess balance lapsed at year end'
//          FROM (${balanceSub}) b
//          JOIN uc_staff_profile u ON u.id = b.employee_id AND u.status = 'ACTIVE'
//          JOIN grade_leave_policy p
//            ON p.grade_id = u.grade_id
//           AND p.leave_type_id = b.leave_type_id
//           AND ? >= p.effective_from
//           AND (p.effective_to IS NULL OR ? <= p.effective_to)
//          WHERE b.balance > 0
//            AND b.balance > IF(p.carry_forward_allowed = 1,
//                               COALESCE(p.carry_forward_limit, b.balance),
//                               0)`,
//         [
//           lapseDate,
//           fromYear,
//           leave_code,
//           fromYear,
//           leave_code,
//           fromYear,
//           lapseDate,
//           lapseDate,
//         ],
//       );

//       // 2) CARRY FORWARD (lapse ke baad ka balance)
//       const [cf] = await conn.query(
//         `INSERT IGNORE INTO employee_leave_transactions
//           (employee_id, leave_type_id, transaction_type, days, transaction_date,
//            period_year, period_month, grade_id, annual_days,
//            source_type, source_key, remarks)
//          SELECT
//            b.employee_id,
//            b.leave_type_id,
//            'CARRY_FORWARD',
//            b.balance,
//            ?, ?, 1,
//            u.grade_id,
//            p.annual_days,
//            'YEAR_END_CF',
//            CONCAT(?, '_CF:', b.employee_id, ':', ?),
//            CONCAT('Carry forward from ', ?)
//          FROM (${balanceSub}) b
//          JOIN uc_staff_profile u ON u.id = b.employee_id AND u.status = 'ACTIVE'
//          JOIN grade_leave_policy p
//            ON p.grade_id = u.grade_id
//           AND p.leave_type_id = b.leave_type_id
//           AND p.carry_forward_allowed = 1
//           AND ? >= p.effective_from
//           AND (p.effective_to IS NULL OR ? <= p.effective_to)
//          WHERE b.balance > 0`,
//         [
//           cfDate,
//           toYear,
//           leave_code,
//           toYear,
//           fromYear,
//           leave_code,
//           fromYear,
//           cfDate,
//           cfDate,
//         ],
//       );

//       await conn.commit();

//       return {
//         leave_code,
//         fromYear,
//         toYear,
//         lapsed: lapse.affectedRows,
//         carried_forward: cf.affectedRows,
//       };
//     } catch (err) {
//       await conn.rollback();
//       throw err;
//     } finally {
//       conn.release();
//     }
//   },

//   // =========================
//   // BALANCE
//   // =========================
//   getBalance: async (employee_id, leave_code, year) => {
//     const [rows] = await pool.query(
//       `SELECT COALESCE(SUM(t.days), 0) AS balance
//        FROM employee_leave_transactions t
//        JOIN leave_types lt ON lt.id = t.leave_type_id
//        WHERE t.employee_id = ? AND lt.code = ? AND t.period_year = ?`,
//       [employee_id, leave_code, year],
//     );

//     return Number(rows[0].balance);
//   },

//   // Saare employees ka balance (ek leave type, ek saal)
//   getAllBalances: async (leave_code, year) => {
//     const [rows] = await pool.query(
//       `SELECT t.employee_id,
//               SUM(CASE WHEN t.transaction_type = 'CARRY_FORWARD' THEN t.days ELSE 0 END) AS carried_forward,
//               SUM(CASE WHEN t.transaction_type = 'CREDIT'        THEN t.days ELSE 0 END) AS credited,
//               SUM(CASE WHEN t.transaction_type = 'DEBIT'         THEN t.days ELSE 0 END) AS used,
//               SUM(CASE WHEN t.transaction_type = 'LAPSE'         THEN t.days ELSE 0 END) AS lapsed,
//               SUM(t.days) AS balance
//        FROM employee_leave_transactions t
//        JOIN leave_types lt ON lt.id = t.leave_type_id
//        WHERE lt.code = ? AND t.period_year = ?
//        GROUP BY t.employee_id`,
//       [leave_code, year],
//     );

//     return rows;
//   },

//   // =========================
//   // HISTORY
//   // =========================
//   getTransactions: async (employee_id, leave_code, year) => {
//     const [rows] = await pool.query(
//       `SELECT t.*, lt.code AS leave_code
//        FROM employee_leave_transactions t
//        JOIN leave_types lt ON lt.id = t.leave_type_id
//        WHERE t.employee_id = ? AND lt.code = ? AND t.period_year = ?
//        ORDER BY t.transaction_date, t.id`,
//       [employee_id, leave_code, year],
//     );

//     return rows;
//   },
// };

// module.exports = leaveModel;
