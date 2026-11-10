import { pool } from "../../../config/mySqlDB.js";
import { v4 as generateUUID } from "uuid";

export const CITY_TABLE = "city";
export const ZONE_TABLE = "zones";
export const REGION_TABLE = "regions";

export const CITY_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "city_name",
  ZONE_ID: "zone_id",
  CREATED_AT: "created_at",
};

export const insertCity = async (data) => {
  const { city_name, zone_id } = data;
  const cityUuid = generateUUID();

  const sql = `
    INSERT INTO ${CITY_TABLE}
    (${CITY_COLUMNS.UUID}, ${CITY_COLUMNS.NAME}, ${CITY_COLUMNS.ZONE_ID})
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [cityUuid, city_name, zone_id]);

  return {
    id: result.insertId,
    uuid: cityUuid,
    city_name,
    zone_id,
    created_at: new Date(),
  };
};

export const getCities = async (zoneId) => {
  const [cities] = await pool.execute(
    `SELECT id, city_name, zone_id
     FROM city
     WHERE zone_id = ?
     ORDER BY city_name ASC`,
    [zoneId],
  );

  return cities;
};

export const getCityById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${CITY_TABLE} WHERE ${CITY_COLUMNS.ID} = ?`,
    [id],
  );
  return rows[0] || null;
};

export const getCityByUUID = async (uuid) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${CITY_TABLE} WHERE ${CITY_COLUMNS.UUID} = ?`,
    [uuid],
  );
  return rows[0] || null;
};

export const findCityByName = async (cityName, zoneId) => {
  const [rows] = await pool.execute(
    `
    SELECT * FROM ${CITY_TABLE}
    WHERE LOWER(${CITY_COLUMNS.NAME}) = LOWER(?)
    AND ${CITY_COLUMNS.ZONE_ID} = ?
    `,
    [cityName, zoneId],
  );

  return rows[0] || null;
};

export const getCitiesByZoneId = async (zoneId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${CITY_TABLE} WHERE ${CITY_COLUMNS.ZONE_ID} = ?`,
    [zoneId],
  );
  return rows;
};
