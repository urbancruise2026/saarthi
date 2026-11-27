import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ReviewMap } from "@/components/training/types";
import {
  getMyReviews,
  getAllReviews,
  saveReview,
  ServerReview,
  SameReviewPayload,
  TrackParams,
  TrackResult,
  TrackReview,
} from "./trainingReviewApi";

interface State {
  reviews: ReviewMap; // day -> review (sirf current user)
  loading: boolean;
  saving: boolean;

  // Track table (sabhi employees)
  track: {
    rows: TrackReview[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    error: string | null;
  };
}

const initialState: State = {
  reviews: {},
  loading: false,
  saving: false,
  track: {
    rows: [],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null,
  },
};

export const fetchMyReviews = createAsyncThunk<
  ServerReview[],
  string,
  { rejectValue: string }
>("trainingReview/fetchMine", async (subDepartment, { rejectWithValue }) => {
  try {
    return await getMyReviews(subDepartment);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch reviews",
    );
  }
});

// ✅ Track table ke liye
export const fetchAllReviews = createAsyncThunk<
  TrackResult,
  TrackParams | undefined,
  { rejectValue: string }
>("trainingReview/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await getAllReviews(params ?? {});
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch all reviews",
    );
  }
});

export const saveTrainingReview = createAsyncThunk<
  ServerReview,
  SameReviewPayload,
  { rejectValue: string }
>("trainingReview/save", async (payload, { rejectWithValue }) => {
  try {
    return await saveReview(payload);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Review save nahi hua",
    );
  }
});

const trainingReviewSlice = createSlice({
  name: "trainingReview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- my reviews ----
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.reviews = {}; // dusre sub-department ke reviews na dikhein
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = Object.fromEntries(
          action.payload.map((r) => [r.day, r]),
        );
      })
      .addCase(fetchMyReviews.rejected, (state) => {
        state.loading = false;
      })

      // ---- all reviews (track table) ----
      .addCase(fetchAllReviews.pending, (state) => {
        state.track.loading = true;
        state.track.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.track.loading = false;
        state.track.rows = action.payload.rows;
        state.track.total = action.payload.total;
        state.track.page = action.payload.page;
        state.track.limit = action.payload.limit;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.track.loading = false;
        state.track.error = action.payload || "Something went wrong";
      })

      // ---- save ----
      .addCase(saveTrainingReview.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveTrainingReview.fulfilled, (state, action) => {
        state.saving = false;
        state.reviews[action.payload.day] = action.payload;
      })
      .addCase(saveTrainingReview.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default trainingReviewSlice.reducer;
