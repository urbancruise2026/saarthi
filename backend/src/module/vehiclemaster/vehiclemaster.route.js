import { Router } from "express";
import { getVehicleCodeList } from "./vehiclemaster.controller.js";

const router = Router();

router.get("/", getVehicleCodeList);

export default router;
