import { Router } from "express";
import {
  createCity,
  getAllCity,
  getCityByIdHandler,
} from "./city.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/").post(createCity);
router.route("/by-id/:cityId").get(getCityByIdHandler);
router.route("/:zoneId").get(getAllCity);

export default router;
