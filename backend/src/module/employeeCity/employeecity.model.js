import { pool } from "../../config/mySqlDB.js";
import { v4 as generateUUID } from "uuid";

export const EMPLOYEE_CITY_TABLE = "employee_cities";
export const EMPLOYEE_TABLE = "employees";
export const CITY_TABLE = "cities";

export const EMPLOYEE_CITY_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  EMPLOYEE_ID: "employee_id",
  CITY_ID: "city_id",
  ASSIGNED_AT: "assigned_at",
};

// ✅ Assign Multiple Cities to an Employee
export const assignCitiesToEmployee = async (employeeId, cityIds = []) => {
  if (!employeeId) throw new Error("employeeId is required");
  if (!Array.isArray(cityIds) || cityIds.length === 0) return;

  // Prepare array for bulk insert: [[employeeId, cityId, uuid], ...]
  const values = cityIds.map((cityId) => [employeeId, cityId, generateUUID()]);

  const sql = `
    INSERT IGNORE INTO ${EMPLOYEE_CITY_TABLE} 
    (${EMPLOYEE_CITY_COLUMNS.EMPLOYEE_ID}, ${EMPLOYEE_CITY_COLUMNS.CITY_ID}, ${EMPLOYEE_CITY_COLUMNS.UUID})
    VALUES ?
  `;

  const [result] = await pool.query(sql, [values]);
  return result;
};

// ✅ Get All Cities of an Employee
export const getCitiesByEmployeeId = async (employeeId) => {
  const sql = `
    SELECT 
      ec.*,
      c.city_name
    FROM ${EMPLOYEE_CITY_TABLE} ec
    JOIN ${CITY_TABLE} c 
      ON ec.city_id = c.id
    WHERE ec.${EMPLOYEE_CITY_COLUMNS.EMPLOYEE_ID} = ?
  `;
  const [rows] = await pool.execute(sql, [employeeId]);
  return rows;
};

// ✅ Get All Employees of a City
export const getEmployeesByCityId = async (cityId) => {
  const sql = `
    SELECT 
      ec.*,
      e.name AS employee_name,
      e.email
    FROM ${EMPLOYEE_CITY_TABLE} ec
    JOIN ${EMPLOYEE_TABLE} e
      ON ec.employee_id = e.id
    WHERE ec.${EMPLOYEE_CITY_COLUMNS.CITY_ID} = ?
  `;
  const [rows] = await pool.execute(sql, [cityId]);
  return rows;
};

// ✅ Check if a city is already assigned to employee
export const findEmployeeCity = async (employeeId, cityId) => {
  const [rows] = await pool.execute(
    `
    SELECT * 
    FROM ${EMPLOYEE_CITY_TABLE}
    WHERE ${EMPLOYEE_CITY_COLUMNS.EMPLOYEE_ID} = ?
      AND ${EMPLOYEE_CITY_COLUMNS.CITY_ID} = ?
    `,
    [employeeId, cityId],
  );
  return rows[0] || null;
};

// ✅ Remove a city from an employee
export const removeCityFromEmployee = async (employeeId, cityId) => {
  const [result] = await pool.execute(
    `
    DELETE FROM ${EMPLOYEE_CITY_TABLE}
    WHERE ${EMPLOYEE_CITY_COLUMNS.EMPLOYEE_ID} = ?
      AND ${EMPLOYEE_CITY_COLUMNS.CITY_ID} = ?
    `,
    [employeeId, cityId],
  );
  return result.affectedRows > 0;
};

// ✅ Remove all cities of an employee
export const removeAllCitiesOfEmployee = async (employeeId) => {
  const [result] = await pool.execute(
    `
    DELETE FROM ${EMPLOYEE_CITY_TABLE}
    WHERE ${EMPLOYEE_CITY_COLUMNS.EMPLOYEE_ID} = ?
    `,
    [employeeId],
  );
  return result.affectedRows;
};
