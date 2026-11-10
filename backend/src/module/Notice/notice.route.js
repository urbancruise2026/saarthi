import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  createNotice,
  getAllNotices,
  getSingleNotice,
} from "./notice.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createNotice).get(getAllNotices);
router.route("/:id").get(getSingleNotice);

export default router;
