import { pool } from "../../config/mySqlDB.js";
import { randomUUID } from "crypto";

/* ---------- QUESTIONS ---------- */
export const getQuestions = async ({
  department,
  subDepartment,
  moduleKey,
}) => {
  const [rows] = await pool.query(
    `SELECT id, question_text AS text
     FROM training_map_questions
     WHERE department = ? AND sub_department = ? AND module_key = ?
     ORDER BY sort_order, id`,
    [department, subDepartment, moduleKey],
  );
  return rows;
};

// Purane questions ko UPDATE/INSERT karta hai taaki question id na badle
export const replaceQuestions = async ({
  department,
  subDepartment,
  moduleKey,
  questions,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      `SELECT id FROM training_map_questions
       WHERE department = ? AND sub_department = ? AND module_key = ?
       ORDER BY sort_order, id`,
      [department, subDepartment, moduleKey],
    );

    // 1) existing questions update
    for (let i = 0; i < questions.length && i < existing.length; i++) {
      await conn.query(
        `UPDATE training_map_questions
         SET question_text = ?, sort_order = ? WHERE id = ?`,
        [questions[i], i + 1, existing[i].id],
      );
    }

    // 2) naye extra questions insert
    if (questions.length > existing.length) {
      const values = questions
        .slice(existing.length)
        .map((q, i) => [
          department,
          subDepartment,
          moduleKey,
          q,
          existing.length + i + 1,
        ]);

      await conn.query(
        `INSERT INTO training_map_questions
         (department, sub_department, module_key, question_text, sort_order)
         VALUES ?`,
        [values],
      );
    }

    // 3) hataye gaye questions delete
    if (existing.length > questions.length) {
      const removeIds = existing.slice(questions.length).map((r) => r.id);
      await conn.query(`DELETE FROM training_map_questions WHERE id IN (?)`, [
        removeIds,
      ]);
    }

    await conn.commit();
    return { count: questions.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ---------- ANSWERS ---------- */
export const createMapAnswers = async ({
  employeeId,
  department,
  subDepartment,
  moduleKey,
  answers,
}) => {
  const batchId = randomUUID();

  const values = answers.map((item) => [
    batchId,
    employeeId,
    department,
    subDepartment,
    moduleKey,
    item.questionId || null,
    item.question,
    item.answer,
  ]);

  const [result] = await pool.query(
    `INSERT INTO training_map_query
     (batch_id, employee_id, department, sub_department, module_key,
      question_id, question, answer)
     VALUES ?`,
    [values],
  );

  return { count: result.affectedRows, batchId };
};

export const getMapAnswers = async ({
  employeeId,
  department,
  subDepartment,
  moduleKey,
}) => {
  const [rows] = await pool.query(
    `SELECT id, batch_id, question_id, question, answer, created_at
     FROM training_map_query
     WHERE employee_id = ? AND department = ?
       AND sub_department = ? AND module_key = ?
       AND batch_id = (
         SELECT batch_id FROM training_map_query
         WHERE employee_id = ? AND department = ?
           AND sub_department = ? AND module_key = ?
         ORDER BY created_at DESC, id DESC LIMIT 1
       )
     ORDER BY id ASC`,
    [
      employeeId,
      department,
      subDepartment,
      moduleKey,
      employeeId,
      department,
      subDepartment,
      moduleKey,
    ],
  );
  return rows;
};

// Har employee ka sirf latest batch
export const getAllMapAnswers = async ({
  department,
  subDepartment,
  moduleKey,
}) => {
  const [rows] = await pool.query(
    `SELECT t.id, t.batch_id, t.employee_id, t.module_key,
            t.question_id, t.question, t.answer, t.created_at
     FROM training_map_query t
     JOIN (
       SELECT x.employee_id, x.batch_id
       FROM training_map_query x
       JOIN (
         SELECT employee_id, MAX(id) AS max_id
         FROM training_map_query
         WHERE department = ? AND sub_department = ? AND module_key = ?
         GROUP BY employee_id
       ) m ON m.max_id = x.id
     ) latest
       ON latest.employee_id = t.employee_id AND latest.batch_id = t.batch_id
     WHERE t.department = ? AND t.sub_department = ? AND t.module_key = ?
     ORDER BY t.employee_id, t.id`,
    [
      department,
      subDepartment,
      moduleKey,
      department,
      subDepartment,
      moduleKey,
    ],
  );
  return rows;
};
