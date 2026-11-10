import axiosInstance from "@/utils/axiosInstance"; // apna actual path daalna

interface AttendanceFilters {
  date?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string | number;
  branchId?: string | number;
  departmentId?: string | number;
  status?: string;
}

interface MarkAttendancePayload {
  employeeId: string | number;
  attendanceDate: string;
  status: "Present" | "Absent" | "Half Day" | "Leave" | "Holiday";
  punchIn?: string | null;
  punchOut?: string | null;
  shiftType?: "Regular" | "Temporary";
  shiftTiming?: string | null;
  leaveType?:
    | "Sick Leave"
    | "Casual Leave"
    | "Earned Leave"
    | "Unpaid Leave"
    | "Comp Off"
    | null;
  remarks?: string | null;
}

// Get attendance list (admin/HR view) with filters
export const getAttendance = async (filters: AttendanceFilters = {}) => {
  try {
    const response = await axiosInstance.get("/attendance", {
      params: filters,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch attendance");
    }
  } catch (error: any) {
    console.error(
      "Get Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Get logged-in user's own attendance
// employeeId, branchId, departmentId omit — ye backend khud userId se decide karta hai
export const getMyAttendance = async (
  filters: Omit<
    AttendanceFilters,
    "employeeId" | "branchId" | "departmentId"
  > = {},
) => {
  try {
    const response = await axiosInstance.get("/attendance/me", {
      params: filters,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch your attendance",
      );
    }
  } catch (error: any) {
    console.error(
      "Get My Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const markAttendance = async (payload: MarkAttendancePayload) => {
  try {
    const response = await axiosInstance.post("/attendance", payload);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to mark attendance");
    }
  } catch (error: any) {
    console.error(
      "Mark Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateAttendance = async (payload: MarkAttendancePayload) => {
  try {
    const response = await axiosInstance.put("/attendance/update", payload);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to mark attendance");
    }
  } catch (error: any) {
    console.error(
      "Mark Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Get Monthly Attendance (Admin / HR)
export const getMonthlyAttendance = async (filters: AttendanceFilters = {}) => {
  try {
    const response = await axiosInstance.get("/attendance/monthly", {
      params: filters,
    });
    console.log(" response.data.data-------- ", response.data.data);
    if (response.data?.success) {
      return response.data.data;
    }

    throw new Error(
      response.data?.message || "Failed to fetch monthly attendance",
    );
  } catch (error: any) {
    console.error(
      "Get Monthly Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Get Logged-in Employee Monthly Attendance
export const getMyMonthlyAttendance = async (
  filters: Omit<
    AttendanceFilters,
    "employeeId" | "branchId" | "departmentId" | "month"
  > = {},
) => {
  try {
    const response = await axiosInstance.get("/attendance/my-monthly", {
      params: filters,
    });

    if (response.data?.success) {
      return response.data.data;
    }

    throw new Error(
      response.data?.message || "Failed to fetch my monthly attendance",
    );
  } catch (error: any) {
    console.error(
      "Get My Monthly Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateAttendanceStatus = async (
  payload: MarkAttendancePayload,
) => {
  try {
    const response = await axiosInstance.patch("/attendance/status", payload);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to mark attendance");
    }
  } catch (error: any) {
    console.error(
      "Mark Attendance Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export interface UpdateEarlyExitPayload {
  attendanceId: number;
  earlyExitReason: string;
  earlyExitApprovedBy?: number | null;
}

export const updateEarlyExitDetails = async (
  payload: UpdateEarlyExitPayload,
) => {
  try {
    const response = await axiosInstance.patch(
      "/attendance/early-exit",
      payload,
    );

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to update early exit details",
      );
    }
  } catch (error: any) {
    console.error(
      "Update Early Exit Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
