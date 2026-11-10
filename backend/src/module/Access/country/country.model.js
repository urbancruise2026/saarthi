import { pool } from "../../../config/mySqlDB.js";
import { generateUUID } from "../../../utils/uuid.js";

const COUNTRY_TABLE = "access_countries";

export const findCountryByName = async (country_name, ceo_id) => {
  const sql = `
    SELECT 
      id,
      country_name,
      ceo_id,
      created_at
    FROM ${COUNTRY_TABLE}
    WHERE country_name = ?
      AND ceo_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [country_name, ceo_id]);

  return rows[0] || null;
};

export const insertCountry = async (data) => {
  const { country_name, ceo_id } = data;
  const countryUuid = generateUUID();

  const sql = `
    INSERT INTO ${COUNTRY_TABLE}
    (uuid, country_name, ceo_id)
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [countryUuid, country_name, ceo_id]);

  return {
    id: result.insertId,
    uuid: countryUuid,
    country_name,
    ceo_id,
    created_at: new Date(),
  };
};

export const getCountries = async () => {
  const sql = `
    SELECT 
      id,
      country_name,
      ceo_id,
      created_at
    FROM ${COUNTRY_TABLE}
    ORDER BY id DESC
  `;

  const [rows] = await pool.execute(sql);

  return rows;
};
