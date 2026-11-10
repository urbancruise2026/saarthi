import { Router } from "express";
import { travelCityList } from "./travelCity.controller.js";

const router = Router();

router.route("/").get(travelCityList);

export default router;
