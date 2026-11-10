import { Router } from "express";
import {
  createPolicy,
  deletePolicyController,
  getAllPolicies,
  getSinglePolicy,
  hrHeadApproval,
  shoApproval,
  updatePolicyController,
} from "./Policy.controller.js";

const router = Router();

router.route("/").post(createPolicy).get(getAllPolicies);
router
  .route("/:id")
  .get(getSinglePolicy)
  .put(updatePolicyController)
  .delete(deletePolicyController);

router.route("/sho_approval/:id").patch(shoApproval);
router.route("/hr_approval/:id").patch(hrHeadApproval);
export default router;
