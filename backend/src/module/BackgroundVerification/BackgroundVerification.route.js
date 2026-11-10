import { Router } from "express";
import {
  createBackgroundVerification,
  getAllBackgroundVerifications,
} from "./BackgroundVerification.controller.js";

const router = Router();

router.route("/").post(createBackgroundVerification);
router.route("/").get(getAllBackgroundVerifications);

export default router;
