import { Router } from "express";
import {
  createDepartment,
  getAllDepartment,
  getDepartmentRoles,
  getHoByDepartment,
  getRolesSubDepartment,
} from "./department.controller.js";

const router = Router();
router.route("/").post(createDepartment).get(getAllDepartment);
router.route("/:department_id").get(getDepartmentRoles);
router.route("/ho/:department_id").get(getHoByDepartment);
router.route("/role/:subDepartment_id").get(getRolesSubDepartment);
export default router;
