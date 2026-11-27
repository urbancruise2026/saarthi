import fs from "fs";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../../utils/Cloudinary.js";

import {
  createTrainingModule,
  getTrainingModuleById,
  findTrainingModuleById,
  getAllTrainingModules,
  deleteTrainingModuleById,
  getStartDate,
  saveStartDate,
} from "./traininModule.model.js";

const DEPARTMENTS = { sales: ["presales", "telesales"] };
const CATEGORIES = ["lead_video", "lead_ppt"];
const MODULE_KEYS = [
  "joining",
  "veh1",
  "veh2",
  "veh3",
  "sales1",
  "sales2_basics",
  "sales2_ratechart",
];
const PPT_EXT = /\.(pptx?|ppsx?)$/i;
const MAX_PPT_SIZE = 20 * 1024 * 1024; // 20 MB (Cloudinary raw files ki limit)

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const cleanTempFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
};

// file se type nikaalo: "video" | "ppt" | null
const detectFileType = (file) => {
  if (file.mimetype.startsWith("video/")) return "video";
  if (PPT_EXT.test(file.originalname)) return "ppt";
  return null;
};

// ✅ Upload Training File
// form-data: department, subDepartment, category, moduleKey, file
const uploadTrainingModule = asyncHandler(async (req, res) => {
  const file = req.file;
  const department = String(req.body.department || "").toLowerCase();
  const subDepartment = String(req.body.subDepartment || "").toLowerCase();
  const category = String(req.body.category || "").toLowerCase();
  const moduleKey = String(req.body.moduleKey || "").toLowerCase();

  if (!file) throw new ApiError(400, "Video or PPT file is required");

  if (!DEPARTMENTS[department]?.includes(subDepartment)) {
    cleanTempFile(file);
    throw new ApiError(400, "Invalid department or sub department");
  }

  if (!CATEGORIES.includes(category)) {
    cleanTempFile(file);
    throw new ApiError(400, "Invalid category");
  }

  if (!MODULE_KEYS.includes(moduleKey)) {
    cleanTempFile(file);
    throw new ApiError(400, "Invalid module");
  }

  const fileType = detectFileType(file);
  if (!fileType) {
    cleanTempFile(file);
    throw new ApiError(400, "Only video or PPT/PPTX files are allowed");
  }

  // Lead Video me sirf video allowed
  if (category === "lead_video" && fileType !== "video") {
    cleanTempFile(file);
    throw new ApiError(400, "Lead Video me sirf video upload ho sakti hai");
  }

  if (fileType === "ppt" && file.size > MAX_PPT_SIZE) {
    cleanTempFile(file);
    throw new ApiError(400, "PPT must be smaller than 20 MB");
  }

  // Video -> "video", PPT -> "raw" (Cloudinary me documents raw hote hain)
  const uploaded = await uploadOnCloudinary(file.path, {
    folder: `hrms/training/${department}/${subDepartment}/${moduleKey}`,
    resourceType: fileType === "video" ? "video" : "raw",
    extra:
      fileType === "ppt" ? { use_filename: true, unique_filename: true } : {},
  });

  if (!uploaded) throw new ApiError(500, "Upload to Cloudinary failed");

  let insertId;
  try {
    insertId = await createTrainingModule({
      department,
      subDepartment,
      category,
      moduleKey,
      fileType,
      fileName: file.originalname,
      fileUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      duration: uploaded.duration,
    });
  } catch (error) {
    // DB fail hua to Cloudinary pe orphan file na bache
    await deleteFromCloudinary(
      uploaded.public_id,
      fileType === "video" ? "video" : "raw",
    );
    throw error;
  }

  const trainingModule = await getTrainingModuleById(insertId);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        trainingModule,
        `${category === "lead_video" ? "Lead Video" : "Lead PPT"} uploaded successfully`,
      ),
    );
});

// ✅ Get
// ?department=sales&subDepartment=telesales&category=lead_video|lead_ppt&moduleKey=veh1&fileType=video|ppt
const getTrainingModules = asyncHandler(async (req, res) => {
  const department = req.query.department
    ? String(req.query.department).toLowerCase()
    : undefined;
  const subDepartment = req.query.subDepartment
    ? String(req.query.subDepartment).toLowerCase()
    : undefined;
  const category = CATEGORIES.includes(String(req.query.category))
    ? String(req.query.category)
    : undefined;
  const moduleKey = MODULE_KEYS.includes(String(req.query.moduleKey))
    ? String(req.query.moduleKey)
    : undefined;
  const fileType = ["video", "ppt"].includes(String(req.query.fileType))
    ? String(req.query.fileType)
    : undefined;

  const modules = await getAllTrainingModules({
    department,
    subDepartment,
    category,
    moduleKey,
    fileType,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        modules || [],
        "Training modules fetched successfully",
      ),
    );
});

// ✅ Delete
const deleteTrainingModule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Training module ID is required");

  const trainingModule = await findTrainingModuleById(id);
  if (!trainingModule) throw new ApiError(404, "Training module not found");

  await deleteFromCloudinary(
    trainingModule.public_id,
    trainingModule.file_type === "ppt" ? "raw" : "video",
  );
  await deleteTrainingModuleById(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Training module deleted successfully"));
});

const readKeys = (src) => {
  const department = String(src.department || "").toLowerCase();
  const subDepartment = String(src.subDepartment || "").toLowerCase();
  if (!DEPARTMENTS[department]?.includes(subDepartment)) {
    throw new ApiError(400, "Invalid department or sub department");
  }
  return { department, subDepartment };
};

export const fetchStartDate = asyncHandler(async (req, res) => {
  const { department, subDepartment } = readKeys(req.query);
  const startDate = await getStartDate(department, subDepartment);
  return res
    .status(200)
    .json(new ApiResponse(200, { startDate }, "Start date fetched"));
});

export const updateStartDate = asyncHandler(async (req, res) => {
  // TODO: yahan bhi Admin Manager ka role check lagao (apne auth middleware ke hisaab se)
  const { department, subDepartment } = readKeys(req.body);
  const startDate = String(req.body.startDate || "");

  if (!DATE_RE.test(startDate) || Number.isNaN(Date.parse(startDate))) {
    throw new ApiError(400, "Invalid start date");
  }

  await saveStartDate(department, subDepartment, startDate);
  return res
    .status(200)
    .json(new ApiResponse(200, { startDate }, "Start date saved"));
});
export { uploadTrainingModule, getTrainingModules, deleteTrainingModule };
