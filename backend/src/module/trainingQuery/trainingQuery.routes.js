import { Router } from "express";

import {
  raiseTrainingQuery,
  listTrainingQueries,
  listMyTrainingQueries,
  answerQuery,
} from "./trainingQuery.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Raise a new training query
router.post("/", raiseTrainingQuery);

// Get all training queries (Trainer / Manager)
router.get("/", listTrainingQueries);

// Get logged-in employee queries
router.get("/my", listMyTrainingQueries);

// Answer a particular training query
router.patch("/:id/answer", answerQuery);

export default router;
