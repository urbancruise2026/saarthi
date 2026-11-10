import { Employee } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface LoginData {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}

// Login
export const loginUser = async (data: LoginData): Promise<Employee> => {
  try {
    console.log("Login API called with data:", data);
    const response = await axiosInstance.post<
      ApiResponse<{
        user: Employee;
        accessToken: string;
        refreshToken: string;
      }>
    >(`/user/login`, data);

    if (response.data.success && response.data.data) {
      return response.data.data.user; // ✅ sirf user return karo
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// Current User
export const currentUser = async (): Promise<Employee> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<Employee>>(`/user/current-user`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Unauthorized");
    }
  } catch (error: any) {
    console.error("Current user error:", error.response?.data || error.message);
    throw error; // Throw karo, slice handle karega
  }
};

export const getUserById = async (id: Number): Promise<Employee> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Employee>>(
      `/user/${id}`,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "User not found");
    }
  } catch (error: any) {
    console.error(
      "Get user by ID error:",
      error.response?.data || error.message,
    );
    throw error; // slice handle karega
  }
};

export const createUser = async (
  formData: Partial<Employee>,
): Promise<Employee> => {
  try {
   
    const response = await axiosInstance.post<ApiResponse<Employee>>(
      `/user`,
      formData,
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "User creation failed");
    }
  } catch (error: any) {
    console.error("Create User Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "User creation failed");
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    await axiosInstance.post(`/auth/logout`);
  } catch (error: any) {
    console.error("Logout Error:", error.response?.data || error.message);
  }
};

export interface PaginatedEmployeeResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllEmployees = async (
  page?: number,
  limit?: number,
): Promise<PaginatedEmployeeResponse> => {
  try {
    const params = new URLSearchParams();

    if (page !== undefined && page !== null) {
      params.append("page", String(page));
    }
    if (limit !== undefined && limit !== null) {
      params.append("limit", String(limit));
    }

    const queryString = params.toString();
    const url = queryString ? `/user?${queryString}` : `/user`;

    const response =
      await axiosInstance.get<ApiResponse<PaginatedEmployeeResponse>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch employees");
    }
  } catch (error: any) {
    console.error(
      "Get Employees Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
// aapka axios setup

export const updateUserById = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`/user/update/${id}`, updateData);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update user");
    }
  } catch (error) {
    console.error("Update User Error:", error.response?.data || error.message);
    throw error;
  }
};
export const updateEmployeeStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/user/updatestatus/${id}`, {
      status,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update status");
    }
  } catch (error) {
    console.error(
      "Update Status Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getEmployeesByStatus = async (page: number, status: string) => {
  try {
    const response = await axiosInstance.get("/user/status", {
      params: {
        page,
        status,
      },
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch employees");
    }
  } catch (error: any) {
    console.error(
      "Fetch Employee By Status Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getReportingManagersByDepartment = async (
  departmentName: string,
) => {
  try {
    const response = await axiosInstance.get(
      `/user/reporting-managers/${departmentName}`,
    );

    if (response.data?.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || "Failed to fetch reporting managers",
      );
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    console.error("Fetch Reporting Managers Error:", message);

    throw new Error(message); // ✅ clean error throw
  }
};

export const getHREmployees = async () => {
  try {
    const response = await axiosInstance.get(`/user/hr-employees`);

    if (response.data?.success) {
      return response.data.data;

      console.log(" getHREmployees ", response.data.data);
    } else {
      throw new Error(response.data?.message || "Failed to fetch HR employees");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    console.error("Fetch HR Employees Error:", message);

    throw new Error(message);
  }
};

export const getEmployees = async (branchId?: number | string) => {
  try {
    const response = await axiosInstance.get("/user/employeesearchlist", {
      params: {
        branchId,
      },
    });

    if (response.data?.success) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to fetch employees");
  } catch (error: any) {
    console.error(
      "Fetch Employees Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
