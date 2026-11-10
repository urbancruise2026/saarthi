import { AxiosError } from "axios";
import { IRegion } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllRegions = async (countryId: number): Promise<IRegion[]> => {
  try {
    if (!countryId || isNaN(countryId)) {
      throw new Error("Valid countryId is required");
    }

    const response = await axiosInstance.get<ApiResponse<IRegion[]>>(
      `/region/${countryId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch regions");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error(
      "Get Regions Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};