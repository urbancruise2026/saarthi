import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  getAllCitiesApi,
  getCityByIdApi,
  getCityNamesApi,
} from "./travelcityApi";
import { travelcity } from "@/types";

interface CityState {
  travelcity: travelcity[];
  city: travelcity | null;
  cityNames: Pick<travelcity, "id" | "uuid" | "cityName">[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: CityState = {
  travelcity: [],
  city: null,
  cityNames: null,
  loading: false,
  error: null,
};

// Get All Cities Thunk
export const getAllCitiesThunk = createAsyncThunk<
  travelcity[],
  void,
  { rejectValue: string }
>("city/getAll", async (_, { rejectWithValue }) => {
  try {
    return await getAllCitiesApi();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch travelcity");
  }
});

// Get City By ID Thunk
export const getCityByIdThunk = createAsyncThunk<
  travelcity,
  number | string,
  { rejectValue: string }
>("city/getById", async (id, { rejectWithValue }) => {
  try {
    return await getCityByIdApi(id);
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch city");
  }
});

// Get City Names Thunk (similar to getCountryCodeThunk)
export const getCityNamesThunk = createAsyncThunk<
  Pick<travelcity, "id" | "uuid" | "cityName">[],
  void,
  { rejectValue: string }
>("city/getNames", async (_, { rejectWithValue }) => {
  try {
    return await getCityNamesApi();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch city names");
  }
});

const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {
    clearCityState: (state) => {
      state.error = null;
      state.city = null;
      state.cityNames = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Cities Cases
      .addCase(getAllCitiesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllCitiesThunk.fulfilled,
        (state, action: PayloadAction<travelcity[]>) => {
          state.loading = false;
          state.travelcity = action.payload;
        },
      )
      .addCase(getAllCitiesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch travelcity";
      })

      // Get City By ID Cases
      .addCase(getCityByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCityByIdThunk.fulfilled,
        (state, action: PayloadAction<travelcity>) => {
          state.loading = false;
          state.city = action.payload;
        },
      )
      .addCase(getCityByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch city";
      })

      // Get City Names Cases (similar to getCountryCodeThunk)
      .addCase(getCityNamesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCityNamesThunk.fulfilled,
        (
          state,
          action: PayloadAction<Pick<travelcity, "id" | "uuid" | "cityName">[]>,
        ) => {
          state.loading = false;
          state.cityNames = action.payload;
        },
      )
      .addCase(getCityNamesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch city names";
      });
  },
});

export const { clearCityState } = citySlice.actions;
export default citySlice.reducer;
