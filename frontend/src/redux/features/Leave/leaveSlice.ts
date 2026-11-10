import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  applyLeave,
  updateLeaveStatus,
  getMyLeaves,
  getLeaveById,
  getAllLeaves,
  getMyLeaveBalances,
  getMyLeaveLedger,
  getLeaveSummary,
  getLeaveBalanceSummary, // NEW
  LeaveBalance,
  LeaveLedgerEntry,
  LeaveSummaryRow,
  LeaveSummaryFilters,
  LeaveBalanceSummary, // NEW
  LeaveBalanceSummaryFilters, // NEW
} from "./leaveApi";

import {
  LeaveFilters,
  ApplyLeavePayload,
  UpdateLeaveStatusPayload,
  LeaveRequest,
} from "@/components/Leave/Leaveutils";

// ---------- Thunks ----------

export const applyLeaveThunk = createAsyncThunk(
  "leave/apply",
  async (payload: ApplyLeavePayload, { rejectWithValue }) => {
    try {
      return await applyLeave(payload);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply leave",
      );
    }
  },
);

export const updateLeaveStatusThunk = createAsyncThunk(
  "leave/updateStatus",
  async (payload: UpdateLeaveStatusPayload, { rejectWithValue }) => {
    try {
      return await updateLeaveStatus(payload);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave status",
      );
    }
  },
);

export const getMyLeavesThunk = createAsyncThunk(
  "leave/getMyLeaves",
  async (
    filters: Omit<LeaveFilters, "employeeId"> = {},
    { rejectWithValue },
  ) => {
    try {
      return await getMyLeaves(filters);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch my leaves",
      );
    }
  },
);

export const getLeaveByIdThunk = createAsyncThunk(
  "leave/getById",
  async (leaveId: number | string, { rejectWithValue }) => {
    try {
      return await getLeaveById(leaveId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave",
      );
    }
  },
);

export const getAllLeavesThunk = createAsyncThunk(
  "leave/getAll",
  async (filters: LeaveFilters = {}, { rejectWithValue }) => {
    try {
      return await getAllLeaves(filters);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaves",
      );
    }
  },
);

export const getMyLeaveBalancesThunk = createAsyncThunk(
  "leave/getMyBalances",
  async (year: number | undefined, { rejectWithValue }) => {
    try {
      return await getMyLeaveBalances(year);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave balances",
      );
    }
  },
);

export const getMyLeaveLedgerThunk = createAsyncThunk(
  "leave/getMyLedger",
  async (year: number | undefined, { rejectWithValue }) => {
    try {
      return await getMyLeaveLedger(year);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave ledger",
      );
    }
  },
);

export const getLeaveSummaryThunk = createAsyncThunk(
  "leave/getSummary",
  async (filters: LeaveSummaryFilters = {}, { rejectWithValue }) => {
    try {
      return await getLeaveSummary(filters);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave summary",
      );
    }
  },
);

// Cards ke liye summary (employee / manager / admin sabke liye ek hi)
export const getLeaveBalanceSummaryThunk = createAsyncThunk(
  "leave/getBalanceSummary",
  async (filters: LeaveBalanceSummaryFilters = {}, { rejectWithValue }) => {
    try {
      return await getLeaveBalanceSummary(filters);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch leave balance summary",
      );
    }
  },
);

// ---------- State ----------

interface LeaveState {
  leaves: LeaveRequest[];
  myLeaves: LeaveRequest[];
  currentLeave: LeaveRequest | null;
  balances: LeaveBalance[];
  ledger: LeaveLedgerEntry[];
  summary: LeaveSummaryRow[];
  loading: boolean;
  summaryLoading: boolean;
  // approve/reject ke dauraan sirf us row ka loader
  actionLoadingId: string | number | null;
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  error: string | null;

  balanceSummary: LeaveBalanceSummary | null; // NEW

  balanceSummaryLoading: boolean; // NEW
}

const initialState: LeaveState = {
  leaves: [],
  myLeaves: [],
  currentLeave: null,
  balances: [],
  ledger: [],
  summary: [],
  balanceSummary: null, // NEW
  loading: false,
  summaryLoading: false,
  balanceSummaryLoading: false, // NEW
  actionLoadingId: null,
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
  error: null,
};

// Backend kabhi array bhejta hai, kabhi { data: [...] }
const toArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.leaves)) return payload.leaves;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    clearCurrentLeave: (state) => {
      state.currentLeave = null;
    },
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Apply Leave
      .addCase(applyLeaveThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeaveThunk.fulfilled, (state) => {
        // Backend sirf { id, status } deta hai, poori row nahi.
        // List refetch se aayegi, isliye yahan kuch push nahi karte.
        state.loading = false;
      })
      .addCase(applyLeaveThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Leave Status
      .addCase(updateLeaveStatusThunk.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.leaveId;
        state.error = null;
      })
      .addCase(updateLeaveStatusThunk.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const updated = action.payload;
        if (!updated) return;

        state.leaves = state.leaves.map((leave) =>
          leave.id === updated.id ? { ...leave, ...updated } : leave,
        );
        if (state.currentLeave?.id === updated.id) {
          state.currentLeave = { ...state.currentLeave, ...updated };
        }
      })
      .addCase(updateLeaveStatusThunk.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload as string;
      })

      // Get My Leaves
      .addCase(getMyLeavesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyLeavesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = toArray(action.payload);
      })
      .addCase(getMyLeavesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Leave By Id
      .addCase(getLeaveByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getLeaveByIdThunk.fulfilled,
        (state, action: PayloadAction<LeaveRequest>) => {
          state.loading = false;
          state.currentLeave = action.payload;
        },
      )
      .addCase(getLeaveByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get All Leaves
      .addCase(getAllLeavesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeavesThunk.fulfilled, (state, action) => {
        const payload: any = action.payload || {};
        // Nested { pagination: {...} } ya flat { total, totalPages, ... } dono chalenge
        const p = payload.pagination || payload;

        state.loading = false;
        state.leaves = toArray(payload);
        state.total = p.total || 0;
        state.totalPages = p.totalPages || 1;
        state.page = p.page || 1;
        state.limit = p.limit || 10;
        state.hasNextPage = p.hasNextPage ?? state.page < state.totalPages;
        state.hasPrevPage = p.hasPrevPage ?? state.page > 1;
      })
      .addCase(getAllLeavesThunk.rejected, (state, action) => {
        state.loading = false;
        state.leaves = [];
        state.error = (action.payload as string) || "Failed to fetch leaves";
      })

      // My Balances
      .addCase(getMyLeaveBalancesThunk.fulfilled, (state, action) => {
        state.balances = action.payload;
      })
      .addCase(getMyLeaveBalancesThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // My Ledger
      .addCase(getMyLeaveLedgerThunk.fulfilled, (state, action) => {
        state.ledger = action.payload;
      })
      .addCase(getMyLeaveLedgerThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Summary (Leave Management table)
      .addCase(getLeaveSummaryThunk.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(getLeaveSummaryThunk.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(getLeaveSummaryThunk.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summary = [];
        state.error = action.payload as string;
      })
      // Balance Summary (cards)
      .addCase(getLeaveBalanceSummaryThunk.pending, (state) => {
        state.balanceSummaryLoading = true;
        state.error = null;
      })
      .addCase(getLeaveBalanceSummaryThunk.fulfilled, (state, action) => {
        state.balanceSummaryLoading = false;
        state.balanceSummary = action.payload;
      })
      .addCase(getLeaveBalanceSummaryThunk.rejected, (state, action) => {
        state.balanceSummaryLoading = false;
        state.balanceSummary = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentLeave, clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
