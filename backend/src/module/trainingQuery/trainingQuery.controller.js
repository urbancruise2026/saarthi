import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  answerTrainingQuery,
  createTrainingQueries,
  getAllQueries,
  getQueriesByEmployee,
} from "./trainingQuery.model.js";

const DEPARTMENTS = {
  sales: ["presales", "telesales"],
};

const MAX_QUESTIONS = 10;

// ======================================================
// RAISE TRAINING QUERY
// ======================================================

export const raiseTrainingQuery = asyncHandler(async (req, res) => {
  const department = String(req.body.department || "")
    .toLowerCase()
    .trim();

  const subDepartment = String(req.body.subDepartment || "")
    .toLowerCase()
    .trim();

  const day = Number(req.body.day);

  const moduleName = String(req.body.moduleName || "")
    .trim()
    .slice(0, 100);

  if (!DEPARTMENTS[department]?.includes(subDepartment)) {
    throw new ApiError(400, "Invalid department or sub department");
  }

  if (!Number.isInteger(day) || day < 1 || day > 8) {
    throw new ApiError(400, "Invalid training day");
  }

  const questions = (
    Array.isArray(req.body.questions) ? req.body.questions : []
  )
    .map((q) => String(q || "").trim())
    .filter(Boolean);

  if (!questions.length) {
    throw new ApiError(400, "At least one question is required");
  }

  if (questions.length > MAX_QUESTIONS) {
    throw new ApiError(
      400,
      `You can submit up to ${MAX_QUESTIONS} questions at once`,
    );
  }

  if (questions.some((q) => q.length < 5 || q.length > 1000)) {
    throw new ApiError(
      400,
      "Each question must be between 5 and 1000 characters",
    );
  }

  const employeeId = req.user?.id;

  if (!employeeId) {
    throw new ApiError(401, "Unauthorized");
  }

  const { count, batchId } = await createTrainingQueries({
    employeeId,
    department,
    subDepartment,
    day,
    moduleName,
    questions,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { count, batchId },
        `${count} question(s) submitted successfully`,
      ),
    );
});

// ======================================================
// GET ALL TRAINING QUERIES
// ======================================================

export const listTrainingQueries = asyncHandler(async (req, res) => {
  const { status, subDepartment, day, moduleName } = req.query;

  const rows = await getAllQueries({
    status,
    subDepartment,
    day: day ? Number(day) : undefined,
    moduleName,
  });

  const dayMap = new Map();

  for (const row of rows) {
    const moduleKey = row.module_name || "General";

    if (!dayMap.has(row.day)) {
      dayMap.set(row.day, new Map());
    }

    const moduleMap = dayMap.get(row.day);

    if (!moduleMap.has(moduleKey)) {
      moduleMap.set(moduleKey, []);
    }

    moduleMap.get(moduleKey).push({
      id: row.id,
      batchId: row.batch_id,
      employeeId: row.employee_id,
      department: row.department,
      subDepartment: row.sub_department,
      question: row.question,
      status: row.status,
      answer: row.answer,
      answeredBy: row.answered_by,
      answeredAt: row.answered_at,
      createdAt: row.created_at,
    });
  }

  const grouped = [...dayMap.entries()].map(([dayNo, moduleMap]) => ({
    day: dayNo,
    modules: [...moduleMap.entries()].map(([name, questions]) => ({
      moduleName: name,
      total: questions.length,
      questions,
    })),
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, grouped, "Training queries fetched successfully"),
    );
});

// ======================================================
// GET LOGGED-IN EMPLOYEE QUERIES
// ======================================================

export const listMyTrainingQueries = asyncHandler(async (req, res) => {
  const employeeId = req.user?.id;

  if (!employeeId) {
    throw new ApiError(401, "Unauthorized");
  }

  const rows = await getQueriesByEmployee(employeeId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, rows, "Your training queries fetched successfully"),
    );
});

// ======================================================
// ANSWER TRAINING QUERY
// ======================================================

export const answerQuery = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const answer = String(req.body.answer || "").trim();

  const answeredBy = req.user?.id;

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid query ID");
  }

  if (!answer) {
    throw new ApiError(400, "Answer is required");
  }

  if (answer.length > 5000) {
    throw new ApiError(400, "Answer cannot exceed 5000 characters");
  }

  if (!answeredBy) {
    throw new ApiError(401, "Unauthorized");
  }

  const affectedRows = await answerTrainingQuery({
    id,
    answer,
    answeredBy,
  });

  if (!affectedRows) {
    throw new ApiError(
      404,
      "Query not found or already has the requested answer",
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id,
        answer,
        status: "answered",
      },
      "Training query answered successfully",
    ),
  );
});
