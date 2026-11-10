import { pool } from "../../config/mySqlDB.js";

export const VEHICLEMASTER_TABLE = "vehiclemaster"; // ✅ correct table name

export const VEHICLEMASTER_COLUMNS = {
  ID: "id",
  NAME: "name",
  CODE: "code",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const getVehicles = async () => {
  try {
    const query = `
      SELECT 
        ${VEHICLEMASTER_COLUMNS.CODE},
        ${VEHICLEMASTER_COLUMNS.NAME}
      FROM ${VEHICLEMASTER_TABLE}
      ORDER BY ${VEHICLEMASTER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("❌ Error in getVehicles:", error.message);
    throw error;
  }
};
