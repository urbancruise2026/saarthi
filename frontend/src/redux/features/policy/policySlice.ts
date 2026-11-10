import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Policy } from "@/types";
import {
  createPolicy,
  deletePolicy,
  getAllPolicies,
  updatePolicyStatus,
  updateShoStatus,
} from "./policyApi";

interface PolicyState {
  policies: Policy[];
  loading: boolean;
  error: string | null;
}

const initialState: PolicyState = {
  policies: [],
  loading: false,
  error: null,
};

export const fetchPolicies = createAsyncThunk<
  Policy[],
  string | undefined,
  { rejectValue: string }
>("policy/fetchPolicies", async (category, { rejectWithValue }) => {
  try {
    const data: Policy[] = await getAllPolicies(category);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch policies",
    );
  }
});

export const addPolicy = createAsyncThunk<
  Policy,
  Partial<Policy>,
  { rejectValue: string }
>("policy/addPolicy", async (data, { rejectWithValue }) => {
  try {
    const response: Policy = await createPolicy(data);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to create policy",
    );
  }
});

export const removePolicy = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("policy/removePolicy", async (id, { rejectWithValue }) => {
  try {
    await deletePolicy(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to delete policy",
    );
  }
});

export const updateHrPolicyStatus = createAsyncThunk<
  { id: number; hr_head_status: string; hr_head_remark: string },
  { id: number; hr_head_status: string; hr_head_remark: string },
  { rejectValue: string }
>("policy/updateHrStatus", async (data, { rejectWithValue }) => {
  try {
    await updatePolicyStatus(data.id.toString(), {
      hr_head_status: data.hr_head_status,
      hr_head_remark: data.hr_head_remark,
    });

    return data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "HR status update failed",
    );
  }
});

export const updateShoPolicyStatus = createAsyncThunk<
  { id: number; sho_status: string; sho_remark: string },
  { id: number; sho_status: string; sho_remark: string },
  { rejectValue: string }
>("policy/updateShoStatus", async (data, { rejectWithValue }) => {
  try {
    await updateShoStatus(data.id.toString(), {
      sho_status: data.sho_status,
      sho_remark: data.sho_remark,
    });

    return data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "SHO status update failed",
    );
  }
});

const policySlice = createSlice({
  name: "policy",
  initialState,
  reducers: {
    clearPolicyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPolicies.fulfilled,
        (state, action: PayloadAction<Policy[]>) => {
          state.loading = false;
          state.policies = action.payload;
        },
      )
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      // ADD
      .addCase(addPolicy.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPolicy.fulfilled, (state, action: PayloadAction<Policy>) => {
        state.loading = false;
        state.policies.unshift(action.payload);
      })
      .addCase(addPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Policy creation failed";
      })

      // DELETE
      .addCase(
        removePolicy.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.policies = state.policies.filter(
            (policy) => policy.id !== action.payload,
          );
        },
      )
      .addCase(removePolicy.rejected, (state, action) => {
        state.error = action.payload || "Delete failed";
      })

      //  HR UPDATE
      .addCase(updateHrPolicyStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateHrPolicyStatus.fulfilled, (state, action) => {
        state.loading = false;

        const { id, hr_head_status, hr_head_remark } = action.payload;

        const policy = state.policies.find((p) => p.id === id);
        if (policy) {
          policy.hr_head_status = hr_head_status as any;
          policy.hr_head_remark = hr_head_remark;
        }
      })
      .addCase(updateHrPolicyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "HR update failed";
      })

      //  SHO UPDATE
      .addCase(updateShoPolicyStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateShoPolicyStatus.fulfilled, (state, action) => {
        state.loading = false;

        const { id, sho_status, sho_remark } = action.payload;

        const policy = state.policies.find((p) => p.id === id);
        if (policy) {
          policy.sho_status = sho_status as any;
          policy.sho_remark = sho_remark;
        }
      })
      .addCase(updateShoPolicyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "SHO update failed";
      });
  },
});

export const { clearPolicyError } = policySlice.actions;
export default policySlice.reducer;
