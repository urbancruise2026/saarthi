// // this code use to how to empliment access our codes

// import express from "express";
// import { authorizeView, authorizeManage } from "./accessControl.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { pool } from "../db/pool.js";

// const router = express.Router();

// // -----------------------------------------------------------------------------
// // 1) ATTENDANCE — view own/team/all, manage (half-day/leave mark) own-team/all
// // -----------------------------------------------------------------------------
// router.get(
//   "/attendance/:employeeId?",
//   verifyJWT,
//   authorizeView(pool, (req) => req.params.employeeId),
//   (req, res) => {
//     // req.resolvedEmployeeId is already access-checked here
//     res.json({ message: `Attendance for employee ${req.resolvedEmployeeId}` });
//   },
// );

// router.post(
//   "/attendance/mark",
//   verifyJWT,
//   authorizeManage(pool, (req) => req.body.employee_id),
//   (req, res) => {
//     res.json({ message: `Marked attendance for ${req.resolvedEmployeeId}` });
//   },
// );

// // -----------------------------------------------------------------------------
// // 2) LEAVE REQUESTS — employee CAN manage their own (submit a request),
// //    so selfAllowed: true here — unlike attendance.
// // -----------------------------------------------------------------------------
// router.get(
//   "/leave-requests/:employeeId?",
//   verifyJWT,
//   authorizeView(pool, (req) => req.params.employeeId),
//   (req, res) => {
//     res.json({ message: `Leave requests for ${req.resolvedEmployeeId}` });
//   },
// );

// router.post(
//   "/leave-requests",
//   verifyJWT,
//   authorizeManage(pool, (req) => req.body.employee_id, { selfAllowed: true }),
//   (req, res) => {
//     res.json({
//       message: `Leave request submitted for ${req.resolvedEmployeeId}`,
//     });
//   },
// );

// // Approving a leave request, though, should NOT be self-allowed —
// // only HR/SuperAdmin/their manager should approve.
// router.patch(
//   "/leave-requests/:leaveRequestId/approve",
//   verifyJWT,
//   authorizeManage(
//     pool,
//     (req) => req.body.employee_id /* selfAllowed defaults to false */,
//   ),
//   (req, res) => {
//     res.json({ message: `Leave approved for ${req.resolvedEmployeeId}` });
//   },
// );

// // -----------------------------------------------------------------------------
// // 3) PAYROLL — same helper, completely different module, zero duplicated logic.
// // -----------------------------------------------------------------------------
// router.get(
//   "/payroll/:employeeId?",
//   verifyJWT,
//   authorizeView(pool, (req) => req.params.employeeId),
//   (req, res) => {
//     res.json({ message: `Payroll for ${req.resolvedEmployeeId}` });
//   },
// );

// export default router;
