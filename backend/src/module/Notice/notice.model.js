import { pool } from "../../config/mySqlDB.js";

export const getNotices = async (category = "all") => {
  let query = `SELECT * FROM notices`;
  let values = [];

  if (category !== "all") {
    query += ` WHERE category = ?`;
    values.push(category);
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.execute(query, values);

  return rows;
};

export const findNoticeByTitle = async (title) => {
  const query = `SELECT * FROM notices WHERE title = ? LIMIT 1`;
  const [rows] = await pool.execute(query, [title]);

  return rows[0] || null;
};

export const insertNotice = async ({
  title,
  category,
  notice_date,
  status,
  description,
}) => {
  const query = `
    INSERT INTO notices (
      title,
      category,
      notice_date,
      status,
      description
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [title, category, notice_date, status, description || null];

  const [result] = await pool.execute(query, values);

  return result.insertId;
};

export const getNoticeById = async (id) => {
  const query = `SELECT * FROM notices WHERE id = ? LIMIT 1`;
  const [rows] = await pool.execute(query, [id]);

  return rows[0] || null;
};
