import { Router } from "express";
import { createCountry, getAllCountry } from "./country.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
const router = Router(verifyJWT);

router.route("/").post(createCountry);
router.route("/").get(getAllCountry);

export default router;
