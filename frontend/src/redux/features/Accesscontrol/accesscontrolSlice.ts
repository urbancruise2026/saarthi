import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createAccessControl,
  deleteAccessControl,
  getAllAccessControls,
  getAccessControlByEmployeeId,
  IAccessControl,
  updateAccessControl,
} from "./accesscontrolApi";

import type { EmployeeAssignmentForm } from "./accesscontrolApi";

interface AccessControlState {
  accessControlList: IAccessControl[];
  selectedEmployeeAccess: IAccessControl | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AccessControlState = {
  accessControlList: [],
  selectedEmployeeAccess: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  successMessage: null,
};

// ==============================
// CREATE
// ==============================
export const createAccessControlThunk = createAsyncThunk<
  IAccessControl,
  EmployeeAssignmentForm,
  { rejectValue: string }
>("accessControl/create", async (payload, { rejectWithValue }) => {
  try {
    return await createAccessControl(payload);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create access control",
    );
  }
});

// ==============================
// GET ALL
// ==============================
export const fetchAccessControlListThunk = createAsyncThunk<
  IAccessControl[],
  void,
  { rejectValue: string }
>("accessControl/fetchList", async (_, { rejectWithValue }) => {
  try {
    return await getAllAccessControls();
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch access control list",
    );
  }
});

// ==============================
// GET BY EMPLOYEE ID
// ==============================
export const fetchAccessControlByEmployeeThunk = createAsyncThunk<
  IAccessControl | null,
  number,
  { rejectValue: string }
>("accessControl/fetchByEmployee", async (employeeId, { rejectWithValue }) => {
  try {
    return await getAccessControlByEmployeeId(employeeId);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch employee access control",
    );
  }
});

// ==============================
// UPDATE
// ==============================
interface UpdatePayload {
  id: number;
  payload: EmployeeAssignmentForm;
}

export const updateAccessControlThunk = createAsyncThunk<
  IAccessControl, // API should return updated object
  UpdatePayload,
  { rejectValue: string }
>("accessControl/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const updated = await updateAccessControl(id, payload);
    return updated;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update access control",
    );
  }
});

// ==============================
// DELETE
// ==============================
export const deleteAccessControlThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("accessControl/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteAccessControl(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to delete access control",
    );
  }
});

// ==============================
// SLICE
// ==============================
const accessControlSlice = createSlice({
  name: "accessControl",
  initialState,
  reducers: {
    clearAccessControlError: (state) => {
      state.error = null;
    },
    clearAccessControlSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedEmployeeAccess: (state) => {
      state.selectedEmployeeAccess = null;
    },
    resetAccessControlState: (state) => {
      state.loading = false;
      state.createLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── CREATE ─────────────────────────────────────
      .addCase(createAccessControlThunk.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createAccessControlThunk.fulfilled,
        (state, action: PayloadAction<IAccessControl>) => {
          state.createLoading = false;
          state.accessControlList.unshift(action.payload);
          state.successMessage = "Access control created successfully";
        },
      )
      .addCase(createAccessControlThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Failed to create access control";
      })

      // ── GET ALL ────────────────────────────────────
      .addCase(fetchAccessControlListThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAccessControlListThunk.fulfilled,
        (state, action: PayloadAction<IAccessControl[]>) => {
          state.loading = false;
          state.accessControlList = action.payload;
        },
      )
      .addCase(fetchAccessControlListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch list";
      })

      // ── GET BY EMPLOYEE ────────────────────────────
      .addCase(fetchAccessControlByEmployeeThunk.pending, (state) => {
        state.selectedEmployeeAccess = null;
      })
      .addCase(
        fetchAccessControlByEmployeeThunk.fulfilled,
        (state, action: PayloadAction<IAccessControl | null>) => {
          state.selectedEmployeeAccess = action.payload;
        },
      )
      .addCase(fetchAccessControlByEmployeeThunk.rejected, (state) => {
        state.selectedEmployeeAccess = null;
      })

      // ── UPDATE ─────────────────────────────────────
      .addCase(updateAccessControlThunk.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateAccessControlThunk.fulfilled,
        (state, action: PayloadAction<IAccessControl>) => {
          state.updateLoading = false;
          state.successMessage = "Access control updated successfully";

          const idx = state.accessControlList.findIndex(
            (x) => x.id === action.payload.id,
          );

          if (idx !== -1) {
            state.accessControlList[idx] = action.payload;
          }

          if (
            state.selectedEmployeeAccess &&
            state.selectedEmployeeAccess.id === action.payload.id
          ) {
            state.selectedEmployeeAccess = action.payload;
          }
        },
      )
      .addCase(updateAccessControlThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Failed to update access control";
      })

      // ── DELETE ─────────────────────────────────────
      .addCase(deleteAccessControlThunk.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(
        deleteAccessControlThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.deleteLoading = false;
          state.accessControlList = state.accessControlList.filter(
            (item) => item.id !== action.payload,
          );

          if (state.selectedEmployeeAccess?.id === action.payload) {
            state.selectedEmployeeAccess = null;
          }

          state.successMessage = "Access control deleted successfully";
        },
      )
      .addCase(deleteAccessControlThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload || "Failed to delete access control";
      });
  },
});

export const {
  clearAccessControlError,
  clearAccessControlSuccessMessage,
  clearSelectedEmployeeAccess,
  resetAccessControlState,
} = accessControlSlice.actions;

export default accessControlSlice.reducer;
