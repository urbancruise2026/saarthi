import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { IZone } from "@/types";
import { getAllZones } from "./zoneApi";

interface ZoneState {
  zones: IZone[];
  loading: boolean;
  error: string | null;
}

const initialState: ZoneState = {
  zones: [],
  loading: false,
  error: null,
};

export const fetchZonesByRegionId = createAsyncThunk<
  IZone[],
  number,
  { rejectValue: string }
>("zones/fetchZones", async (regionId, { rejectWithValue }) => {
  try {
    const data = await getAllZones(regionId);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch zones",
    );
  }
});

const zoneSlice = createSlice({
  name: "zones",
  initialState,
  reducers: {
    clearZoneError: (state) => {
      state.error = null;
    },
    setZones: (state, action: PayloadAction<IZone[]>) => {
      state.zones = action.payload;
    },
    clearZones: (state) => {
      state.zones = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZonesByRegionId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchZonesByRegionId.fulfilled,
        (state, action: PayloadAction<IZone[]>) => {
          state.loading = false;
          state.zones = action.payload;
        },
      )
      .addCase(fetchZonesByRegionId.rejected, (state, action) => {
        state.loading = false;
        state.zones = [];
        state.error = action.payload || "Failed to fetch zones";
      });
  },
});

export const { clearZoneError, setZones, clearZones } = zoneSlice.actions;
export default zoneSlice.reducer;
