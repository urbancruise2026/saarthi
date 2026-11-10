import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createBGVapi,
  getAllBGVApi,
  BGVParams,
  PaginationMeta,
} from "./BackgroundVerificationApi";
import { BGVData } from "@/types";

// ─── Error helper ─────────────────────────────────────────────────────────────

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  return fallback;
};

// ─── State ─────────────────────────────────────────────────────────────────

interface BGVState {
  loading: boolean;
  error: string | null;
  insertId: number | null;
  allBGVData: BGVData[];
  pagination: PaginationMeta | null;
  listLoading: boolean;
  listError: string | null;
}

const initialState: BGVState = {
  loading: false,
  error: null,
  insertId: null,
  allBGVData: [],
  pagination: null,
  listLoading: false,
  listError: null,
};

// ─── Thunks ────────────────────────────────────────────────────────────────────

export const createBGVThunk = createAsyncThunk(
  "bgv/create",
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    // any → unknown
    try {
      const result = await createBGVapi(payload);
      return result;
    } catch (error: unknown) {
      // any → unknown
      return rejectWithValue(
        getErrorMessage(error, "BGV create karne mein error aaya"),
      );
    }
  },
);

export const getAllBGVThunk = createAsyncThunk(
  "bgv/getAll",
  async (params: BGVParams = {}, { rejectWithValue }) => {
    try {
      const result = await getAllBGVApi(params);
      return result;
    } catch (error: unknown) {
      // any → unknown
      return rejectWithValue(
        getErrorMessage(error, "BGV list fetch karne mein error aaya"),
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const bgvSlice = createSlice({
  name: "bgv",
  initialState,
  reducers: {
    resetBGV: (state) => {
      state.loading = false;
      state.error = null;
      state.insertId = null;
    },
    resetBGVList: (state) => {
      state.allBGVData = [];
      state.pagination = null;
      state.listLoading = false;
      state.listError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBGVThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBGVThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.insertId = action.payload.insertId;
      })
      .addCase(createBGVThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllBGVThunk.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getAllBGVThunk.fulfilled, (state, action) => {
        state.listLoading = false;
        state.allBGVData = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllBGVThunk.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
      });
  },
});

export const { resetBGV, resetBGVList } = bgvSlice.actions;
export default bgvSlice.reducer;
