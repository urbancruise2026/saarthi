import { pool } from "../../config/mySqlDB.js";
import { generateUUID } from "../../utils/uuid.js";

export const TRAVEL_CITY_TABLE = "travelcity";

export const TRAVEL_CITY_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "cityName",
};

export const insertTravelCity = async (data) => {
  const { cityName } = data;
  const travelCityUuid = generateUUID();

  const sql = `
    INSERT INTO ${TRAVEL_CITY_TABLE}
    (${TRAVEL_CITY_COLUMNS.UUID}, ${TRAVEL_CITY_COLUMNS.NAME})
    VALUES (?, ?)
  `;

  const [result] = await pool.execute(sql, [travelCityUuid, cityName]);

  return {
    id: result.insertId,
    uuid: travelCityUuid,
    cityName,
  };
};

export const getTravelCities = async () => {
  const sql = `
    SELECT *
    FROM ${TRAVEL_CITY_TABLE}
    ORDER BY ${TRAVEL_CITY_COLUMNS.NAME} ASC
  `;

  const [rows] = await pool.execute(sql);
  return rows;
};


export const getTravelCityById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TRAVEL_CITY_TABLE} WHERE ${TRAVEL_CITY_COLUMNS.ID} = ?`,
    [id],
  );
  return rows[0] || null;
};


export const getTravelCityByUUID = async (uuid) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TRAVEL_CITY_TABLE} WHERE ${TRAVEL_CITY_COLUMNS.UUID} = ?`,
    [uuid],
  );
  return rows[0] || null;
};

export const findTravelCityByName = async (cityName) => {
  const [rows] = await pool.execute(
    `
    SELECT * FROM ${TRAVEL_CITY_TABLE}
    WHERE LOWER(${TRAVEL_CITY_COLUMNS.NAME}) = LOWER(?)
    `,
    [cityName],
  );

  return rows[0] || null;
};
