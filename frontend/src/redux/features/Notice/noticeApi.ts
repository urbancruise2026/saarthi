import { Notice } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}

// Get All Notices
export const getAllNotices = async (category?: string): Promise<Notice[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Notice[]>>(
      "/notices",
      {
        params: category ? { category } : {},
      },
    );

    if (response.data.success) {
      return response.data.data || [];
    }

    throw new Error(response.data.message || "Failed to fetch notices");
  } catch (error: any) {
    console.error("Get Notices Error:", error.response?.data || error.message);
    throw error;
  }
};

// Get Single Notice
export const getSingleNotice = async (id: number | string): Promise<Notice> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Notice>>(
      `/notices/${id}`,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch notice");
  } catch (error: any) {
    console.error(
      "Get Single Notice Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Create Notice
export const createNotice = async (data: Partial<Notice>): Promise<Notice> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Notice>>(
      "/notices",
      data,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to create notice");
  } catch (error: any) {
    console.error(
      "Create Notice Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Update Notice
export const updateNotice = async (
  id: number | string,
  data: Partial<Notice>,
): Promise<Notice> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Notice>>(
      `/notices/${id}`,
      data,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to update notice");
  } catch (error: any) {
    console.error(
      "Update Notice Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Delete Notice
export const deleteNotice = async (
  id: number | string,
): Promise<number | string> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/notices/${id}`,
    );

    if (response.data.success) {
      return id;
    }

    throw new Error(response.data.message || "Failed to delete notice");
  } catch (error: any) {
    console.error(
      "Delete Notice Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
