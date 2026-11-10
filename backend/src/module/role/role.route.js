import { Router } from "express";
import { createRole, getAllRoles } from "./role.controller.js";
const router = Router();
router.route("/").post(createRole).get(getAllRoles);
export default router;
