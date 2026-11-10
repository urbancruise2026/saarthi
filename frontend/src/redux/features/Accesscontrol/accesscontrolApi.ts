import { AxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type EmployeeAssignmentForm = {
  employee_id: number | null;
  department_id: number | null;
  subDepartment_id: number | null;
  role_id: number | null;
  region_ids: number[];
  zone_ids: number[];
  city_ids: number[];
  manager_id: number | null;
  manager_name: string;
  country_id: number | null;
};

export interface IAccessControl {
  id?: number;
  employee_id: number;
  employee_name?: string;
  department_id: number;
  department_name?: string;
  subdepartment_id: number;
  subdepartment_name?: string;
  role_id: number;
  role_name?: string;
  reporting_manager_id: number | null;
  manager_name?: string;
  country_id: number | null;
  region_ids: number[];
  region_names?: string[];
  zone_ids: number[];
  zone_names?: string[];
  city_ids: number[];
  city_names?: string[];
  created_at?: string;
  updated_at?: string;
}

// ==============================
// Helper: frontend -> backend
// ==============================
const mapPayload = (
  payload: EmployeeAssignmentForm,
): Omit<IAccessControl, "id"> => ({
  employee_id: payload.employee_id ?? 0,
  department_id: payload.department_id ?? 0,
  subdepartment_id: payload.subDepartment_id ?? 0,
  role_id: payload.role_id ?? 0,
  reporting_manager_id: payload.manager_id ?? null,
  country_id: payload.country_id ?? null,
  region_ids: payload.region_ids ?? [],
  zone_ids: payload.zone_ids ?? [],
  city_ids: payload.city_ids ?? [],
  manager_name: payload.manager_name ?? "",
});

// ==============================
// CREATE
// POST /api/access-control
// ==============================
export const createAccessControl = async (
  payload: EmployeeAssignmentForm,
): Promise<IAccessControl> => {
  try {
    const response = await axiosInstance.post<ApiResponse<IAccessControl>>(
      `/access-control`,
      mapPayload(payload),
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to create access control");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error("Create Error:", err.response?.data?.message || err.message);
    throw err;
  }
};

// ==============================
// GET ALL
// GET /api/access-control
// ==============================
export const getAllAccessControls = async (): Promise<IAccessControl[]> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<IAccessControl[]>>(`/access-control`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error("GetAll Error:", err.response?.data?.message || err.message);
    throw err;
  }
};

// ==============================
// GET BY EMPLOYEE ID
// GET /api/access-control/employee/:employeeId
// ==============================
export const getAccessControlByEmployeeId = async (
  employeeId: number,
): Promise<IAccessControl | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<IAccessControl>>(
      `/access-control/employee/${employeeId}`,
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error(
      "GetByEmployee Error:",
      err.response?.data?.message || err.message,
    );
    return null;
  }
};

// ==============================
// UPDATE
// PUT /api/access-control/:id
// ==============================
export const updateAccessControl = async (
  id: number,
  payload: EmployeeAssignmentForm,
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse<null>>(
      `/access-control/${id}`,
      mapPayload(payload),
    );
    if (response.data.success) return true;
    throw new Error(response.data.message || "Failed to update access control");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error("Update Error:", err.response?.data?.message || err.message);
    throw err;
  }
};

// ==============================
// DELETE
// DELETE /api/access-control/:id
// ==============================
export const deleteAccessControl = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/access-control/${id}`,
    );
    if (response.data.success) return true;
    throw new Error(response.data.message || "Failed to delete access control");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error("Delete Error:", err.response?.data?.message || err.message);
    throw err;
  }
};
