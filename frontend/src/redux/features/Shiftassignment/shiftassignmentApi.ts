import axiosInstance from "@/utils/axiosInstance"; // adjust path to your actual axios instance

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShiftAssignment = {
  id: number;
  employee_id: number;
  employee_name?: string;
  from_date: string;
  to_date: string;
  shift_type: string;
  shift_timing: string;
  week_off: string | null;
  reason: string | null;
  is_active: 0 | 1;
  created_at?: string;
  updated_at?: string;
};

export type CreateShiftAssignmentPayload = {
  employeeId: number;
  fromDate: string;
  toDate: string;
  shiftType: string;
  shiftTiming: string;
  weekOff?: string | null;
  reason?: string | null;
  isActive?: 0 | 1;
};

export type UpdateShiftAssignmentPayload =
  Partial<CreateShiftAssignmentPayload>;

export type GetShiftAssignmentsParams = {
  employeeId?: number | string;
  isActive?: 0 | 1 | string;
  fromDate?: string;
  toDate?: string;
};

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Create a new shift assignment for an employee.
 */
export const createShiftAssignment = async (
  payload: CreateShiftAssignmentPayload,
) => {
  try {
    const response = await axiosInstance.post("/shift-assignments", payload);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to create shift assignment",
      );
    }
  } catch (error: any) {
    console.error(
      "Create Shift Assignment Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Fetch shift assignments with optional filters.
 */
export const getShiftAssignments = async (
  params: GetShiftAssignmentsParams = {},
): Promise<ShiftAssignment[]> => {
  try {
    const response = await axiosInstance.get("/shift-assignments", {
      params,
    });
    console.log(" get all sift ", response.data.data);
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch shift assignments",
      );
    }
  } catch (error: any) {
    console.error(
      "Get Shift Assignments Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Fetch a single shift assignment by id.
 */
export const getShiftAssignmentById = async (
  id: number | string,
): Promise<ShiftAssignment> => {
  try {
    const response = await axiosInstance.get(`/shift-assignments/${id}`);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch shift assignment",
      );
    }
  } catch (error: any) {
    console.error(
      "Get Shift Assignment By Id Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getShiftAssignmentsByEmployee = async (
  employeeId: number | string,
): Promise<ShiftAssignment[]> => {
  try {
    const response = await axiosInstance.get(
      `/shift-assignments/employee/${employeeId}`,
    );

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch employee shift history",
      );
    }
  } catch (error: any) {
    console.error(
      "Get Shift Assignments By Employee Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Update an existing shift assignment.
 */
export const updateShiftAssignment = async (
  id: number | string,
  payload: UpdateShiftAssignmentPayload,
) => {
  try {
    const response = await axiosInstance.put(
      `/shift-assignments/update/${id}`,
      payload,
    );

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to update shift assignment",
      );
    }
  } catch (error: any) {
    console.error(
      "Update Shift Assignment Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteShiftAssignment = async (
  id: number | string,
  hardDelete = false,
) => {
  try {
    const response = await axiosInstance.delete(`/shift-assignments/${id}`, {
      params: hardDelete ? { hard: "true" } : undefined,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to deactivate shift assignment",
      );
    }
  } catch (error: any) {
    console.error(
      "Delete Shift Assignment Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
