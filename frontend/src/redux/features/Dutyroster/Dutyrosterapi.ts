import axiosInstance from "@/utils/axiosInstance";

export interface DutyRosterRecord {
  id: number;
  branch_id: number;
  branch_name?: string;

  employee_id: number;
  employee_name?: string;
  full_name?: string;

  duty_date: string;
  status: "Present" | "Absent";

  is_active: 0 | 1;

  created_at?: string;
  updated_at?: string;
}

export interface DutyRosterPayload {
  branchId: number;
  employeeId: number;
  dutyDate: string;
  status: "Present" | "Absent";
  isActive: 0 | 1;
}

export interface DutyRosterListParams {
  isActive?: string;
  employeeId?: string;
  branchId?: string;
}

/* =========================
   GET DUTY ROSTER LIST
========================= */

export const getDutyRosterList = async (
  params?: DutyRosterListParams,
): Promise<DutyRosterRecord[]> => {
  const response = await axiosInstance.get("/duty-roster", {
    params,
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch duty roster");
  }

  return response.data.data;
};

/* =========================
   GET EMPLOYEES FOR DUTY ROSTER
========================= */

export interface DutyRosterEmployee {
  id: number;
  full_name: string;
}

export const getEmployeesDutyRoster = async (
  branchId?: number | string,
  departmentId?: number | string,
): Promise<DutyRosterEmployee[]> => {
  const response = await axiosInstance.get("/duty-roster/empleedutyroster", {
    params: {
      branchId: branchId || undefined,
      departmentId: departmentId || undefined,
    },
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch employees");
  }
  
  return response.data.data;
};

/* =========================
   CREATE DUTY ROSTER
========================= */

// api/dutyRosterApi.ts (ya jahan bhi ye function hai)



export const createDutyRoster = async (
  entries: DutyRosterPayload[],
): Promise<DutyRosterRecord[]> => {
  

  const response = await axiosInstance.post("/duty-roster", { entries });

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Failed to create duty roster entries",
    );
  }

  return response.data.data;
};

/* =========================
   UPDATE DUTY ROSTER
========================= */

export const updateDutyRoster = async (
  payload: DutyRosterPayload & { id: number },
): Promise<DutyRosterRecord> => {
  const response = await axiosInstance.put("/duty-roster/update", payload);

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Failed to update duty roster entry",
    );
  }

  return response.data.data;
};

/* =========================
   DEACTIVATE DUTY ROSTER
========================= */

export const deactivateDutyRoster = async (id: number): Promise<number> => {
  const response = await axiosInstance.put("/duty-roster/deactivate", { id });

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Failed to deactivate duty roster entry",
    );
  }

  return id;
};
