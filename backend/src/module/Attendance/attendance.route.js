import { Router } from "express";
import {
  getAttendanceController,
  getMonthlyAttendanceController,
  markAttendanceController,
  updateEarlyExitDetailsController,
  updatePunchOutController,
  updateStatusController,
} from "./attendance.contrroler.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .post(markAttendanceController)
  .get(verifyJWT, getAttendanceController);
router.route("/monthly").get(verifyJWT, getMonthlyAttendanceController);
router.route("/update").put(updatePunchOutController);
router.route("/status").patch(updateStatusController);
router.route("/early-exit").patch(verifyJWT, updateEarlyExitDetailsController);

export default router;
