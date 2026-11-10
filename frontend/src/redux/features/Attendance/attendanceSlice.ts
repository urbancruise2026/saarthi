import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getAttendance,
  getMonthlyAttendance,
  getMyAttendance,
  markAttendance,
  updateAttendance,
  updateAttendanceStatus,
  updateEarlyExitDetails,
} from "./attendanceApi";

export interface AttendanceRecord {
  employee_id: number;
  attendance_id?: number | null;

  firstName?: string;
  middleName?: string;
  lastName?: string;

  full_name: string;

  department_id?: number | null;
  department_name: string | null;

  branchOffice_id?: number | null;
  branch_name?: string | null;

  attendance_date: string | null;

  status:
    | "Present"
    | "Absent"
    | "Half Day"
    | "Leave"
    | "Holiday"
    | "Pending"
    | null;

  punch_in: string | null;
  punch_out: string | null;

  shift_type: string | null;
  shift_timing: string | null;

  permanent_shift_type?: string | null;
  permanent_shift_timing?: string | null;

  temporary_shift_type?: string | null;
  temporary_shift_timing?: string | null;

  week_off?: string | null;
  from_date?: string | null;
  to_date?: string | null;

  shift_source?: "Permanent" | "Temporary";

  leave_type: string | null;
  remarks: string | null;
  early_exit_reason?: string | null; // NEW
  early_exit_approved_by?: number | null; // NEW
  attendanceId?: number | null; // record.attendance_id
  earlyExitReason?: string | null; // record.early_exit_reason
}

// ---- NEW: summary shape jo backend ab return karta hai ----
export interface AttendanceSummary {
  month: string;
  totalEmployee: number;
  present: number;
  absent: number;
  leave: number;
  compOff: number;
  lwp: number;
}

// ---- NEW: backend ka actual response shape ----
export interface AttendanceResponse {
  data: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface AttendanceFilters {
  date?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string | number;
  branchId?: string | number;
  departmentId?: string | number;
  status?: string;
}

interface AttendanceState {
  list: AttendanceRecord[];
  summary: AttendanceSummary | null; // NEW
  monthlyList: AttendanceRecord[];

