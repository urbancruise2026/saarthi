import axiosInstance from "@/utils/axiosInstance";

export interface HolidayFilters {
  branchId?: string;
  year?: number;
}

export interface CreateHolidayPayload {
  branchId: string;
  date: string;
  name: string;
}

export interface UpdateHolidayPayload {
  id: string;
  branchId?: string;
  date?: string;
  name?: string;
}

export const getHolidays = async (filters: HolidayFilters = {}) => {
  try {
    const response = await axiosInstance.get("/holidays", {
      params: filters,
    });

    if (response.data && response.data.success) {
      console.log(" response.data.data ", response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch holidays");
    }
  } catch (error: any) {
    console.error("Get Holidays Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getHolidayYears = async () => {
  try {
    const response = await axiosInstance.get("/holidays/years");

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch holiday years");
    }
  } catch (error: any) {
    console.error(
      "Get Holiday Years Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createHoliday = async (payload: CreateHolidayPayload) => {
  try {
    const response = await axiosInstance.post("/holidays", payload);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to create holiday");
    }
  } catch (error: any) {
    console.error(
      "Create Holiday Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateHoliday = async ({
  id,
  ...payload
}: UpdateHolidayPayload) => {
  try {
    const response = await axiosInstance.put(`/holidays/${id}`, payload);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update holiday");
    }
  } catch (error: any) {
    console.error(
      "Update Holiday Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteHoliday = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/holidays/${id}`);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to delete holiday");
    }
  } catch (error: any) {
    console.error(
      "Delete Holiday Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
