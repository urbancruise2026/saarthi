import { pool } from "../../config/mySqlDB.js";
import { v4 as generateUUID } from "uuid";

export const ROLE_TABLE = "roles";
export const DEPARTMENT_TABLE = "departments";
export const USER_TABLE = "uc_staff_profile";

export const ROLE_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "role_name",
  SUB_DEPARTMENT_ID: "subDepartment_id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const DEPARTMENT_COLUMNS = {
  ID: "id",
  NAME: "department_name",
};

export const USER_COLUMNS = {
  ROLE_ID: "role_id",
};

// ==============================
// CREATE ROLE
// ==============================
export const insertRole = async (data) => {
  const { role_name, subDepartment_id } = data;
  const roleUuid = generateUUID();

  const sql = `
    INSERT INTO ${ROLE_TABLE}
    (
      ${ROLE_COLUMNS.UUID},
      ${ROLE_COLUMNS.NAME},
      ${ROLE_COLUMNS.SUB_DEPARTMENT_ID}
    )
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    roleUuid,
    role_name,
    subDepartment_id,
  ]);

  return {
    id: result.insertId,
    uuid: roleUuid,
    role_name,
    subDepartment_id,
    created_at: new Date(),
  };
};

// ==============================
// GET ALL ROLES WITH DEPARTMENT
// ==============================
export const getRoles = async () => {
  const sql = `
    SELECT 
      r.*,
      d.${DEPARTMENT_COLUMNS.NAME} AS department_name
    FROM ${ROLE_TABLE} r
    LEFT JOIN ${DEPARTMENT_TABLE} d 
      ON r.${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = d.${DEPARTMENT_COLUMNS.ID}
    ORDER BY r.${ROLE_COLUMNS.NAME} ASC
  `;

  const [rows] = await pool.execute(sql);
  return rows;
};

// ==============================
// GET ROLE BY ID
// ==============================
export const getRoleById = async (id) => {
  const sql = `
    SELECT 
      r.*,
      d.${DEPARTMENT_COLUMNS.NAME} AS department_name
    FROM ${ROLE_TABLE} r
    LEFT JOIN ${DEPARTMENT_TABLE} d 
      ON r.${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = d.${DEPARTMENT_COLUMNS.ID}
    WHERE r.${ROLE_COLUMNS.ID} = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [id]);
  return rows[0] || null;
};

// ==============================
// GET ROLE BY UUID
// ==============================
export const getRoleByUUID = async (uuid) => {
  const sql = `
    SELECT 
      r.*,
      d.${DEPARTMENT_COLUMNS.NAME} AS department_name
    FROM ${ROLE_TABLE} r
    LEFT JOIN ${DEPARTMENT_TABLE} d 
      ON r.${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = d.${DEPARTMENT_COLUMNS.ID}
    WHERE r.${ROLE_COLUMNS.UUID} = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [uuid]);
  return rows[0] || null;
};

// ==============================
// FIND ROLE BY NAME + DEPARTMENT
// (Duplicate Check)
// excludeId = optional (for update case)
// ==============================
export const findRoleByName = async (
  roleName,
  subDepartmentId,
  excludeId = null,
) => {
  let sql = `
    SELECT * 
    FROM ${ROLE_TABLE}
    WHERE LOWER(${ROLE_COLUMNS.NAME}) = LOWER(?)
      AND ${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = ?
  `;

  const params = [roleName, subDepartmentId];

  if (excludeId) {
    sql += ` AND ${ROLE_COLUMNS.ID} != ?`;
    params.push(excludeId);
  }

  sql += ` LIMIT 1`;

  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};

// ==============================
// GET ROLES BY DEPARTMENT ID
// ==============================
export const getRolesByDepartmentId = async (subDepartmentId) => {
  const sql = `
    SELECT 
      r.*,
      d.${DEPARTMENT_COLUMNS.NAME} AS department_name
    FROM ${ROLE_TABLE} r
    LEFT JOIN ${DEPARTMENT_TABLE} d
      ON r.${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = d.${DEPARTMENT_COLUMNS.ID}
    WHERE r.${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = ?
    ORDER BY r.${ROLE_COLUMNS.NAME} ASC
  `;

  const [rows] = await pool.execute(sql, [subDepartmentId]);
  return rows;
};

// ==============================
// UPDATE ROLE
// ==============================
export const updateRoleById = async (id, data) => {
  const { role_name, subDepartment_id } = data;

  const sql = `
    UPDATE ${ROLE_TABLE}
    SET
      ${ROLE_COLUMNS.NAME} = ?,
      ${ROLE_COLUMNS.SUB_DEPARTMENT_ID} = ?,
      ${ROLE_COLUMNS.UPDATED_AT} = CURRENT_TIMESTAMP
    WHERE ${ROLE_COLUMNS.ID} = ?
  `;

  const [result] = await pool.execute(sql, [role_name, subDepartment_id, id]);

  if (result.affectedRows === 0) return null;

  return await getRoleById(id);
};

// ==============================
// COUNT USERS BY ROLE ID
// (Safe delete check)
// ==============================
export const countUsersByRoleId = async (roleId) => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM ${USER_TABLE}
    WHERE ${USER_COLUMNS.ROLE_ID} = ?
  `;

  const [rows] = await pool.execute(sql, [roleId]);
  return rows[0]?.total || 0;
};

// ==============================
// DELETE ROLE
// ==============================
export const deleteRoleById = async (id) => {
  const sql = `
    DELETE FROM ${ROLE_TABLE}
    WHERE ${ROLE_COLUMNS.ID} = ?
  `;

  const [result] = await pool.execute(sql, [id]);
  return result.affectedRows > 0;
};
