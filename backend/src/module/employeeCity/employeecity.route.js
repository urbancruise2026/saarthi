import { Router } from "express";
import { assignCity, getEmployeeCities } from "./employeecity.controller.js";
const router = Router();
router.route("/").post(assignCity);
router.route("/:employeeId").get(getEmployeeCities);
export default router;
