import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { City, Grade, State } from "@/types";
import {
  getAllCities,
  getAllGrade,
  getAllStates,
  getStateByCity,
} from "./stateApi";

interface LocationState {
  states: State[];
  cities: City[];
  grades: Grade[];

  permanentStates: State[];
  currentStates: State[];

  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  states: [],
  cities: [],
  grades: [],

  permanentStates: [],
  currentStates: [],

  loading: false,
  error: null,
};

/* FETCH STATES */
export const fetchStates = createAsyncThunk<
  State[],
  void,
  { rejectValue: string }
>("location/fetchStates", async (_, { rejectWithValue }) => {
  try {
    return await getAllStates();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch states",
    );
  }
});

/* FETCH ALL CITIES */
export const fetchAllCities = createAsyncThunk<
  City[],
  void,
  { rejectValue: string }
>("location/fetchAllCities", async (_, { rejectWithValue }) => {
  try {
    return await getAllCities();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch cities",
    );
  }
});

export const fetchAllGrades = createAsyncThunk<
  Grade[],
  void,
  { rejectValue: string }
>("location/fetchAllGrades", async (_, { rejectWithValue }) => {
  try {
    return await getAllGrade();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch grade",
    );
  }
});

/* FETCH STATE(S) BY CITY NAME */
export const fetchStateByCity = createAsyncThunk<
  { data: State[]; type: "permanent" | "current" },
  { cityName: string; type: "permanent" | "current" },
  { rejectValue: string }
>(
  "location/fetchStateByCity",
  async ({ cityName, type }, { rejectWithValue }) => {
    try {
      const response = await getStateByCity(cityName);

      let data: State[] = [];

      if (Array.isArray(response)) {
        data = response;
      } else {
        data = [response];
      }

      return { data, type }; // ✅ type return karo
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch state(s)",
      );
    }
  },
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* STATES */
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch states";
      })

      /* CITIES */
      .addCase(fetchAllCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cities";
      })

      /* STATE BY CITY */
      .addCase(fetchStateByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStateByCity.fulfilled, (state, action) => {
        state.loading = false;

        const { data, type } = action.payload;

        if (type === "permanent") {
          state.permanentStates = data;
        } else {
          state.currentStates = data;
        }
      })
      .addCase(fetchStateByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch state(s)";
      })

      /* CITIES */
      .addCase(fetchAllGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllGrades.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = action.payload;
      })
      .addCase(fetchAllGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cities";
      });
  },
});

export const { clearLocationError } = locationSlice.actions;

export default locationSlice.reducer;
