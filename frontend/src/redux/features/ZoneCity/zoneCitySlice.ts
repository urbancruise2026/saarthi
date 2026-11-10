import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { IZoneCity } from "@/types";
import { getAllCities, getCityById } from "./zoneCityApi";

interface ZoneCityState {
  zoneCities: IZoneCity[];
  loading: boolean;
  error: string | null;
}

const initialState: ZoneCityState = {
  zoneCities: [],
  loading: false,
  error: null,
};

export const fetchZoneCities = createAsyncThunk<
  IZoneCity[],
  number,
  { rejectValue: string }
>("zoneCities/fetchZoneCities", async (zoneId, { rejectWithValue }) => {
  try {
    const data = await getAllCities(zoneId);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      err.response?.data?.message ||
        err.message ||
        "Failed to fetch zone cities",
    );
  }
});

export const fetchCityById = createAsyncThunk<
  IZoneCity | null,
  number,
  { rejectValue: string }
>("zoneCities/fetchCityById", async (cityId, { rejectWithValue }) => {
  try {
    const data = await getCityById(cityId);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      err.response?.data?.message ||
        err.message ||
        "Failed to fetch city",
    );
  }
});

const zoneCitySlice = createSlice({
  name: "zoneCities",
  initialState,
  reducers: {
    clearZoneCityError: (state) => {
      state.error = null;
    },
    setZoneCities: (state, action: PayloadAction<IZoneCity[]>) => {
      state.zoneCities = action.payload;
    },
    clearZoneCities: (state) => {
      state.zoneCities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZoneCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZoneCities.fulfilled, (state, action) => {
        state.loading = false;
        state.zoneCities = action.payload;
      })
      .addCase(fetchZoneCities.rejected, (state, action) => {
        state.loading = false;
        state.zoneCities = [];
        state.error = action.payload || "Failed to fetch zone cities";
      })
      .addCase(fetchCityById.fulfilled, (state, action) => {
        // Just ignore, we handle it in the component
      });
  },
});

export const { clearZoneCityError, setZoneCities, clearZoneCities } =
  zoneCitySlice.actions;

export default zoneCitySlice.reducer;
