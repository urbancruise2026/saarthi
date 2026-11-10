// routes/authRoutes.js
import express from "express";
import { checkAuth, userLogout } from "./checkToken.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);
router.get("/check-auth", checkAuth);
router.post("/logout", userLogout);

export default router;
