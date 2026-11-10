// -----------------------------------------------------------------------------
// accessControl.js
//
// GENERIC role-hierarchy access control — NOT tied to attendance specifically.
// Use this for ANY resource that belongs to a single employee: attendance,
// leave requests, payroll, documents, performance reviews, tasks, etc.
//
// Core idea stays the same everywhere:
//   - Employee            -> only their own record
//   - TeamLeader/Manager/
//     RegionalHead        -> their own + their direct reports' records
//   - HR / SuperAdmin     -> every record, no restriction
//
// VIEW and MANAGE are checked separately, because a role that can see
// something doesn't always mean it can edit/approve it.
//
// Assumed schema (adjust if yours differs):
//   users.id          -> primary key
//   users.role        -> 'Employee' | 'TeamLeader' | 'Manager' | 'RegionalHead' | 'HR' | 'SuperAdmin'
//   users.manager_id  -> id of the person this user reports to
// -----------------------------------------------------------------------------

export const ROLES = {
  EMPLOYEE: "Employee",
  TEAM_LEADER: "TeamLeader",
  MANAGER: "Manager",
  REGIONAL_HEAD: "RegionalHead",
  HR: "HR",
  SUPER_ADMIN: "SuperAdmin",
};

const FULL_ACCESS_ROLES = [ROLES.HR, ROLES.SUPER_ADMIN];
const TEAM_SCOPED_ROLES = [
  ROLES.TEAM_LEADER,
  ROLES.MANAGER,
  ROLES.REGIONAL_HEAD,
];

async function isDirectReport(pool, managerUserId, targetEmployeeId) {
  const [rows] = await pool.execute(
    `SELECT id FROM uc_staff_profile WHERE id = ? AND manager_id = ?`,
    [targetEmployeeId, managerUserId],
  );
  return rows.length > 0;
}

/**
 * List of employee_ids `user` can access. "ALL" (sentinel) for HR/SuperAdmin.
 * Use for LIST endpoints (e.g. "show me every employee's leave requests").
 */
export async function getAccessibleEmployeeIds(pool, user) {
  if (FULL_ACCESS_ROLES.includes(user.role)) return "ALL";
  if (user.role === ROLES.EMPLOYEE) return [user.id];

  if (TEAM_SCOPED_ROLES.includes(user.role)) {
    const [rows] = await pool.execute(
      `SELECT id FROM uc_staff_profile WHERE manager_id = ?`,
      [user.id],
    );
    return [user.id, ...rows.map((r) => r.id)];
  }

  return [user.id]; // unknown role -> fail closed
}

/**
 * Can `user` VIEW targetEmployeeId's record (any module)?
 */
export async function canView(pool, user, targetEmployeeId) {
  if (String(user.id) === String(targetEmployeeId)) return true;
  if (FULL_ACCESS_ROLES.includes(user.role)) return true;
  if (TEAM_SCOPED_ROLES.includes(user.role)) {
    return isDirectReport(pool, user.id, targetEmployeeId);
  }
  return false;
}

/**
 * Can `user` MANAGE (edit/approve/mark) targetEmployeeId's record (any module)?
 * `selfAllowed` lets each module decide whether an employee can manage their
 * OWN record (e.g. submitting their own leave request = true, but marking
 * their own attendance status = usually false, admin-only).
 */
export async function canManage(
  pool,
  user,
  targetEmployeeId,
  { selfAllowed = false } = {},
) {
  if (FULL_ACCESS_ROLES.includes(user.role)) return true;

  const isSelf = String(user.id) === String(targetEmployeeId);
  if (isSelf) return selfAllowed;

  if (TEAM_SCOPED_ROLES.includes(user.role)) {
    return isDirectReport(pool, user.id, targetEmployeeId);
  }

  return false;
}

// -----------------------------------------------------------------------------
// Generic Express middleware factory.
// `getTargetEmployeeId(req)` tells it where to find the employee id for THIS
// route (params, body, query — differs per module/endpoint).
// -----------------------------------------------------------------------------

export function authorizeView(pool, getTargetEmployeeId) {
  return async (req, res, next) => {
    try {
      const targetEmployeeId = getTargetEmployeeId(req) || req.user.id;
      const allowed = await canView(pool, req.user, targetEmployeeId);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to view this record",
        });
      }

      req.resolvedEmployeeId = targetEmployeeId;
      next();
    } catch (error) {
      console.error("authorizeView error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Access check failed" });
    }
  };
}

export function authorizeManage(pool, getTargetEmployeeId, options = {}) {
  return async (req, res, next) => {
    try {
      const targetEmployeeId = getTargetEmployeeId(req);

      if (!targetEmployeeId) {
        return res
          .status(400)
          .json({ success: false, message: "employeeId is required" });
      }

      const allowed = await canManage(
        pool,
        req.user,
        targetEmployeeId,
        options,
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to modify this record",
        });
      }

      req.resolvedEmployeeId = targetEmployeeId;
      next();
    } catch (error) {
      console.error("authorizeManage error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Access check failed" });
    }
  };
}
