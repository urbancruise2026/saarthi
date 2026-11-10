// apne project ke actual path se update kar lena

import axiosInstance from "@/utils/axiosInstance";

export interface CompOffFilters {
  employeeId?: string | number;
  managerId?: string | number;
  hodId?: string | number;
  zonalHeadId?: string | number;
  branchId?: string | number;
  departmentId?: string | number;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CompOff {
  id: number;
  employee_id: number;
  employee_name: string;
  branch_id?: number;
  branch_name?: string;
  department_id?: number;
  department_name?: string;
  status: string;
  earned_date: string;
  [key: string]: any;
}

export interface CompOffPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface CompOffResponse {
  data: CompOff[];
  pagination: CompOffPagination;
}

export const getCompOffs = async (
  filters: CompOffFilters = {},
): Promise<CompOffResponse> => {
  try {
    const response = await axiosInstance.get("/comp-offs", {
      params: filters,
    });
    console.log(" response.data.data ", response.data.data);
    if (response.data && response.data.success) {
      return {
        data: response.data.data.rows,
        pagination: response.data.data.pagination,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch comp offs");
    }
  } catch (error: any) {
    console.error(
      "Get Comp Offs Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