  monthlyOverallSummary: {
    // NEW
    totalMinutes: number;
    totalHours: string;
    present: number;
    absent: number;
    lateMarks: number;
    halfDay: number;
  } | null;
  myAttendance: AttendanceRecord[];
  loading: boolean;
  marking: boolean;
  error: string | null;
}

export interface MonthlyAttendanceResponse {
  data: AttendanceRecord[];
  overallSummary: AttendanceState["monthlyOverallSummary"];
}
const initialState: AttendanceState = {
  list: [],
  summary: null,
  monthlyList: [],
  monthlyOverallSummary: null, // NEW
  myAttendance: [],
  loading: false,
  marking: false,
  error: null,
};

export const fetchAttendance = createAsyncThunk<
  AttendanceResponse, // CHANGED: pehle AttendanceRecord[] tha
  AttendanceFilters
>("attendance/fetchAttendance", async (filters = {}, { rejectWithValue }) => {
  try {
    return await getAttendance(filters);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// =======================
// Fetch My Attendance
// =======================

export const fetchMyAttendance = createAsyncThunk<
  AttendanceRecord[],
  Omit<AttendanceFilters, "employeeId" | "branchId" | "departmentId">
>("attendance/fetchMyAttendance", async (filters = {}, { rejectWithValue }) => {
  try {
    return await getMyAttendance(filters);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// =======================
// Mark Attendance
// =======================

export const markEmployeeAttendance = createAsyncThunk(
  "attendance/markEmployeeAttendance",
  async (
    payload: Parameters<typeof markAttendance>[0],
    { rejectWithValue },
  ) => {
    try {
      return await markAttendance(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchMonthlyAttendance = createAsyncThunk<
  AttendanceRecord[],
  AttendanceFilters
>(
  "attendance/fetchMonthlyAttendance",
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await getMonthlyAttendance(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateEmployeeAttendance = createAsyncThunk(
  "attendance/updateEmployeeAttendance",
  async (
    payload: Parameters<typeof updateAttendance>[0],
    { rejectWithValue },
  ) => {
    try {
      return await updateAttendance(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateEmployeeAttendanceStatus = createAsyncThunk(
  "attendance/updateEmployeeAttendanceStatus",
  async (
    payload: Parameters<typeof updateAttendanceStatus>[0],
    { rejectWithValue },
  ) => {
    try {
      return await updateAttendanceStatus(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateEmployeeEarlyExit = createAsyncThunk(
  "attendance/updateEmployeeEarlyExit",
  async (
    payload: Parameters<typeof updateEarlyExitDetails>[0],
    { rejectWithValue },
  ) => {
    try {
      return await updateEarlyExitDetails(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {
    clearAttendanceError(state) {
      state.error = null;
    },

    clearAttendance(state) {
      state.list = [];
      state.summary = null; // NEW
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchAttendance.fulfilled,
        (state, action: PayloadAction<AttendanceResponse>) => {
          state.loading = false;
          // CHANGED: backend { data, summary } bhejta hai — dono alag-alag store karo
          state.list = action.payload?.data ?? [];
          state.summary = action.payload?.summary ?? null;
        },
      )

      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // =======================
      // Fetch My Attendance
      // =======================

      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchMyAttendance.fulfilled,
        (state, action: PayloadAction<AttendanceRecord[]>) => {
          state.loading = false;
          state.myAttendance = action.payload;
        },
      )

      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // =======================
      // Mark Attendance
      // =======================

      .addCase(markEmployeeAttendance.pending, (state) => {
        state.marking = true;
        state.error = null;
      })

      .addCase(markEmployeeAttendance.fulfilled, (state) => {
        state.marking = false;
      })

      .addCase(markEmployeeAttendance.rejected, (state, action) => {
        state.marking = false;
        state.error = action.payload as string;
      })

      .addCase(updateEmployeeAttendance.pending, (state) => {
        state.marking = true;
        state.error = null;
      })

      .addCase(updateEmployeeAttendance.fulfilled, (state) => {
        state.marking = false;
      })

      .addCase(updateEmployeeAttendance.rejected, (state, action) => {
        state.marking = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonthlyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMonthlyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyList = action.payload?.data ?? [];
        state.monthlyOverallSummary = action.payload?.overallSummary ?? null;
      })

      .addCase(fetchMonthlyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEmployeeAttendanceStatus.pending, (state) => {
        state.marking = true;
        state.error = null;
      })

      .addCase(updateEmployeeAttendanceStatus.fulfilled, (state) => {
        state.marking = false;
      })

      .addCase(updateEmployeeAttendanceStatus.rejected, (state, action) => {
        state.marking = false;
        state.error = action.payload as string;
      })

      .addCase(updateEmployeeEarlyExit.pending, (state) => {
        state.marking = true;
        state.error = null;
      })

      .addCase(updateEmployeeEarlyExit.fulfilled, (state, action) => {
        state.marking = false;

        // List me turant update kar do, dobara fetch ki zarurat nahi
        const { attendanceId, earlyExitReason, earlyExitApprovedBy } =
          action.payload;

        const updateRecord = (record: AttendanceRecord) => {
          if (record.attendance_id === attendanceId) {
            record.early_exit_reason = earlyExitReason;
            record.early_exit_approved_by = earlyExitApprovedBy ?? null;
          }
        };

        state.list.forEach(updateRecord);
        state.monthlyList.forEach(updateRecord);
        state.myAttendance.forEach(updateRecord);
      })

      .addCase(updateEmployeeEarlyExit.rejected, (state, action) => {
        state.marking = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAttendanceError, clearAttendance } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
