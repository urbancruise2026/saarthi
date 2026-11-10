import { BGVData } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Full paginated response
export interface BGVListResponse {
  data: BGVData;
  pagination: PaginationMeta;
}

export interface BGVParams {
  page?: number;
  limit?: number;
  employee_id?: string;
  overall_status?: string;
}

export const createBGVapi = async (
  payload: Record<string, any>,
): Promise<{ insertId: number }> => {
  const response = await axiosInstance.post<ApiResponse<{ insertId: number }>>(
    "/background",
    payload,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create BGV");
  }

  return response.data.data;
};

export const getAllBGVApi = async (
  params: BGVParams = {},
): Promise<BGVListResponse> => {
  const { page = 1, limit, employee_id, overall_status } = params;

  const response = await axiosInstance.get<ApiResponse<BGVListResponse>>(
    "/background",
    {
      params: {
        page,
        limit,
        ...(employee_id && { employee_id }),
        ...(overall_status && { overall_status }),
      },
    },
  );
  console.log(" response BGV data  ", response);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch BGV list");
  }

  return response.data.data;
};
