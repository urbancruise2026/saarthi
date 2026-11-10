import { Designation } from "@/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllDesignations } from "./designationApi";


interface DesignationState {
  designations: Designation[];
  loading: boolean;
  error: string | null;
}

const initialState: DesignationState = {
  designations: [],
  loading: false,
  error: null,
};

export const fetchDesignations = createAsyncThunk(
  "designation/fetchDesignations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllDesignations();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch designations"
      );
    }
  }
);

const designationSlice = createSlice({
  name: "designation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        state.designations = action.payload;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default designationSlice.reducer;