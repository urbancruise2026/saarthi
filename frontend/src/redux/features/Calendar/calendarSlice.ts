import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import {
  getHolidays,
  getHolidayYears,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  HolidayFilters,
  CreateHolidayPayload,
  UpdateHolidayPayload,
} from "./calendarApi";

export interface HolidayRecord {
  id: number;
  branch_id: number;
  date: string;
  year: number;
  name: string;
  is_active?: boolean;
  branch_name?: string;
}

interface HolidayState {
  list: HolidayRecord[];
  years: number[];
  loading: boolean;
  yearsLoading: boolean;
  creating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: HolidayState = {
  list: [],
  years: [],
  loading: false,
  yearsLoading: false,
  creating: false,
  deleting: false,
  error: null,
};

export const fetchHolidays = createAsyncThunk(
  "holiday/fetchHolidays",
  async (filters: HolidayFilters = {}, { rejectWithValue }) => {
    try {
      const data = await getHolidays(filters);
      return data as HolidayRecord[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch holidays",
      );
    }
  },
);

export const fetchHolidayYears = createAsyncThunk(
  "holiday/fetchHolidayYears",
  async (_: void, { rejectWithValue }) => {
    try {
      const data = await getHolidayYears();
      return data as number[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch holiday years",
      );
    }
  },
);

export const createHolidayThunk = createAsyncThunk(
  "holiday/createHoliday",
  async (payload: CreateHolidayPayload, { rejectWithValue }) => {
    try {
      const data = await createHoliday(payload);
      return data as HolidayRecord;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create holiday",
      );
    }
  },
);

export const updateHolidayThunk = createAsyncThunk(
  "holiday/updateHoliday",
  async (payload: UpdateHolidayPayload, { rejectWithValue }) => {
    try {
      const data = await updateHoliday(payload);
      return { id: payload.id, ...data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update holiday",
      );
    }
  },
);

export const deleteHolidayThunk = createAsyncThunk(
  "holiday/deleteHoliday",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteHoliday(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete holiday",
      );
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const holidaySlice = createSlice({
  name: "holiday",
  initialState,
  reducers: {
    clearHolidayError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchHolidays
      .addCase(fetchHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHolidays.fulfilled,
        (state, action: PayloadAction<HolidayRecord[]>) => {
          state.loading = false;
          state.list = action.payload;
        },
      )
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch holidays";
      })

      // fetchHolidayYears
      .addCase(fetchHolidayYears.pending, (state) => {
        state.yearsLoading = true;
      })
      .addCase(
        fetchHolidayYears.fulfilled,
        (state, action: PayloadAction<number[]>) => {
          state.yearsLoading = false;
          state.years = action.payload;
        },
      )
      .addCase(fetchHolidayYears.rejected, (state, action) => {
        state.yearsLoading = false;
        state.error =
          (action.payload as string) || "Failed to fetch holiday years";
      })

      // createHolidayThunk
      .addCase(createHolidayThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(
        createHolidayThunk.fulfilled,
        (state, action: PayloadAction<HolidayRecord>) => {
          state.creating = false;
          state.list.push(action.payload);
        },
      )
      .addCase(createHolidayThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = (action.payload as string) || "Failed to create holiday";
      })

      // updateHolidayThunk
      .addCase(updateHolidayThunk.fulfilled, (state, action: any) => {
        const idx = state.list.findIndex(
          (h) => String(h.id) === String(action.payload.id),
        );
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...action.payload };
        }
      })
      .addCase(updateHolidayThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update holiday";
      })

      // deleteHolidayThunk
      .addCase(deleteHolidayThunk.pending, (state) => {
        state.deleting = true;
      })
      .addCase(
        deleteHolidayThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deleting = false;
          state.list = state.list.filter(
            (h) => String(h.id) !== String(action.payload),
          );
        },
      )
      .addCase(deleteHolidayThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = (action.payload as string) || "Failed to delete holiday";
      });
  },
});

export const { clearHolidayError } = holidaySlice.actions;
export default holidaySlice.reducer;
