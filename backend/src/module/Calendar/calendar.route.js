import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  createHolidayController,
  getEmployeeCalendarController,
  getHolidaysController,
} from "./calendar.contrroler.js";

const router = Router();

router.route("/").post(createHolidayController).get(getHolidaysController);

export default router;
