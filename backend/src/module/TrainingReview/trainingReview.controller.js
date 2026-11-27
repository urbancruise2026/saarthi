import { pool } from "../../config/mySqlDB.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  upsertTrainingReview,
  getReviewsByEmployee,
  getAllReviews,
} from "./trainingReview.model.js";

const DEPARTMENTS = { sales: ["presales", "telesales"] };

// ✅ Review save (employeeId token se aata hai, body se nahi)
const saveTrainingReview = asyncHandler(async (req, res) => {
  const employeeId = req.user?.id;
  if (!employeeId) throw new ApiError(401, "Unauthorized");

  const department = String(req.body.department || "").toLowerCase();
  const subDepartment = String(req.body.subDepartment || "").toLowerCase();
  const day = Number(req.body.day);
  const understood = String(req.body.understood || "");
  const assistance = String(req.body.assistance || "");
  const learned = String(req.body.learned || "").trim();
  const suggestions = String(req.body.suggestions || "").trim();
  const assistanceDetails = String(req.body.assistanceDetails || "").trim();
  const moduleName = String(req.body.moduleName || "")
    .trim()
    .slice(0, 150);

  if (!DEPARTMENTS[department]?.includes(subDepartment))
    throw new ApiError(400, "Invalid department or sub department");
  if (!Number.isInteger(day) || day < 1 || day > 8)
    throw new ApiError(400, "Day must be between 1 and 8");
  if (!["yes", "no"].includes(understood))
    throw new ApiError(400, "Understood must be yes or no");
  if (!["yes", "no"].includes(assistance))
    throw new ApiError(400, "Assistance must be yes or no");
  if (!learned) throw new ApiError(400, "Please write what you learned");
  if (assistance === "yes" && !assistanceDetails)
    throw new ApiError(400, "Please specify what assistance you require");

  const review = await upsertTrainingReview({
    employeeId,
    department,
    subDepartment,
    day,
    moduleName,
    understood,
    learned,
    suggestions,
    assistance,
    assistanceDetails: assistance === "yes" ? assistanceDetails : "",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review saved successfully"));
});

// ✅ Current employee ke apne reviews
const getMyTrainingReviews = asyncHandler(async (req, res) => {
  const employeeId = req.user?.id;
  if (!employeeId) throw new ApiError(401, "Unauthorized");

  const subDepartment = String(req.query.subDepartment || "").toLowerCase();
  if (!subDepartment) throw new ApiError(400, "subDepartment is required");

  const reviews = await getReviewsByEmployee({ employeeId, subDepartment });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

// ✅ Sabhi reviews: SUPER_ADMIN / HR / HR Ops & Admin Manager
const getAllTrainingReviews = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const [[me]] = await pool.execute(
    `SELECT * FROM uc_staff_profile WHERE id = ? LIMIT 1`,
    [userId],
  );

  // Pehli baar chalake terminal me columns dekho, phir ye line hata dena
  console.log("ME:", me);

  const accessRole = String(
    me?.access_role ?? me?.accessRole ?? req.user?.access_role ?? req.user?.accessRole ?? "",
  ).toUpperCase();

  const isAdminManager =
    (me?.department_name === "HR" || req.user?.department_name === "HR") &&
    (me?.subDepartment_name === "Ops & Admin" ||
      req.user?.subDepartment_name === "Ops & Admin") &&
    (me?.role_name === "Admin Manager" ||
      me?.role === "Admin Manager" ||
      req.user?.role_name === "Admin Manager" ||
      req.user?.role === "Admin Manager");

  const allowed = ["SUPER_ADMIN", "HR"].includes(accessRole) || isAdminManager;

  if (!allowed)
    throw new ApiError(403, "You are not allowed to view this data");

  const subDepartment = String(req.query.subDepartment || "").toLowerCase();
  const search = String(req.query.search || "").trim();

  const result = await getAllReviews({
    subDepartment,
    search,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All reviews fetched successfully"));
});

export { saveTrainingReview, getMyTrainingReviews, getAllTrainingReviews };
