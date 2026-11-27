import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

// axiosInstance.baseURL = ".../api/v1" hona chahiye
const QUESTIONS_URL = "/training-map-query/questions";
const ANSWERS_URL = "/training-map-query";

/* ============================ Types ============================ */
export type MapModuleKey = "google_map_1" | "google_map_2";

export interface ModuleQuestionParams {
  department: string;
  subDepartment: string;
  moduleKey: string;
}

export interface ModuleQuestion {
  id: number;
  text: string;
}

export interface SaveQuestionsPayload extends ModuleQuestionParams {
  questions: string[];
}

export interface MapAnswerEntry {
  questionId?: number | null;
  question: string;
  answer: string;
}

export interface SubmitAnswersPayload {
  department: string;
  subDepartment: string;
  moduleKey: MapModuleKey;
  answers: MapAnswerEntry[];
}

export interface SavedMapAnswer {
  id: number;
  batch_id: string;
  employee_id?: number;
  module_key?: string;
  question_id: number | null;
  question: string;
  answer: string;
  created_at: string;
}

export interface FetchMapAnswersParams {
  department: string;
  subDepartment: string;
  moduleKey: MapModuleKey;
}

/* ============================ State ============================ */
interface TrainingMapQueryState {
  fetching: boolean;
  fetchError: string | null;
  questions: ModuleQuestion[];

  saving: boolean;
  saveError: string | null;

  savingAnswers: boolean;
  saveAnswersError: string | null;
  savedCount: number;

  answers: SavedMapAnswer[];
  fetchingAnswers: boolean;
  fetchAnswersError: string | null;

  allAnswers: SavedMapAnswer[];
  fetchingAll: boolean;
  fetchAllError: string | null;
}

const initialState: TrainingMapQueryState = {
  fetching: false,
  fetchError: null,
  questions: [],

  saving: false,
  saveError: null,

  savingAnswers: false,
  saveAnswersError: null,
  savedCount: 0,

  answers: [],
  fetchingAnswers: false,
  fetchAnswersError: null,

  allAnswers: [],
  fetchingAll: false,
  fetchAllError: null,
};

const getErrorMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

/* ======================= QUESTIONS thunks ======================= */
export const getModuleQuestions = createAsyncThunk<
  ModuleQuestion[],
  ModuleQuestionParams,
  { rejectValue: string }
>("trainingMapQuery/fetchQuestions", async (params, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(QUESTIONS_URL, { params });
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch questions");
    }
    return res.data.data ?? [];
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch questions"));
  }
});

export const saveModuleQuestions = createAsyncThunk<
  { count: number },
  SaveQuestionsPayload,
  { rejectValue: string }
>("trainingMapQuery/saveQuestions", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(QUESTIONS_URL, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to save questions");
    }
    return res.data.data ?? { count: payload.questions.length };
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to save questions"));
  }
});

/* ======================== ANSWERS thunks ======================== */
export const submitMapAnswers = createAsyncThunk<
  { count: number; batchId?: string },
  SubmitAnswersPayload,
  { rejectValue: string }
>("trainingMapQuery/submitAnswers", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${ANSWERS_URL}/submit`, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to save answers");
    }
    return {
      count: res.data.count ?? payload.answers.length,
      batchId: res.data.batchId,
    };
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to save answers"));
  }
});

export const getMyMapAnswers = createAsyncThunk<
  SavedMapAnswer[],
  FetchMapAnswersParams,
  { rejectValue: string }
>("trainingMapQuery/fetchMyAnswers", async (params, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${ANSWERS_URL}/my`, { params });
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch answers");
    }
    return res.data.data ?? [];
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch answers"));
  }
});

export const getAllMapAnswers = createAsyncThunk<
  SavedMapAnswer[],
  FetchMapAnswersParams,
  { rejectValue: string }
>("trainingMapQuery/fetchAllAnswers", async (params, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${ANSWERS_URL}/all`, { params });
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to fetch answers");
    }
    return res.data.data ?? [];
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch answers"));
  }
});

/* ============================== Slice ============================== */
const trainingMapQuerySlice = createSlice({
  name: "trainingMapQuery",
  initialState,
  reducers: {
    resetTrainingMapQuery: (state) => {
      state.fetching = false;
      state.fetchError = null;
      state.questions = [];
      state.saving = false;
      state.saveError = null;
    },
    resetMapSave: (state) => {
      state.savingAnswers = false;
      state.saveAnswersError = null;
      state.savedCount = 0;
    },
    clearMapAnswers: (state) => {
      state.answers = [];
      state.allAnswers = [];
      state.fetchAnswersError = null;
      state.fetchAllError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // questions: fetch
      .addCase(getModuleQuestions.pending, (state) => {
        state.fetching = true;
        state.fetchError = null;
      })
      .addCase(getModuleQuestions.fulfilled, (state, action) => {
        state.fetching = false;
        state.questions = action.payload ?? [];
      })
      .addCase(getModuleQuestions.rejected, (state, action) => {
        state.fetching = false;
        state.fetchError = action.payload ?? "Something went wrong";
      })

      // questions: save
      .addCase(saveModuleQuestions.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveModuleQuestions.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveModuleQuestions.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload ?? "Something went wrong";
      })

      // answers: submit
      .addCase(submitMapAnswers.pending, (state) => {
        state.savingAnswers = true;
        state.saveAnswersError = null;
      })
      .addCase(submitMapAnswers.fulfilled, (state, action) => {
        state.savingAnswers = false;
        state.savedCount = action.payload?.count ?? 0;
      })
      .addCase(submitMapAnswers.rejected, (state, action) => {
        state.savingAnswers = false;
        state.saveAnswersError = action.payload ?? "Something went wrong";
      })

      // answers: my
      .addCase(getMyMapAnswers.pending, (state) => {
        state.fetchingAnswers = true;
        state.fetchAnswersError = null;
      })
      .addCase(getMyMapAnswers.fulfilled, (state, action) => {
        state.fetchingAnswers = false;
        state.answers = action.payload ?? [];
      })
      .addCase(getMyMapAnswers.rejected, (state, action) => {
        state.fetchingAnswers = false;
        state.fetchAnswersError = action.payload ?? "Something went wrong";
      })

      // answers: all
      .addCase(getAllMapAnswers.pending, (state) => {
        state.fetchingAll = true;
        state.fetchAllError = null;
      })
      .addCase(getAllMapAnswers.fulfilled, (state, action) => {
        state.fetchingAll = false;
        state.allAnswers = action.payload ?? [];
      })
      .addCase(getAllMapAnswers.rejected, (state, action) => {
        state.fetchingAll = false;
        state.fetchAllError = action.payload ?? "Something went wrong";
      });
  },
});

export const { resetTrainingMapQuery, resetMapSave, clearMapAnswers } =
  trainingMapQuerySlice.actions;

export default trainingMapQuerySlice.reducer;
