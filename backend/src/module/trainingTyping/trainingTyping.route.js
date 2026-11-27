import { Router } from "express";
import {
  addTypingScores,
  deleteTypingScore,
  getTypingScores,
} from "./trainingTyping.controller.js";

const router = Router();

router.post("/", addTypingScores);
router.get("/", getTypingScores);
router.delete("/:id", deleteTypingScore);

export default router;
