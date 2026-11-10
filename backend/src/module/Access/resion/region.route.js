import { Router } from "express";
import { allRegion, createRegion, } from "./region.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
const router = Router(verifyJWT);
router.route("/").post(createRegion)
router.route("/:countryId").get(allRegion);

export default router;
