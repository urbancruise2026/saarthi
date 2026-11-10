import express from "express";
import {
  getAll,
  getByEmployeeId,
  create,
  update,
  remove,
} from "./Accesscontrol.controller.js";

const router = express.Router();

router.get("/", getAll);
router.get("/employee/:employeeId", getByEmployeeId);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
