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

router.route("/").post(registerUser);
router.route("/").get(getAllEmployee);
router.route("/login").post(loginUser);
router.route("/employeesearchlist").get(getEmployees);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/hr-employees").get(getHREmployeesController);
router.route("/:uuid").put(updateUserRoleManagerDepartment);
router.route("/by-role/:id").get(getUserDetailsByRole);

router.route("/update/:id").put(updateUserByIdController);
router.route("/status").get(getEmployeeBYStatus);
router.route("/updatestatus/:id").patch(updateEmployeeStatusController);
router.route("/:id").get(getSingaleUser);

router.route("/change-password").post(verifyJWT, changePassword);
router.route("/changepasswordbyusername").post(changePasswordbyUserName);
router
  .route("/reporting-managers/:departmentName")
  .get(getAllReportingManagerWithDepartment);

export default router;
