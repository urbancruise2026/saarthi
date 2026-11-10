import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCountries, ICountry } from "./countryApi";

interface CountryState {
  countries: ICountry[];
  loading: boolean;
  error: string | null;
}

const initialState: CountryState = {
  countries: [],
  loading: false,
  error: null,
};

export const fetchCountries = createAsyncThunk<
  ICountry[],
  void,
  { rejectValue: string }
>("country/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await getAllCountries();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch countries"
    );
  }
});

const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch countries";
      });
  },
});

export default countrySlice.reducer;