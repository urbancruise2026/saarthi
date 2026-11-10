import { AxiosError } from "axios";
import { IZone } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllZones = async (regionId: number): Promise<IZone[]> => {
  try {
    if (!regionId || isNaN(regionId)) {
      throw new Error("Valid regionId is required");
    }

    const response = await axiosInstance.get<ApiResponse<IZone[]>>(
      `/zone/${regionId}`
    );

    if (response.data.success) {
      return response.data.data ?? [];
    }

    throw new Error(response.data.message || "Failed to fetch zones");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error(
      "Get Zones Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};