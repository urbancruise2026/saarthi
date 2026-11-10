import { Router } from "express";
import { getCompOffBalanceByEmployee, getCompOffController } from "./compOff.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();
router.route("/").get(verifyJWT, getCompOffController);
router.route("/:employeeId").get(getCompOffBalanceByEmployee);
export default router;
