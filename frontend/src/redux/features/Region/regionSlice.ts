import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IRegion } from "@/types";
import { getAllRegions } from "./regionApi";
import { AxiosError } from "axios";

interface RegionState {
  regions: IRegion[];
  loading: boolean;
  error: string | null;
}

const initialState: RegionState = {
  regions: [],
  loading: false,
  error: null,
};

// Async thunk
export const fetchRegionsByCountryId = createAsyncThunk<
  IRegion[],
  number,
  { rejectValue: string }
>("regions/fetchRegions", async (countryId, { rejectWithValue }) => {
  try {
    const data = await getAllRegions(countryId);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch regions",
    );
  }
});

const regionSlice = createSlice({
  name: "regions",
  initialState,
  reducers: {
    clearRegionError: (state) => {
      state.error = null;
    },
    setRegions: (state, action: PayloadAction<IRegion[]>) => {
      state.regions = action.payload;
    },
    clearRegions: (state) => {
      state.regions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegionsByCountryId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRegionsByCountryId.fulfilled,
        (state, action: PayloadAction<IRegion[]>) => {
          state.loading = false;
          state.regions = action.payload;
        },
      )
      .addCase(fetchRegionsByCountryId.rejected, (state, action) => {
        state.loading = false;
        state.regions = [];
        state.error = action.payload || "Failed to fetch regions";
      });
  },
});

export const { clearRegionError, setRegions, clearRegions } =
  regionSlice.actions;
export default regionSlice.reducer;
