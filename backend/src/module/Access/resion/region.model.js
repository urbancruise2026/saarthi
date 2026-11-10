import { pool } from "../../../config/mySqlDB.js";
import { generateUUID } from "../../../utils/uuid.js";

export const REGION_TABLE = "regions";

export const REGION_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "region_name",
  BDM_ID: "bdm_id",
  CREATED_AT: "created_at",
};

export const insertRegion = async (data) => {
  const { region_name, bdm_id } = data;
  const regionUuid = generateUUID();

  const sql = `
    INSERT INTO ${REGION_TABLE} 
    (${REGION_COLUMNS.UUID}, ${REGION_COLUMNS.NAME}, ${REGION_COLUMNS.BDM_ID})
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [regionUuid, region_name, bdm_id]);

  return {
    id: result.insertId,
    uuid: regionUuid,
    region_name,
    created_at: new Date(),
  };
};

//  Get All Regions
export const getRegions = async (countryId) => {
  const parsedCountryId = Number(countryId);

  if (!parsedCountryId) {
    throw new Error("Valid countryId is required");
  }

  console.log("country id model:", parsedCountryId);

  const [regions] = await pool.execute(
    `SELECT id, region_name, country_id
     FROM regions
     WHERE country_id = ?`,
    [parsedCountryId],
  );

  console.log("regions result:", regions);

  return regions;
};

// Get Region by ID
export const getRegionById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${REGION_TABLE} WHERE ${REGION_COLUMNS.ID} = ?`,
    [id],
  );
  return rows[0] || null;
};

export const getRegionByUUID = async (uuid) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${REGION_TABLE} WHERE ${REGION_COLUMNS.UUID} = ?`,
    [uuid],
  );
  return rows[0] || null;
};

export const findRegionByName = async (regionName, bdm_id) => {
  const [rows] = await pool.execute(
    `
    SELECT * FROM ${REGION_TABLE} 
    WHERE LOWER(${REGION_COLUMNS.NAME}) = LOWER(?) 
    AND ${REGION_COLUMNS.BDM_ID} = ?
    `,
    [regionName, bdm_id],
  );

  return rows[0] || null;
};

export const updateRegionById = async (uuid, data) => {
  const [result] = await pool.execute(
    `UPDATE ${REGION_TABLE}
     SET ${REGION_COLUMNS.REGION_NAME} = ?, 
         ${REGION_COLUMNS.REGION_BDM_ID} = ?, 
         updated_at = NOW()
     WHERE ${REGION_COLUMNS.UUID} = ?`,
    [data.region_name, data.bdm_id, uuid],
  );

  return result.affectedRows > 0;
};
