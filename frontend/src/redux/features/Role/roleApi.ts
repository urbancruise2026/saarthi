import { Role } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Role[]>>(`/role`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch roles");
    }
  } catch (error: any) {
    console.error("Get Roles Error:", error.response?.data || error.message);
    throw error;
  }
};
