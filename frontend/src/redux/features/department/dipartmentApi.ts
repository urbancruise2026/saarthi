import { Department } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}
export interface DepartmentRole {
  subDepartment_name: string; // subDepartment_name
  role_name: string; // role_name
  id: number; // unique id
}

export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<Department[]>>(`/department`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch departments");
    }
  } catch (error: any) {
    console.error(
      "Get Departments Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getDepartmentRoles = async ( 
  departmentId: number,
): Promise<DepartmentRole[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DepartmentRole[]>>(
      `/department/${departmentId}`,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch department roles",
      );
    }
  } catch (error: any) {
    console.error(
      "Get Department Roles Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getRolesBySubDepartment = async (
  subDepartmentId: number,
): Promise<DepartmentRole[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DepartmentRole[]>>(
      `/department/role/${subDepartmentId}`,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch department roles",
      );
    }
  } catch (error: any) {
    console.error(
      "Get Department Roles Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getHoByDepartment = async (
  departmentId: number,
): Promise<DepartmentRole[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DepartmentRole[]>>(
      `/department/ho/${departmentId}`,
    ); 

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch department ho");
    }
  } catch (error: any) {
    console.error(
      "Get Department ho Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
