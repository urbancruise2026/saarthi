import { Router } from "express";
import {
  changePassword,
  changePasswordbyUserName,
  getAllEmployee,
  getAllReportingManagerWithDepartment,
  getCurrentUser,
  getEmployeeBYStatus,
  getEmployees,
  getHREmployeesController,
  getSingaleUser,
  getUserDetailsByRole,
  loginUser,
  registerUser,
  updateEmployeeStatusController,
  updateUserByIdController,
  updateUserRoleManagerDepartment,
} from "./user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// ---------- Public routes (no token) ----------
router.route("/login").post(loginUser);
router.route("/changepasswordbyusername").post(changePasswordbyUserName);

// ---------- Protected routes ----------
router.use(verifyJWT); // iske neeche sab protected

router.route("/").post(registerUser).get(getAllEmployee);

// Static routes pehle
router.route("/employeesearchlist").get(getEmployees);
router.route("/current-user").get(getCurrentUser);
router.route("/hr-employees").get(getHREmployeesController);
router.route("/status").get(getEmployeeBYStatus);
router.route("/change-password").post(changePassword);
router
  .route("/reporting-managers/:departmentName")
  .get(getAllReportingManagerWithDepartment);
router.route("/by-role/:id").get(getUserDetailsByRole);
router.route("/update/:id").put(updateUserByIdController);
router.route("/updatestatus/:id").patch(updateEmployeeStatusController);

// Dynamic routes sabse last
router.route("/:id").get(getSingaleUser).put(updateUserRoleManagerDepartment);

export default router;
