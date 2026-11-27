import { Router } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { uploadTrainingFile } from "../../middlewares/multer.middlewares.js";
import {
  uploadTrainingModule,
  getTrainingModules,
  deleteTrainingModule,
  fetchStartDate,
  updateStartDate,
} from "./traininModule.controller.js";

const router = Router();

const handleFileUpload = (req, res, next) => {
  uploadTrainingFile.single("file")(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File must be smaller than 100 MB"
        : err.message;
    return next(new ApiError(400, message));
  });
};

router
  .route("/")
  .get(getTrainingModules)
  .post(handleFileUpload, uploadTrainingModule);

// /:id se pehle likhna zaroori hai
router.route("/start-date").get(fetchStartDate).put(updateStartDate);

router.route("/:id").delete(deleteTrainingModule);

export default router;
