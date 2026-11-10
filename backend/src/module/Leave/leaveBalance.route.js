import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js"; // apna path
import { getSummaryController } from "./LeaveBalance.controllers.js";
import { getMyBalanceController } from "./LeaveBalance.controllers.js";
import { getMyLedgerController } from "./LeaveBalance.controllers.js";
import { creditMonthlyController } from "./LeaveBalance.controllers.js";
import { carryForwardController } from "./LeaveBalance.controllers.js";

const router = Router();

router.get("/summary", verifyJWT, getSummaryController);

// Purane routes
router.get("/balance", verifyJWT, getMyBalanceController);
router.get("/ledger", verifyJWT, getMyLedgerController);
router.post("/credit-monthly", verifyJWT, creditMonthlyController);
router.post("/carry-forward", verifyJWT, carryForwardController);

export default router;
