import { Router } from "express";
import {
  createBranchController,
  deleteBranchByIdController,
  getAllBranchesController,
  getBranchByIdController,
  updateBranchByIdController,
} from "./branch.controller.js";

const router = Router();

router.route("/").post(createBranchController).get(getAllBranchesController);
router
  .route("/:uuid")
  .get(getBranchByIdController)
  .put(updateBranchByIdController)
  .delete(deleteBranchByIdController);

export default router;
