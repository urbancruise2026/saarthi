import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  findNoticeByTitle,
  getNoticeById,
  getNotices,
  insertNotice,
} from "./notice.model.js";

// Create Notice
export const createNotice = asyncHandler(async (req, res) => {
  const { title, category, notice_date, status, description } = req.body;
  console.log(req.body);
  if (!title || !category || !notice_date || !status) {
    throw new ApiError(
      400,
      "Title, category, notice_date and status are required",
    );
  }

  const allowedCategories = ["General", "Important", "Event", "Update"];

  if (!allowedCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  // Allowed status
  const allowedStatus = ["Active", "Inactive"];

  if (!allowedStatus.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  // Duplicate title check
  const existing = await findNoticeByTitle(title);

  if (existing) {
    throw new ApiError(409, "Notice already exists");
  }

  const noticeId = await insertNotice({
    title,
    category,
    notice_date,
    status,
    description,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { id: noticeId }, "Notice created successfully"),
    );
});

// Get All Notices (with optional category filter)
export const getAllNotices = asyncHandler(async (req, res) => {
  const { category = "all" } = req.query;

  const notices = await getNotices(category);

  return res
    .status(200)
    .json(new ApiResponse(200, notices, "Notices fetched successfully"));
});

// Get Single Notice by ID
export const getSingleNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await getNoticeById(id);

  if (!notice) {
    throw new ApiError(404, "Notice not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notice, "Notice fetched successfully"));
});
