import { Router } from "express";
import { createZone, getAllZone } from "./zone.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
const router = Router(verifyJWT)
router.route("/").post(createZone)
router.route("/:regionId").get(getAllZone)
export default router