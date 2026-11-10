import { pool } from "../../../config/mySqlDB.js";
import { v4 as generateUUID } from "uuid";

export const ZONE_TABLE = "zones";
export const REGION_TABLE = "regions";
export const EMPLOYEE_TABLE = "uc_staff_profile";

export const ZONE_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "zone_name",
  REGION_ID: "region_id",
  ZONE_MANAGER_ID: "zone_manager_id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

// ✅ Insert Zone
export const insertZone = async (data) => {
  const { zone_name, region_id, zone_manager_id = null } = data;
  const zoneUuid = generateUUID();

  const sql = `
    INSERT INTO ${ZONE_TABLE}
    (${ZONE_COLUMNS.UUID}, 
     ${ZONE_COLUMNS.NAME}, 
     ${ZONE_COLUMNS.REGION_ID},
     ${ZONE_COLUMNS.ZONE_MANAGER_ID})
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    zoneUuid,
    zone_name,
    region_id,
    zone_manager_id,
  ]);

  return {
    id: result.insertId,
    uuid: zoneUuid,
    zone_name,
    region_id,
    zone_manager_id,
    created_at: new Date(),
  };
};

// ✅ Get All Zones with Region + Manager Name
export const getZones = async (regionId) => {
  const [zones] = await pool.execute(
    `SELECT id, zone_name, region_id
     FROM zones
     WHERE region_id = ?
     ORDER BY zone_name ASC`,
    [regionId],
  );

  return zones;
};

// ✅ Get Zone by ID
export const getZoneById = async (id) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      z.*,
      r.region_name,
      e.name AS zone_manager_name
    FROM ${ZONE_TABLE} z
    JOIN ${REGION_TABLE} r ON z.region_id = r.id
    LEFT JOIN ${EMPLOYEE_TABLE} e 
      ON z.zone_manager_id = e.id
    WHERE z.${ZONE_COLUMNS.ID} = ?
    `,
    [id],
  );

  return rows[0] || null;
};

// ✅ Get Zone by UUID
export const getZoneByUUID = async (uuid) => {
  const [rows] = await pool.execute(
    `
    SELECT * 
    FROM ${ZONE_TABLE} 
    WHERE ${ZONE_COLUMNS.UUID} = ?
    `,
    [uuid],
  );

  return rows[0] || null;
};

// ✅ Find Zone by Name + Region (duplicate check)
export const findZoneByName = async (zoneName, regionId) => {
  const [rows] = await pool.execute(
    `
    SELECT * FROM ${ZONE_TABLE} 
    WHERE LOWER(${ZONE_COLUMNS.NAME}) = LOWER(?) 
    AND ${ZONE_COLUMNS.REGION_ID} = ?
    `,
    [zoneName, regionId],
  );

  return rows[0] || null;
};

// ✅ Get Zones by Region ID
export const getZonesByRegionId = async (regionId) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      z.*,
      e.name AS zone_manager_name
    FROM ${ZONE_TABLE} z
    LEFT JOIN ${EMPLOYEE_TABLE} e
      ON z.zone_manager_id = e.id
    WHERE z.${ZONE_COLUMNS.REGION_ID} = ?
    `,
    [regionId],
  );

  return rows;
};
