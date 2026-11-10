import { pool } from "../../config/mySqlDB.js";

// ==============================
// GET employee's access control
// by employee_id
// ==============================
export const getAccessControlByEmployeeId = async (employeeId) => {
  const [rows] = await pool.query(
    `SELECT 
       ac.id,
       ac.employee_id,
       ac.department_id,
       ac.subdepartment_id,
       ac.reporting_manager_id,
       ac.created_at,
       ac.updated_at,
       GROUP_CONCAT(DISTINCT acr.region_id) as region_ids,
       GROUP_CONCAT(DISTINCT acz.zone_id)   as zone_ids,
       GROUP_CONCAT(DISTINCT acc.city_id)   as city_ids
     FROM access_control ac
     LEFT JOIN access_control_regions acr ON acr.access_control_id = ac.id
     LEFT JOIN access_control_zones   acz ON acz.access_control_id = ac.id
     LEFT JOIN access_control_cities  acc ON acc.access_control_id = ac.id
     WHERE ac.employee_id = ?
     GROUP BY ac.id`,
    [employeeId],
  );

  if (!rows[0]) return null;

  const row = rows[0];
  return {
    ...row,
    region_ids: row.region_ids ? row.region_ids.split(",").map(Number) : [],
    zone_ids: row.zone_ids ? row.zone_ids.split(",").map(Number) : [],
    city_ids: row.city_ids ? row.city_ids.split(",").map(Number) : [],
  };
};

// ==============================
// GET ALL access controls
// with employee, dept, role names
// ==============================
export const getAllAccessControls = async () => {
  // First check if role_id column exists in access_control table
  let hasRoleIdColumn = false;
  try {
    await pool.query(`SELECT role_id FROM access_control LIMIT 1`);
    hasRoleIdColumn = true;
  } catch (e) {
    console.log(
      "role_id column not in access_control table, will get from users table",
    );
  }

  let query;
  if (hasRoleIdColumn) {
    query = `SELECT 
       ac.id,
       ac.employee_id,
       CONCAT(e.firstName, ' ', e.lastName)        AS employee_name,
        e.aliasName AS alias_name,
       ac.department_id,
       d.department_name,
       ac.subdepartment_id,
       sd.subDepartment_name                          AS subdepartment_name,
       ac.role_id,
       r.role_name,
       ac.reporting_manager_id,
       CONCAT(m.firstName, ' ', m.lastName)         AS manager_name,
       ac.created_at,
       ac.updated_at,
       GROUP_CONCAT(DISTINCT acr.region_id)           AS region_ids,
       GROUP_CONCAT(DISTINCT rg.region_name)          AS region_names,
       GROUP_CONCAT(DISTINCT acz.zone_id)             AS zone_ids,
       GROUP_CONCAT(DISTINCT z.zone_name)             AS zone_names,
       GROUP_CONCAT(DISTINCT acc.city_id)             AS city_ids,
       GROUP_CONCAT(DISTINCT ct.city_name)            AS city_names
     FROM access_control ac
     LEFT JOIN uc_staff_profile                  e   ON e.id   = ac.employee_id
     LEFT JOIN departments            d   ON d.id   = ac.department_id
     LEFT JOIN sub_department        sd  ON sd.id   = ac.subdepartment_id
     LEFT JOIN roles                  r   ON r.id   = ac.role_id
     LEFT JOIN uc_staff_profile                  m   ON m.id   = ac.reporting_manager_id
     LEFT JOIN access_control_regions acr ON acr.access_control_id = ac.id
     LEFT JOIN regions               rg  ON rg.id   = acr.region_id
     LEFT JOIN access_control_zones  acz ON acz.access_control_id = ac.id
     LEFT JOIN zones                 z   ON z.id   = acz.zone_id
     LEFT JOIN access_control_cities acc ON acc.access_control_id = ac.id
     LEFT JOIN city                  ct  ON ct.id   = acc.city_id
     GROUP BY ac.id
     ORDER BY ac.created_at DESC`;
  } else {
    query = `SELECT 
       ac.id,
       ac.employee_id,
       CONCAT(e.firstName, ' ', e.lastName)        AS employee_name,
       e.aliasName AS alias_name,
       ac.department_id,
       d.department_name,
       ac.subdepartment_id,
       sd.subDepartment_name                          AS subdepartment_name,
       e.role_id,
       r.role_name,
       ac.reporting_manager_id,
       CONCAT(m.firstName, ' ', m.lastName)         AS manager_name,
       ac.created_at,
       ac.updated_at,
       GROUP_CONCAT(DISTINCT acr.region_id)           AS region_ids,
       GROUP_CONCAT(DISTINCT rg.region_name)          AS region_names,
       GROUP_CONCAT(DISTINCT acz.zone_id)             AS zone_ids,
       GROUP_CONCAT(DISTINCT z.zone_name)             AS zone_names,
       GROUP_CONCAT(DISTINCT acc.city_id)             AS city_ids,
       GROUP_CONCAT(DISTINCT ct.city_name)            AS city_names
     FROM access_control ac
     LEFT JOIN uc_staff_profile                  e   ON e.id   = ac.employee_id
     LEFT JOIN departments            d   ON d.id   = ac.department_id
     LEFT JOIN sub_department        sd  ON sd.id   = ac.subdepartment_id
     LEFT JOIN roles                  r   ON r.id   = e.role_id
     LEFT JOIN uc_staff_profile                  m   ON m.id   = ac.reporting_manager_id
     LEFT JOIN access_control_regions acr ON acr.access_control_id = ac.id
     LEFT JOIN regions               rg  ON rg.id   = acr.region_id
     LEFT JOIN access_control_zones  acz ON acz.access_control_id = ac.id
     LEFT JOIN zones                 z   ON z.id   = acz.zone_id
     LEFT JOIN access_control_cities acc ON acc.access_control_id = ac.id
     LEFT JOIN city                  ct  ON ct.id   = acc.city_id
     GROUP BY ac.id
     ORDER BY ac.created_at DESC`;
  }

  const [rows] = await pool.query(query);

  return rows.map((row) => ({
    ...row,
    region_ids: row.region_ids ? row.region_ids.split(",").map(Number) : [],
    region_names: row.region_names ? row.region_names.split(",") : [],
    zone_ids: row.zone_ids ? row.zone_ids.split(",").map(Number) : [],
    zone_names: row.zone_names ? row.zone_names.split(",") : [],
    city_ids: row.city_ids ? row.city_ids.split(",").map(Number) : [],
    city_names: row.city_names ? row.city_names.split(",") : [],
  }));
};

