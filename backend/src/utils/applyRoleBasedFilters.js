// utils/applyRoleBasedFilters.js (ya jahan bhi apne shared utils rakhte ho)

/**
 
 *
 * @param {Object} filters - filters object (mutate hoga)
 * @param {Object} req - express request (req.user se role/userId/subDepartment nikalne ke liye)
 * @param {Object} options - extra options
 * @param {string} [options.firstDay] - current month ka start date (EMPLOYEE/default case ke liye)
 * @param {string} [options.lastDay] - current month ka end date (EMPLOYEE/default case ke liye)
 * @param {boolean} [options.clearAttendanceDate] - EMPLOYEE case mein attendanceDate delete karna hai ya nahi
 */
export const applyRoleBasedFilters = (
  filters,
  req,
  { firstDay, lastDay, clearAttendanceDate = false } = {},
) => {
  const role = req.user.access_role;
  const userId = req.user.id;
  const subDepartment = req.user.subDepartment;

  const isOpsAdminManager =
    role === "MANAGER" && subDepartment === "Ops & Admin";

  if (isOpsAdminManager) {
    return filters;
  }

  switch (role) {
    case "EMPLOYEE":
      filters.employeeId = userId;

      if (firstDay) filters.startDate = firstDay;
      if (lastDay) filters.endDate = lastDay;

      if (clearAttendanceDate) {
        delete filters.attendanceDate;
      }
      break;

    case "TEAM_LEAD":
    case "MANAGER":
      filters.managerId = userId;
      break;

    case "HOD":
      filters.hodId = userId;
      break;

    case "ZONAL_HEAD":
      filters.zonalHeadId = userId;
      break;

    case "SUPER_ADMIN":
      break;

    default:
      filters.employeeId = userId;

      if (firstDay) filters.startDate = firstDay;
      if (lastDay) filters.endDate = lastDay;
      break;
  }

  return filters;
};
 