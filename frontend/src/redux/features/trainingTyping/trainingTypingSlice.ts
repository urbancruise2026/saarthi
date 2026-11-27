import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addTypingScores,
  fetchTypingScores,
  deleteTypingScore,
  type SavedTypingEntry,
  type FetchTypingParams,
} from "./trainingTypingApi";

type SubmitPayload = Parameters<typeof addTypingScores>[0];

interface TypingState {
  // submit
  saving: boolean;
  saveError: string | null;
  savedCount: number;

  // fetch
  scores: SavedTypingEntry[];
  fetching: boolean;
  fetchError: string | null;

  // delete
  deleting: boolean;
  deleteError: string | null;
}

const initialState: TypingState = {
  saving: false,
  saveError: null,
  savedCount: 0,

  scores: [],
  fetching: false,
  fetchError: null,

  deleting: false,
  deleteError: null,
};

const getErrorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

// Scores submit
export const submitTypingScores = createAsyncThunk<
  { count: number },
  SubmitPayload,
  { rejectValue: string }
>("typing/submit", async (payload, { rejectWithValue }) => {
  try {
    const res = await addTypingScores(payload);
    // backend data na bheje to bhi count mil jaye
    return res ?? { count: payload.entries.length };
  } catch (err: any) {
    return rejectWithValue(
      getErrorMessage(err, "Failed to save typing scores"),
    );
  }
});

// Scores fetch
export const getTypingScores = createAsyncThunk<
  SavedTypingEntry[],
  FetchTypingParams,
  { rejectValue: string }
>("typing/fetch", async (params, { rejectWithValue }) => {
  try {
    return await fetchTypingScores(params);
  } catch (err: any) {
    return rejectWithValue(
      getErrorMessage(err, "Failed to fetch typing scores"),
    );
  }
});

// Score delete
export const removeTypingScore = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("typing/delete", async (id, { rejectWithValue }) => {
  try {
    return await deleteTypingScore(id);
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to delete score"));
  }
});

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    // sirf submit ka state reset
    resetTypingSave: (state) => {
      state.saving = false;
      state.saveError = null;
      state.savedCount = 0;
    },
    // popup band hone par purana data saaf
    clearTypingScores: (state) => {
      state.scores = [];
      state.fetchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // submit
      .addCase(submitTypingScores.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(submitTypingScores.fulfilled, (state, action) => {
        state.saving = false;
        state.savedCount = action.payload?.count ?? 0; // 👈 safe
      })
      .addCase(submitTypingScores.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload ?? "Something went wrong";
      })

      // fetch
      .addCase(getTypingScores.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(getTypingScores.fulfilled, (state, action) => {
        state.fetching = false;
        state.scores = action.payload ?? [];
      })
      .addCase(getTypingScores.rejected, (state, action) => {
        state.fetching = false;
        state.fetchError = action.payload ?? "Something went wrong";
      })

      // delete
      .addCase(removeTypingScore.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(removeTypingScore.fulfilled, (state, action) => {
        state.deleting = false;
        state.scores = state.scores.filter(
          (s) => Number(s.id) !== Number(action.payload),
        );
      })
      .addCase(removeTypingScore.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload ?? "Something went wrong";
      });
  },
});

export const { resetTypingSave, clearTypingScores } = typingSlice.actions;
export default typingSlice.reducer;
