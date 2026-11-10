import express from "express";
import { generateEmployeeFormLink } from "./onboardingLink.controller.js";


const router = express.Router();

router.get("/generate-onboarding-link", generateEmployeeFormLink);

export default router;
