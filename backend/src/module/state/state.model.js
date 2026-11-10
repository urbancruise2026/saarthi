import { pool } from "../../config/mySqlDB.js";

// Get all states
export const getAllStates = async () => {
  const [rows] = await pool.query(
    `SELECT id, stateName FROM states ORDER BY stateName`,
  );
  return rows;
};

// Get cities by state
export const getCitiesByState = async (stateId) => {
  const [rows] = await pool.query(
    `SELECT id, cityName 
     FROM statecities 
     WHERE state_id = ?
     ORDER BY cityName`,
    [stateId],
  );
  return rows;
};

// Get all cities with state
export const getAllCities = async () => {
  const [rows] = await pool.query(
    `SELECT MIN(id) as id, cityName 
     FROM statecities 
     GROUP BY cityName 
     ORDER BY cityName`,
  );
  return rows;
};
// Get states by city
export const getStatesByCity = async (cityName) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT s.id, s.stateName
     FROM states s
     JOIN statecities c ON s.id = c.state_id
     WHERE c.cityName = ?
     ORDER BY s.stateName`,
    [cityName],
  );

  return rows;
};

export const getGrades = async () => {
  console.log("----------------------grade--------------------");
  const [rows] = await pool.query(
    "SELECT id, gradeName, designation, created_at FROM grademaster ORDER BY id",
  );

  return rows || [];
};
