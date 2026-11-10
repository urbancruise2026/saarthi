import {
  ApplyLeavePayload,
  LeaveFilters,
  UpdateLeaveStatusPayload,
} from "@/components/Leave/Leaveutils";
import axiosInstance from "@/utils/axiosInstance";

// ---------- Types ----------
export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  opening_balance: number;
  credited: number;
  used: number;
  closing_balance: number;
  leave_code: string;
  leave_name: string;
}

export interface LeaveLedgerEntry {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  month: number | null;
  txn_type: "MONTHLY_CREDIT" | "LEAVE_TAKEN" | "CARRY_FORWARD";
  days: number;
  remarks: string | null;
  leave_code: string;
  created_at: string;
}

export interface LeaveSummaryRow {
  employee_id: number;
  name: string;
  doj: string | null;
  cf: number | string;
  credit: number | string;
  total: number | string;
  used: number | string;
  balance: number | string;
  // { "11": 2 } -> month number : days
  monthly: Record<string, number>;
}

export interface LeaveSummaryFilters {
  year?: number;
  branchId?: string | number;
}

export interface CreditMonthlyPayload {
  year: number;
  fromMonth: number;
  toMonth?: number;
}

// ---------- Helper ----------
// Backend ka { success, data, message } response unwrap karta hai
const unwrap = <T = any>(response: any, fallbackMessage: string): T => {
  if (response.data?.success) {
    return response.data.data as T;
  }
  throw new Error(response.data?.message || fallbackMessage);
};

const logError = (label: string, error: any) => {
  console.error(`${label}:`, error.response?.data || error.message);
};

// ---------- Leave applications ----------
export const applyLeave = async (payload: ApplyLeavePayload) => {
  try {
    const response = await axiosInstance.post("/leaves", payload);
    return unwrap(response, "Failed to apply leave");
  } catch (error: any) {
    logError("Apply Leave Error", error);
    throw error;
  }
};

export const updateLeaveStatus = async (payload: UpdateLeaveStatusPayload) => {
  try {
    const { leaveId, ...rest } = payload;
    const response = await axiosInstance.patch(
      `/leaves/update-status/${leaveId}`,
      rest,
    );
    return unwrap(response, "Failed to update leave status");
  } catch (error: any) {
    logError("Update Leave Status Error", error);
    throw error;
  }
};

export const getMyLeaves = async (
  filters: Omit<LeaveFilters, "employeeId"> = {},
) => {
  try {
    const response = await axiosInstance.get("/leaves/my-leaves", {
      params: filters,
    });
    return unwrap(response, "Failed to fetch my leaves");
  } catch (error: any) {
    logError("Get My Leaves Error", error);
    throw error;
  }
};

export const getLeaveById = async (leaveId: number | string) => {
  try {
    const response = await axiosInstance.get(`/leaves/${leaveId}`);
    return unwrap(response, "Failed to fetch leave");
  } catch (error: any) {
    logError("Get Leave Error", error);
    throw error;
  }
};

export const getAllLeaves = async (filters: LeaveFilters = {}) => {
  try {
    const response = await axiosInstance.get("/leaves", {
      params: filters,
    });
    const result = unwrap<any>(response, "Failed to fetch leaves");

    if (result?.pagination) {
      const { page, limit, total, totalPages } = result.pagination;
      return {
        ...result,
        leaves: result.data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }

    return result;
  } catch (error: any) {
    logError("Get All Leaves Error", error);
    throw error;
  }
};

// ---------- Leave balance / ledger ----------
export const getMyLeaveBalances = async (year?: number) => {
  try {
    const response = await axiosInstance.get("/leave-balances/my", {
      params: { year },
    });
    return unwrap<LeaveBalance[]>(response, "Failed to fetch leave balances");
  } catch (error: any) {
    logError("Get My Leave Balances Error", error);
    throw error;
  }
};

export const getMyLeaveLedger = async (year?: number) => {
  try {
    const response = await axiosInstance.get("/leave-balances/my/ledger", {
      params: { year },
    });
    return unwrap<LeaveLedgerEntry[]>(response, "Failed to fetch leave ledger");
  } catch (error: any) {
    logError("Get My Leave Ledger Error", error);
    throw error;
  }
};

// Leave Management table ke liye: har employee ka yearly summary
export const getLeaveSummary = async (filters: LeaveSummaryFilters = {}) => {
  try {
    const response = await axiosInstance.get("/leave-balances/summary", {
      params: filters,
    });
    return unwrap<LeaveSummaryRow[]>(response, "Failed to fetch leave summary");
  } catch (error: any) {
    logError("Get Leave Summary Error", error);
    throw error;
  }
};

// Admin / HR: monthly credit manually chalane ke liye (backfill)
export const creditMonthlyLeave = async (payload: CreditMonthlyPayload) => {
  try {
    const response = await axiosInstance.post(
      "/leave-balances/credit-monthly",
      payload,
    );
    return unwrap(response, "Failed to credit monthly leave");
  } catch (error: any) {
    logError("Credit Monthly Leave Error", error);
    throw error;
  }
};

// Admin / HR: saal ke end ka carry forward
export const carryForwardLeave = async (fromYear: number) => {
  try {
    const response = await axiosInstance.post("/leave-balances/carry-forward", {
      fromYear,
    });
    return unwrap(response, "Failed to carry forward leave");
  } catch (error: any) {
    logError("Carry Forward Leave Error", error);
    throw error;
  }
};

// Cards ke liye summary (ek hi API: employee / manager / admin sabke liye)
export interface LeaveBalanceSummary {
  year: number;
  carryForward: number;
  totalLeave: number;
  leavesTaken: number;
  leavesRemaining: number;
  compOffBalance: number;
}

export interface LeaveBalanceSummaryFilters {
  year?: number;
  employeeId?: number | string;
  branchId?: number | string;
  departmentId?: number | string;
  managerId?: number | string;
  scope?: "self"; // manager/admin sirf apna dekhe
}

// Cards ke liye summary: role ke hisaab se apna / team ka / branch-department ka
export const getLeaveBalanceSummary = async (
  filters: LeaveBalanceSummaryFilters = {},
) => {
  try {
    const response = await axiosInstance.get("/leave-balances/summary", {
      params: filters,
    });
    return unwrap<LeaveBalanceSummary>(
      response,
      "Failed to fetch leave balance summary",
    );
  } catch (error: any) {
    logError("Get Leave Balance Summary Error", error);
    throw error;
  }
};
