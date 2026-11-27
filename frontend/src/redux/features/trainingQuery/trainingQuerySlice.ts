import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  raiseTrainingQuery,
  fetchTrainingQueries,
  answerTrainingQuery,
  fetchMyTrainingQueries,
  type DayQueries,
  type FetchQueriesParams,
  type TrainingQueryItem,
} from "./trainingQueryApi";

type SubmitPayload = Parameters<typeof raiseTrainingQuery>[0];

interface TrainingQueryState {
  // submit
  loading: boolean;
  error: string | null;
  submittedCount: number;

  // fetch (day -> module wise) - admin / trainer
  groups: DayQueries[];
  fetching: boolean;
  fetchError: string | null;

  // answer
  answering: boolean;
  answerError: string | null;

  // my queries (logged-in employee)
  myQueries: any[];
  fetchingMyQueries: boolean;
  myQueriesError: string | null;
}

const initialState: TrainingQueryState = {
  loading: false,
  error: null,
  submittedCount: 0,

  groups: [],
  fetching: false,
  fetchError: null,

  answering: false,
  answerError: null,

  myQueries: [],
  fetchingMyQueries: false,
  myQueriesError: null,
};

const getErrorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

// Questions submit
export const submitTrainingQuery = createAsyncThunk<
  { count: number; batchId: string },
  SubmitPayload,
  { rejectValue: string }
>("trainingQuery/submit", async (payload, { rejectWithValue }) => {
  try {
    return await raiseTrainingQuery(payload);
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to raise query"));
  }
});

// Questions fetch (day + module wise)
export const getTrainingQueries = createAsyncThunk<
  DayQueries[],
  FetchQueriesParams | undefined,
  { rejectValue: string }
>("trainingQuery/fetch", async (params, { rejectWithValue }) => {
  try {
    return await fetchTrainingQueries(params);
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch queries"));
  }
});

// Question ka answer dena
export const giveTrainingAnswer = createAsyncThunk<
  unknown,
  { queryId: string; answer: string },
  { rejectValue: string }
>("trainingQuery/answer", async (payload, { rejectWithValue }) => {
  try {
    return await answerTrainingQuery(payload);
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to submit answer"));
  }
});

// Logged-in employee ke apne questions + answers
export const getMyTrainingQueries = createAsyncThunk<
  any[],
  void,
  { rejectValue: string }
>("trainingQuery/fetchMy", async (_, { rejectWithValue }) => {
  try {
    return await fetchMyTrainingQueries();
  } catch (err: any) {
    return rejectWithValue(
      getErrorMessage(err, "Failed to fetch your queries"),
    );
  }
});

const trainingQuerySlice = createSlice({
  name: "trainingQuery",
  initialState,
  reducers: {
    // sirf submit ka state reset (fetched data ko nahi chhedta)
    resetTrainingQuery: (state) => {
      state.loading = false;
      state.error = null;
      state.submittedCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // submit
      .addCase(submitTrainingQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTrainingQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.submittedCount = action.payload.count;
      })
      .addCase(submitTrainingQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      })

      // fetch (admin / trainer)
      .addCase(getTrainingQueries.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(getTrainingQueries.fulfilled, (state, action) => {
        state.fetching = false;
        state.groups = action.payload;
      })
      .addCase(getTrainingQueries.rejected, (state, action) => {
        state.fetching = false;
        state.fetchError = action.payload ?? "Something went wrong";
      })

      // answer
      .addCase(giveTrainingAnswer.pending, (state) => {
        state.answering = true;
        state.answerError = null;
      })
      .addCase(giveTrainingAnswer.fulfilled, (state) => {
        state.answering = false;
      })
      .addCase(giveTrainingAnswer.rejected, (state, action) => {
        state.answering = false;
        state.answerError = action.payload ?? "Something went wrong";
      })

      // my queries (employee)
      .addCase(getMyTrainingQueries.pending, (state) => {
        state.fetchingMyQueries = true;
        state.myQueriesError = null;
      })
      .addCase(getMyTrainingQueries.fulfilled, (state, action) => {
        state.fetchingMyQueries = false;
        state.myQueries = action.payload;
      })
      .addCase(getMyTrainingQueries.rejected, (state, action) => {
        state.fetchingMyQueries = false;
        state.myQueriesError = action.payload ?? "Something went wrong";
      });
  },
});

export const { resetTrainingQuery } = trainingQuerySlice.actions;
export default trainingQuerySlice.reducer;
