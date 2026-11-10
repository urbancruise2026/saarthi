import { Policy } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}

// Get All Policies
export const getAllPolicies = async (category?: string): Promise<Policy[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Policy[]>>(
      "/policies",
      {
        params: category ? { category } : {},
      },
    );

    if (response.data.success) {
      return response.data.data || [];
    }

    throw new Error(response.data.message || "Failed to fetch policies");
  } catch (error: any) {
    console.error("Get Policies Error:", error.response?.data || error.message);
    throw error;
  }
};

// Create Policy
export const createPolicy = async (data: Partial<Policy>): Promise<Policy> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Policy>>(
      `/policies`,
      data,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to create policy");
    }
  } catch (error: any) {
    console.error(
      "Create Policy Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Delete Policy
export const deletePolicy = async (id: string) => {
  try {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/policies/${id}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Delete failed");
    }

    return true;
  } catch (error: any) {
    console.error(
      "Delete Policy Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updatePolicyStatus = async (
  id: string,
  payload: { hr_head_remark: string; hr_head_status: string },
) => {
  try {
    const response = await axiosInstance.patch<ApiResponse<null>>(
      `/policies/hr_approval/${id}`,
      payload,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Update failed");
    }

    return true;
  } catch (error: any) {
    console.error(
      "Update Policy Status Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const updateShoStatus = async (
  id: string,
  payload: { sho_remark: string; sho_status: string },
) => {
  try {
    const response = await axiosInstance.patch<ApiResponse<null>>(
      `/policies/sho_approval/${id}`,
      payload,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Update failed");
    }

    return true;
  } catch (error: any) {
    console.error(
      "Update SHO Status Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
