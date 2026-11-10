import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./employeeSlice";
import notificationReducer from "./notificationSlice";
import letterReducer from "./letterSlice";
import userRedducer from "../redux/features/userSlice";
import departmentReducer from "../redux/features/department/departmentSlice";
import cityReducer from "../redux/features/travelcity/travelcitySlice";
import branchReducer from "../redux/features/branch/branchSlice";
import policyReducer from "../redux/features/policy/policySlice";
import stateReducer from "../redux/features/state/stateSlice";
import regionReducer from "../redux/features/Region/regionSlice";
import noticeReducer from "../redux/features/Notice/noticeSlice";
import zoneReducer from "../redux/features/Zone/zoneSlice";
import zoneCityReducer from "../redux/features/ZoneCity/zoneCitySlice";
import accessControlReducer from "../redux/features/Accesscontrol/accesscontrolSlice";
import countryReducer from "../redux/features/Country/countrySlice";
import bgvReducer from "../redux/features/BackgroundVerification/BackgroundVerificationSlice";
import atendanceReducer from "../redux/features/Attendance/attendanceSlice";
import shiftAssignmentReducer from "../redux/features/Shiftassignment/shiftassignmentSlice";
import holidayReducer from "../redux/features/Calendar/calendarSlice";
import dutyrosterReducer from "../redux/features/Dutyroster/Dutyrosterslice";
import leaveReducer from "../redux/features/Leave/leaveSlice";
import compOffsReducer from "../redux/features/Compoff/Compoffslice";

export const store = configureStore({
  reducer: {
    branch: branchReducer,
    citys: cityReducer,
    user: userRedducer,
    employees: employeeReducer,
    notifications: notificationReducer,
    letters: letterReducer,
    department: departmentReducer,
    policy: policyReducer,
    states: stateReducer,
    notice: noticeReducer,
    regions: regionReducer,
    zones: zoneReducer,
    zoneCities: zoneCityReducer,
    accessControl: accessControlReducer,
    country: countryReducer,
    bgv: bgvReducer,
    attendance: atendanceReducer,
    shiftAssignment: shiftAssignmentReducer,
    holiday: holidayReducer,
    dutyRoster: dutyrosterReducer,
    leave: leaveReducer,
    compOffs: compOffsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
