import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createShiftAssignment as createShiftAssignmentApi,
  getShiftAssignments as getShiftAssignmentsApi,
  getShiftAssignmentsByEmployee as getShiftAssignmentsByEmployeeApi,
  updateShiftAssignment as updateShiftAssignmentApi,
  deleteShiftAssignment as deleteShiftAssignmentApi,
  CreateShiftAssignmentPayload,
  UpdateShiftAssignmentPayload,
  GetShiftAssignmentsParams,
  ShiftAssignment,
} from "./shiftassignmentApi";

interface ShiftAssignmentState {
  list: ShiftAssignment[];
  employeeHistory: ShiftAssignment[];
  loading: boolean;
  employeeHistoryLoading: boolean;
  error: string | null;
  employeeHistoryError: string | null;
}

const initialState: ShiftAssignmentState = {
  list: [],
  employeeHistory: [],
  loading: false,
  employeeHistoryLoading: false,
  error: null,
  employeeHistoryError: null,
};

export const fetchShiftAssignments = createAsyncThunk<
  ShiftAssignment[],
  GetShiftAssignmentsParams | void,
  { rejectValue: string }
>("shiftAssignment/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await getShiftAssignmentsApi(params ?? {});
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch shift assignments",
    );
  }
});

export const fetchShiftAssignmentsByEmployee = createAsyncThunk<
  ShiftAssignment[],
  number | string,
  { rejectValue: string }
>(
  "shiftAssignment/fetchByEmployee",
  async (employeeId, { rejectWithValue }) => {
    try {
      return await getShiftAssignmentsByEmployeeApi(employeeId);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch employee shift history",
      );
    }
  },
);

export const createShiftAssignmentThunk = createAsyncThunk<
  ShiftAssignment,
  CreateShiftAssignmentPayload,
  { rejectValue: string }
>("shiftAssignment/create", async (payload, { rejectWithValue }) => {
  try {
    return await createShiftAssignmentApi(payload);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create shift assignment",
    );
  }
});

export const updateShiftAssignmentThunk = createAsyncThunk<
  ShiftAssignment,
  { id: number | string; payload: UpdateShiftAssignmentPayload },
  { rejectValue: string }
>("shiftAssignment/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await updateShiftAssignmentApi(id, payload);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update shift assignment",
    );
  }
});

export const deleteShiftAssignmentThunk = createAsyncThunk<
  { id: number | string; hardDelete: boolean },
  { id: number | string; hardDelete?: boolean },
  { rejectValue: string }
>(
  "shiftAssignment/delete",
  async ({ id, hardDelete = false }, { rejectWithValue }) => {
    try {
      await deleteShiftAssignmentApi(id, hardDelete);
      return { id, hardDelete };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to deactivate shift assignment",
      );
    }
  },
);

const shiftAssignmentSlice = createSlice({
  name: "shiftAssignment",
  initialState,
  reducers: {
    clearShiftAssignmentError: (state) => {
      state.error = null;
    },
    clearEmployeeShiftHistory: (state) => {
      state.employeeHistory = [];
      state.employeeHistoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchShiftAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchShiftAssignments.fulfilled,
        (state, action: PayloadAction<ShiftAssignment[]>) => {
          state.loading = false;
          state.list = action.payload;
        },
      )
      .addCase(fetchShiftAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch shift assignments";
      })

      // fetch by employee
      .addCase(fetchShiftAssignmentsByEmployee.pending, (state) => {
        state.employeeHistoryLoading = true;
        state.employeeHistoryError = null;
      })
      .addCase(
        fetchShiftAssignmentsByEmployee.fulfilled,
        (state, action: PayloadAction<ShiftAssignment[]>) => {
          state.employeeHistoryLoading = false;
          state.employeeHistory = action.payload;
        },
      )
      .addCase(fetchShiftAssignmentsByEmployee.rejected, (state, action) => {
        state.employeeHistoryLoading = false;
        state.employeeHistoryError =
          action.payload ?? "Failed to fetch employee shift history";
      })

      // create
      .addCase(createShiftAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createShiftAssignmentThunk.fulfilled,
        (state, action: PayloadAction<ShiftAssignment>) => {
          state.loading = false;
          if (action.payload) {
            state.list.unshift(action.payload);
          }
        },
      )
      .addCase(createShiftAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create shift assignment";
      })

      // update
      .addCase(updateShiftAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateShiftAssignmentThunk.fulfilled,
        (state, action: PayloadAction<ShiftAssignment>) => {
          state.loading = false;
          if (action.payload?.id) {
            const idx = state.list.findIndex((s) => s.id === action.payload.id);
            if (idx !== -1) state.list[idx] = action.payload;
          }
        },
      )
      .addCase(updateShiftAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update shift assignment";
      })

      // delete / deactivate
      .addCase(deleteShiftAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShiftAssignmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { id, hardDelete } = action.payload;
        if (hardDelete) {
          state.list = state.list.filter((s) => s.id !== id);
        } else {
          const idx = state.list.findIndex((s) => s.id === id);
          if (idx !== -1) state.list[idx].is_active = 0;
        }
      })
      .addCase(deleteShiftAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to deactivate shift assignment";
      });
  },
});

export const { clearShiftAssignmentError, clearEmployeeShiftHistory } =
  shiftAssignmentSlice.actions;

export default shiftAssignmentSlice.reducer;
