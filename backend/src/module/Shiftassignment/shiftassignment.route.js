import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  createShiftAssignmentHandler,
  getShiftAssignmentsHandler,
  updateShiftAssignmentHandler,
} from "./shiftassignment.contrroler.js";

const router = Router();

router
  .route("/")
  .post(createShiftAssignmentHandler)
  .get(verifyJWT, getShiftAssignmentsHandler);
router.route("/update/:id").put(updateShiftAssignmentHandler);

export default router;
