import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  createDutyRosterController,
  getDutyRosterListController,
  getEmployeesDutyroster,
  updatePunchOutController,
} from "./dutyroster.controller.js";

const router = Router();
router.route("/empleedutyroster").get(getEmployeesDutyroster);
router.route("/").post(verifyJWT, createDutyRosterController);
router.route("/").get(verifyJWT, getDutyRosterListController);

router.route("/update").put(verifyJWT, updatePunchOutController);
// router.route("/status").patch(updateStatusController);

export default router;
