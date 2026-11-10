import { Router } from "express";
import {
  fetchAllCities,
  fetchcityBystate,
  fetchStates,
  getAllGareds,
} from "./state.controller.js";

const router = Router();

router.route("/").get(fetchStates);
router.route("/allcity").get(fetchAllCities);
router.get("/grades", getAllGareds); // pehle
router.get("/:cityName", fetchcityBystate); // last me

export default router;
