import { randomUUID } from "crypto";
import { pool } from "../../config/mySqlDB.js";

// ======================================================
// CREATE MULTIPLE TRAINING QUERIES
// ======================================================

export const createTrainingQueries = async ({
  employeeId,
  department,
  subDepartment,
  day,
  moduleName,
  questions,
}) => {
  const batchId = randomUUID();

  const values = questions.map((question) => [
    batchId,
    employeeId,
    department,
    subDepartment,
    day,
    moduleName || null,
    question,
  ]);

  const [result] = await pool.query(
    `INSERT INTO training_queries
    (
      batch_id,
      employee_id,
      department,
      sub_department,
      day,
      module_name,
      question
    )
    VALUES ?`,
    [values],
  );

  return {
    count: result.affectedRows,
    batchId,
  };
};

// ======================================================
// GET EMPLOYEE QUERIES
// ======================================================

export const getQueriesByEmployee = async (employeeId) => {
  const [rows] = await pool.query(
    `SELECT
      id,
      batch_id,
      department,
      sub_department,
      day,
      module_name,
      question,
      status,
      answer,
      answered_by,
      answered_at,
      created_at
    FROM training_queries
    WHERE employee_id = ?
    ORDER BY created_at DESC, id DESC`,
    [employeeId],
  );

  return rows;
};

// ======================================================
// GET ALL TRAINING QUERIES (ADMIN / TRAINER)
// ======================================================

export const getAllQueries = async ({
  status,
  subDepartment,
  day,
  moduleName,
} = {}) => {
  const where = [];
  const params = [];

  if (status) {
    where.push("status = ?");
    params.push(status);
  }

  if (subDepartment) {
    where.push("sub_department = ?");
    params.push(subDepartment);
  }

  if (day !== undefined && day !== null) {
    where.push("day = ?");
    params.push(day);
  }

  if (moduleName) {
    where.push("module_name = ?");
    params.push(moduleName);
  }

  const [rows] = await pool.query(
    `SELECT
      id,
      batch_id,
      employee_id,
      department,
      sub_department,
      day,
      module_name,
      question,
      status,
      answer,
      answered_by,
      answered_at,
      created_at
    FROM training_queries
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY day ASC, module_name ASC, created_at DESC, id ASC`,
    params,
  );

  return rows;
};

// ======================================================
// GET QUERIES BY BATCH
// ======================================================

export const getQueriesByBatch = async (batchId) => {
  const [rows] = await pool.query(
    `SELECT
      id,
      question,
      status,
      answer,
      created_at
    FROM training_queries
    WHERE batch_id = ?
    ORDER BY id ASC`,
    [batchId],
  );

  return rows;
};

// ======================================================
// ANSWER TRAINING QUERY
// ======================================================

export const answerTrainingQuery = async ({ id, answer, answeredBy }) => {
  const [result] = await pool.query(
    `UPDATE training_queries
     SET
       answer = ?,
       status = 'answered',
       answered_by = ?,
       answered_at = NOW()
     WHERE id = ?`,
    [answer, answeredBy, id],
  );

  return result.affectedRows;
};
