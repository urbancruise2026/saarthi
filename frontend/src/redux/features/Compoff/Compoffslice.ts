import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getCompOffs,
  CompOff,
  CompOffFilters,
  CompOffPagination,
} from "./Compoffapi";

interface CompOffState {
  list: CompOff[];
  loading: boolean;
  error: string | null;
  pagination: CompOffPagination;
}

const initialState: CompOffState = {
  list: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,       
    hasPrevPage: false,
    hasNextPage: false,
  },
};

// Thunk: fetch comp offs with optional filters (page/limit included)
export const fetchCompOffs = createAsyncThunk(
  "compOffs/fetchCompOffs",
  async (filters: CompOffFilters = {}, { rejectWithValue }) => {
    try {
      const { data, pagination } = await getCompOffs(filters);
      return { data, pagination };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },
);

const compOffSlice = createSlice({
  name: "compOffs",
  initialState,
  reducers: {
    clearCompOffs: (state) => {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompOffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCompOffs.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: CompOff[];
            pagination: CompOffPagination;
          }>,
        ) => {
          state.loading = false;
          state.list = action.payload.data;
          state.pagination = action.payload.pagination;
        },
      )
      .addCase(fetchCompOffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCompOffs } = compOffSlice.actions;
export default compOffSlice.reducer;
