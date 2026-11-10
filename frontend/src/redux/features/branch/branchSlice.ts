import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Branch } from "@/types";
import {
  createBranch,
  deleteBranch,
  getAllBranches,
  updateBranch,
} from "./branchApi";

interface BranchState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  loading: false,
  error: null,
};

export const fetchBranchesThunk = createAsyncThunk(
  "branch/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllBranches();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createBranchThunk = createAsyncThunk(
  "branch/create",
  async (branchData: Partial<Branch>, { rejectWithValue }) => {
    try {
      return await createBranch(branchData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateBranchThunk = createAsyncThunk(
  "branch/update",
  async (
    { id, data }: { id: number; data: Partial<Branch> },
    { rejectWithValue },
  ) => {
    try {
      return await updateBranch(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteBranchThunk = createAsyncThunk(
  "branch/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteBranch(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchBranchesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBranchesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })

      .addCase(fetchBranchesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createBranchThunk.fulfilled, (state, action) => {
        state.branches.unshift(action.payload);
      })

      .addCase(updateBranchThunk.fulfilled, (state, action) => {
        const index = state.branches.findIndex(
          (b) => b.id === action.payload.id,
        );
        if (index !== -1) {
          state.branches[index] = action.payload;
        }
      })

      .addCase(deleteBranchThunk.fulfilled, (state, action) => {
        state.branches = state.branches.filter((b) => b.id !== action.payload);
      });
  },
});

export default branchSlice.reducer;
