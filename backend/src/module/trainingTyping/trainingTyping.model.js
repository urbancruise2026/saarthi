import { pool } from "../../config/mySqlDB.js";
const TypingModel = {
  // multiple rows ek saath insert
  async createMany(subDepartment, trainingDay, entries) {
    const values = entries.map((e) => [
      subDepartment,
      trainingDay,
      e.date,
      e.day,
      e.time,
      e.score,
    ]);

    const sql = `
      INSERT INTO typing_scores
        (sub_department, training_day, entry_date, day_name, entry_time, score)
      VALUES ?
    `;
    const [result] = await pool.query(sql, [values]);
    return result;
  },

  async getByDay(subDepartment, trainingDay) {
    const sql = `
      SELECT id,
             DATE_FORMAT(entry_date, '%Y-%m-%d') AS date,
             day_name AS day,
             TIME_FORMAT(entry_time, '%H:%i')    AS time,
             score
      FROM typing_scores
      WHERE sub_department = ? AND training_day = ?
      ORDER BY entry_date DESC, entry_time DESC
    `;
    const [rows] = await pool.query(sql, [subDepartment, trainingDay]);
    return rows;
  },

  async deleteById(id) {
    const [result] = await pool.query(
      "DELETE FROM typing_scores WHERE id = ?",
      [id],
    );
    return result;
  },
};




export default TypingModel;
