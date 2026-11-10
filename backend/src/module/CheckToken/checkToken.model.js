// controllers/checkToken.model.js
import { pool } from "../../config/mySqlDB.js";
import { hashToken, revokeSessions } from "../user/staff.repository.js";

export const USER_TABLE = "uc_staff_profile";
export const USER_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "name",
  EMAIL: "email",
  PASSWORD: "password",
  ROLE_ID: "role_id",
  DEPARTMENT_ID: "department_id",
  MANAGER_ID: "manager_id",
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  REFRESH_TOKEN: "refreshToken",
};

export const findUserById = async (id) => {
  if (id == null) throw new Error("User ID is required");

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        u.id,
        u.firstName,
        u.lastName,
        u.officeEmail,
        u.userName,
        u.passportPhotoUploaded,
        r.role_name,
        d.department_name,
        dg.designation_name
      FROM uc_staff_profile u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN sub_department dg ON u.subDepartment_id = dg.id
      WHERE u.id = ?
      `,
      [id],
    );

    const user = rows[0];
    if (!user) return null;

    // ✅ Sirf zaruri fields return karo - sensitive data bahar na jaye
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.OfficeEmail,
      userName: user.userName,
      profileImage: user.passportPhotoUploaded,
      role: user.role_name,
      department: user.department_name,
      designation: user.designation_name,
    };
  } catch (error) {
    console.error("findUserById error:", error);
    throw error;
  }
};

// Add this function if you need to find by refresh token
export const findUserByRefreshToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token is required");

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        u.*, 
        r.role_name
      FROM auth_sessions s
      JOIN uc_staff_profile u ON u.id = s.staff_id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE s.refresh_token_hash = ?
        AND s.revoked_at IS NULL
        AND (s.expires_at IS NULL OR s.expires_at > UTC_TIMESTAMP())
      LIMIT 1
      `,
      [hashToken(refreshToken)],
    );

    return rows[0] || null;
  } catch (error) {
    console.error("findUserByRefreshToken error:", error);
    throw error;
  }
};

// Logout: revokes the session for `currentRefreshToken` (from the cookie), or every open
// session of the user when no token is available. Sessions live in auth_sessions.
export const updateUserRefreshToken = async (userId, refreshToken, currentRefreshToken = null) => {
  if (!userId) throw new Error("User ID is required");

  try {
    if (refreshToken === null || refreshToken === undefined) {
      return await revokeSessions(userId, currentRefreshToken, "logout");
    }
    throw new Error("Use saveRefreshToken() to store a new session");
  } catch (error) {
    console.error("updateUserRefreshToken error:", error);
    throw error;
  }
};
