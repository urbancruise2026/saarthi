import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js"; // apna middleware
import {
  saveTrainingReview,
  getMyTrainingReviews,
  getAllTrainingReviews,
} from "./trainingReview.controller.js";

const router = Router();

router.use(verifyJWT); // login zaroori

router.route("/").post(saveTrainingReview);
router.route("/my").get(getMyTrainingReviews);
router.route("/all").get(getAllTrainingReviews); // ✅ naya

export default router;
