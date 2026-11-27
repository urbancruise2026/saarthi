import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { ModuleKey } from "@/components/training/constants";
import {
  TrainingModule,
  TrainingFileType,
  TrainingCategory,
  getTrainingModules,
  uploadTrainingModuleFile,
  deleteTrainingModule,
  getTrainingStartDate,
  saveTrainingStartDate,
} from "./traininModuleApi";

interface TrainingModuleState {
  modules: TrainingModule[];
  startDate: string | null;
  loading: boolean;
  uploading: boolean;
  savingDate: boolean;
  uploadProgress: number;
  error: string | null;
}

const initialState: TrainingModuleState = {
  modules: [],
  startDate: null,
  loading: false,
  uploading: false,
  savingDate: false,
  uploadProgress: 0,
  error: null,
};

export const fetchTrainingModules = createAsyncThunk<
  TrainingModule[],
  {
    department?: string;
    subDepartment?: string;
    category?: TrainingCategory;
    fileType?: TrainingFileType;
    moduleKey?: ModuleKey;
  },
  { rejectValue: string }
>(
  "trainingModule/fetchTrainingModules",
  async (params, { rejectWithValue }) => {
    try {
      return await getTrainingModules(params);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch training modules",
      );
    }
  },
);

export const uploadTrainingModule = createAsyncThunk<
  TrainingModule,
  {
    department: string;
    subDepartment: string;
    category: TrainingCategory;
    moduleKey: ModuleKey;
    file: File;
  },
  { rejectValue: string }
>(
  "trainingModule/uploadTrainingModule",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      return await uploadTrainingModuleFile(data, (percent) =>
        dispatch(setUploadProgress(percent)),
      );
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to upload training file",
      );
    }
  },
);

export const removeTrainingModule = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("trainingModule/removeTrainingModule", async (id, { rejectWithValue }) => {
  try {
    await deleteTrainingModule(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to delete training module",
    );
  }
});

export const fetchStartDate = createAsyncThunk<
  string | null,
  { department: string; subDepartment: string },
  { rejectValue: string }
>("trainingModule/fetchStartDate", async (params, { rejectWithValue }) => {
  try {
    return await getTrainingStartDate(params);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch start date",
    );
  }
});

export const updateStartDate = createAsyncThunk<
  string,
  { department: string; subDepartment: string; startDate: string },
  { rejectValue: string }
>("trainingModule/updateStartDate", async (payload, { rejectWithValue }) => {
  try {
    return await saveTrainingStartDate(payload);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to save start date",
    );
  }
});

const trainingModuleSlice = createSlice({
  name: "trainingModule",
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearTrainingModuleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH MODULES
      .addCase(fetchTrainingModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchTrainingModules.rejected, (state, action) => {
        state.loading = false;
        state.modules = [];
        state.error = action.payload || "Something went wrong";
      })

      // UPLOAD
      .addCase(uploadTrainingModule.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadTrainingModule.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.modules.unshift(action.payload);
      })
      .addCase(uploadTrainingModule.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || "Training file upload failed";
      })

      // DELETE
      .addCase(removeTrainingModule.fulfilled, (state, action) => {
        state.modules = state.modules.filter((m) => m.id !== action.payload);
      })
      .addCase(removeTrainingModule.rejected, (state, action) => {
        state.error = action.payload || "Delete failed";
      })

      // FETCH START DATE
      .addCase(fetchStartDate.pending, (state) => {
        state.startDate = null; // purane program ki date na dikhe
      })
      .addCase(fetchStartDate.fulfilled, (state, action) => {
        state.startDate = action.payload;
      })
      .addCase(fetchStartDate.rejected, (state, action) => {
        state.startDate = null;
        state.error = action.payload || "Failed to fetch start date";
      })

      // SAVE START DATE
      .addCase(updateStartDate.pending, (state) => {
        state.savingDate = true;
        state.error = null;
      })
      .addCase(updateStartDate.fulfilled, (state) => {
        state.savingDate = false;
      })
      .addCase(updateStartDate.rejected, (state, action) => {
        state.savingDate = false;
        state.error = action.payload || "Failed to save start date";
      });
  },
});

export const { setUploadProgress, clearTrainingModuleError } =
  trainingModuleSlice.actions;
export default trainingModuleSlice.reducer;
