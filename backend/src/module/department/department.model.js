import { pool } from "../../config/mySqlDB.js";
import { generateUUID } from "../../utils/uuid.js";

export const DEPARTMENT_TABLE = "departments";

export const DEPARTMENT_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "department_name",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

//  Insert Department
export const insertDepartment = async (data) => {
  const { department_name } = data;
  const departmentUuid = generateUUID();

  const sql = `
    INSERT INTO ${DEPARTMENT_TABLE} 
    (${DEPARTMENT_COLUMNS.UUID}, ${DEPARTMENT_COLUMNS.NAME})
    VALUES (?, ?)
  `;

  const [result] = await pool.execute(sql, [departmentUuid, department_name]);

  return {
    id: result.insertId,
    uuid: departmentUuid,
    department_name,
    created_at: new Date(),
  };
};

//  Get All Departments
export const getDepartments = async () => {
  const sql = `
    SELECT * FROM ${DEPARTMENT_TABLE}
    ORDER BY ${DEPARTMENT_COLUMNS.NAME} ASC
  `;

  const [rows] = await pool.execute(sql);
  return rows;
};

//  Get Department by ID
export const getDepartmentById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${DEPARTMENT_TABLE} WHERE ${DEPARTMENT_COLUMNS.ID} = ?`,
    [id],
  );

  return rows[0] || null;
};

//  Get Department by UUID
export const getDepartmentByUUID = async (uuid) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${DEPARTMENT_TABLE} WHERE ${DEPARTMENT_COLUMNS.UUID} = ?`,
    [uuid],
  );

  return rows[0] || null;
};

export const findDepartmentByName = async (departmentName) => {
  const [rows] = await pool.execute(
    `
    SELECT * FROM ${DEPARTMENT_TABLE}
    WHERE LOWER(${DEPARTMENT_COLUMNS.NAME}) = LOWER(?)
    `,
    [departmentName],
  );

  return rows[0] || null;
};

export const getDepartmentData = async (departmentId) => {
  // Get sub_department
  const [sub_department] = await pool.execute(
    `
    SELECT id, subDepartment_name
    FROM sub_department
    WHERE department_id = ? AND subDepartment_name IS NOT NULL
    ORDER BY subDepartment_name ASC
    `,
    [departmentId],
  );

  // Get Roles

  return {
    sub_department,
  };
};

export const getHoData = async (departmentId) => {
  const [hos] = await pool.execute(
    `
    SELECT id, ho_name, department_id
    FROM hos
    WHERE department_id = ?
      AND ho_name IS NOT NULL
    ORDER BY ho_name ASC
    `,
    [departmentId],
  );

  return { hos };
};

export const getRoleBySubDepartmentId = async (subDepartment_id) => {
  const [roles] = await pool.execute(
    `
    SELECT id, role_name
    FROM roles
    WHERE subDepartment_id = ? AND role_name IS NOT NULL
    ORDER BY role_name ASC
    `,
    [subDepartment_id],
  );

  return {
    roles: roles || [],
  };
};
