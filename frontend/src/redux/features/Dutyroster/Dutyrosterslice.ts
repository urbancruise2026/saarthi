import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import {
  getDutyRosterList,
  createDutyRoster,
  updateDutyRoster,
  deactivateDutyRoster,
  getEmployeesDutyRoster,
  DutyRosterRecord,
  DutyRosterPayload,
  DutyRosterListParams,
  DutyRosterEmployee,
} from "@/redux/features/Dutyroster/Dutyrosterapi";

export type { DutyRosterRecord, DutyRosterPayload, DutyRosterEmployee };

interface DutyRosterState {
  list: DutyRosterRecord[];

  // Employee dropdown list
  employees: DutyRosterEmployee[];

  loading: boolean;
  creating: boolean;
  employeesLoading: boolean;

  error: string | null;
}

const initialState: DutyRosterState = {
  list: [],
  employees: [],

  loading: false,
  creating: false,
  employeesLoading: false,

  error: null,
};

/* =========================
   FETCH DUTY ROSTERS
========================= */

export const fetchDutyRosters = createAsyncThunk(
  "dutyRoster/fetchAll",
  async (params: DutyRosterListParams | undefined, { rejectWithValue }) => {
    try {
      return await getDutyRosterList(params);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch duty roster",
      );
    }
  },
);

/* =========================
   FETCH EMPLOYEES
========================= */

export const fetchDutyRosterEmployees = createAsyncThunk(
  "dutyRoster/fetchEmployees",
  async (
    {
      branchId,
      departmentId,
    }: {
      branchId?: number | string;
      departmentId?: number | string;
    },
    { rejectWithValue },
  ) => {
    try {
      const resp = await getEmployeesDutyRoster(branchId, departmentId);

      console.log("API RESPONSE:", resp);
      console.log("IS ARRAY:", Array.isArray(resp));

      return resp;
    } catch (error: any) {
      console.log("THUNK ERROR:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch employees",
      );
    }
  },
);

/* =========================
   CREATE DUTY ROSTER
========================= */

export const createDutyRosterThunk = createAsyncThunk(
  "dutyRoster/create",
  async (entries: DutyRosterPayload[], { rejectWithValue }) => {
    try {
      return await createDutyRoster(entries);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create duty roster entries",
      );
    }
  },
);

/* =========================
   UPDATE DUTY ROSTER
========================= */

export const updateDutyRosterThunk = createAsyncThunk(
  "dutyRoster/update",
  async (
    {
      id,
      payload,
    }: {
      id: number;
      payload: DutyRosterPayload;
    },
    { rejectWithValue },
  ) => {
    try {
      return await updateDutyRoster({
        ...payload,
        id,
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update duty roster entry",
      );
    }
  },
);

/* =========================
   DEACTIVATE DUTY ROSTER
========================= */

export const deleteDutyRosterThunk = createAsyncThunk(
  "dutyRoster/delete",
  async ({ id }: { id: number }, { rejectWithValue }) => {
    try {
      return await deactivateDutyRoster(id);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to deactivate duty roster entry",
      );
    }
  },
);

/* =========================
   SLICE
========================= */

const dutyRosterSlice = createSlice({
  name: "dutyRoster",
  initialState,

  reducers: {
    clearDutyRosterError: (state) => {
      state.error = null;
    },

    clearDutyRosterEmployees: (state) => {
      state.employees = [];
    },
  },

  extraReducers: (builder) => {
    builder

      /* =========================
         FETCH DUTY ROSTERS
      ========================= */

      .addCase(fetchDutyRosters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchDutyRosters.fulfilled,
        (state, action: PayloadAction<DutyRosterRecord[]>) => {
          state.loading = false;

          // API ka latest data old list ko replace karega
          state.list = action.payload;
        },
      )

      .addCase(fetchDutyRosters.rejected, (state, action) => {
        state.loading = false;

        state.error =
          (action.payload as string) || "Failed to load duty roster";
      })

      /* =========================
         FETCH EMPLOYEES
      ========================= */

      .addCase(fetchDutyRosterEmployees.pending, (state) => {
        state.employeesLoading = true;
        state.error = null;
      })

      .addCase(
        fetchDutyRosterEmployees.fulfilled,
        (state, action: PayloadAction<DutyRosterEmployee[]>) => {
          state.employeesLoading = false;
          state.employees = action.payload;
        },
      )

      .addCase(fetchDutyRosterEmployees.rejected, (state, action) => {
        state.employeesLoading = false;
        state.employees = [];

        state.error = (action.payload as string) || "Failed to load employees";
      })

      .addCase(createDutyRosterThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })

      .addCase(
        createDutyRosterThunk.fulfilled,
        (state, action: PayloadAction<DutyRosterRecord>) => {
          state.creating = false;

          state.list = [action.payload, ...state.list];
        },
      )

      .addCase(createDutyRosterThunk.rejected, (state, action) => {
        state.creating = false;

        state.error = (action.payload as string) || "Failed to create entry";
      })

      /* =========================
         UPDATE
      ========================= */

      .addCase(
        updateDutyRosterThunk.fulfilled,
        (state, action: PayloadAction<DutyRosterRecord>) => {
          state.list = state.list.map((r) =>
            r.id === action.payload.id ? action.payload : r,
          );
        },
      )

      .addCase(updateDutyRosterThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update entry";
      })

      /* =========================
         DEACTIVATE
      ========================= */

      .addCase(
        deleteDutyRosterThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.map((r) =>
            r.id === action.payload
              ? {
                  ...r,
                  is_active: 0,
                }
              : r,
          );
        },
      )

      .addCase(deleteDutyRosterThunk.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to deactivate entry";
      });
  },
});

export const { clearDutyRosterError, clearDutyRosterEmployees } =
  dutyRosterSlice.actions;

export default dutyRosterSlice.reducer;
