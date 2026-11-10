import { Router } from "express";
import {
  createLeads,
  getAllCustomersController,
  listLeads,
  searchCustomerController,
  updateLeadByIdController,
} from "./lead.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/").post(createLeads);
router.route("/").get(listLeads);
router.route("/customer/search").get(searchCustomerController);
router.route("/customer/all").get(getAllCustomersController);
router.route("/:leadId").put(updateLeadByIdController);

export default router;
