import { Designation } from "@/types";
import axiosInstance from "@/utils/axiosInstance";
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}

export const getAllDesignations = async (): Promise<Designation[]> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<Designation[]>
    >(`/designation`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch designations");
    }
  } catch (error: any) {
    console.error(
      "Get Designations Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};