import express from "express";
import {
  fetchQuestions,
  saveQuestions,
  submitMapAnswers,
  fetchMyMapAnswers,
  fetchAllMapAnswers,
} from "./trainingGoogleMap.controller.js";

const router = express.Router();

// questions (admin banata hai)
router.get("/questions", fetchQuestions);
router.post("/questions", saveQuestions);

// answers (employee submit karta hai)
router.post("/submit", submitMapAnswers);
router.get("/my", fetchMyMapAnswers);
router.get("/all", fetchAllMapAnswers);

export default router;
