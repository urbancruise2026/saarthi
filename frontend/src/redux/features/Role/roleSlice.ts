import { Role } from "@/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllRoles } from "./roleApi";
interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

export const fetchRoles = createAsyncThunk(
  "role/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllRoles();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles",
      );
    }
  },
);

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default roleSlice.reducer;