// ==============================
// INSERT ACCESS CONTROL
// ==============================
export const insertAccessControl = async (payload) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      employee_id,
      department_id,
      subdepartment_id,
      role_id,
      reporting_manager_id,
      region_ids = [],
      zone_ids = [],
      city_ids = [],
    } = payload;

    // Step 1: Main row (without location - only employee & department info)
    const [result] = await connection.query(
      `INSERT INTO access_control
         (employee_id, department_id, subdepartment_id, reporting_manager_id)
       VALUES (?, ?, ?, ?)`,
      [employee_id, department_id, subdepartment_id, reporting_manager_id],
    );

    const ac_id = result.insertId;

    // Step 2: Regions
    if (region_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_regions (access_control_id, region_id) VALUES ?`,
        [region_ids.map((rid) => [ac_id, rid])],
      );
    }

    // Step 3: Zones
    if (zone_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_zones (access_control_id, zone_id) VALUES ?`,
        [zone_ids.map((zid) => [ac_id, zid])],
      );
    }

    // Step 4: Cities
    if (city_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_cities (access_control_id, city_id) VALUES ?`,
        [city_ids.map((cid) => [ac_id, cid])],
      );
    }

    await connection.commit();
    return ac_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ==============================
// UPDATE ACCESS CONTROL
// ==============================
export const updateAccessControl = async (ac_id, payload) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      employee_id,
      department_id,
      subdepartment_id,
      reporting_manager_id,
      region_ids = [],
      zone_ids = [],
      city_ids = [],
    } = payload;

    // Step 1: Update main row (without location - only employee & department info)
    await connection.query(
      `UPDATE access_control
       SET employee_id = ?, department_id = ?, subdepartment_id = ?,
           reporting_manager_id = ?
       WHERE id = ?`,
      [
        employee_id,
        department_id,
        subdepartment_id,
        reporting_manager_id,
        ac_id,
      ],
    );

    // Step 2: Delete old mappings
    await connection.query(
      `DELETE FROM access_control_regions WHERE access_control_id = ?`,
      [ac_id],
    );
    await connection.query(
      `DELETE FROM access_control_zones   WHERE access_control_id = ?`,
      [ac_id],
    );
    await connection.query(
      `DELETE FROM access_control_cities  WHERE access_control_id = ?`,
      [ac_id],
    );

    // Step 3: Re-insert regions
    if (region_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_regions (access_control_id, region_id) VALUES ?`,
        [region_ids.map((rid) => [ac_id, rid])],
      );
    }

    // Step 4: Re-insert zones
    if (zone_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_zones (access_control_id, zone_id) VALUES ?`,
        [zone_ids.map((zid) => [ac_id, zid])],
      );
    }

    // Step 5: Re-insert cities
    if (city_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_cities (access_control_id, city_id) VALUES ?`,
        [city_ids.map((cid) => [ac_id, cid])],
      );
    }

    // Step 3: Re-insert
    if (region_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_regions (access_control_id, region_id) VALUES ?`,
        [region_ids.map((rid) => [ac_id, rid])],
      );
    }
    if (zone_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_zones (access_control_id, zone_id) VALUES ?`,
        [zone_ids.map((zid) => [ac_id, zid])],
      );
    }
    if (city_ids.length > 0) {
      await connection.query(
        `INSERT INTO access_control_cities (access_control_id, city_id) VALUES ?`,
        [city_ids.map((cid) => [ac_id, cid])],
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ==============================
// DELETE ACCESS CONTROL
// ==============================
export const deleteAccessControl = async (ac_id) => {
  // CASCADE se child tables automatically delete hongi
  await pool.query(`DELETE FROM access_control WHERE id = ?`, [ac_id]);
  return true;
};
