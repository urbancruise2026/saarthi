import { Branch } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllBranches = async (): Promise<Branch[]> => {
  const response = await axiosInstance.get<ApiResponse<Branch[]>>("/branches");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch branches");
  }

  return response.data.data || [];
};

export const createBranch = async (
  branchData: Partial<Branch>,
): Promise<Branch> => {
  const response = await axiosInstance.post<ApiResponse<Branch>>(
    "/branches",
    branchData,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create branch");
  }

  return response.data.data;
};

export const updateBranch = async (
  id: number,
  branchData: Partial<Branch>,
): Promise<Branch> => {
  const response = await axiosInstance.put<ApiResponse<Branch>>(
    `/branches/${id}`,
    branchData,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to update branch");
  }

  return response.data.data;
};

export const deleteBranch = async (id: number): Promise<number> => {
  const response = await axiosInstance.delete<ApiResponse<null>>(
    `/branches/${id}`,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete branch");
  }

  return id;
};
