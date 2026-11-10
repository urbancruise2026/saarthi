import { AxiosError } from "axios";
import { IZoneCity } from "@/types";
import axiosInstance from "@/utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllCities = async (zoneId: number): Promise<IZoneCity[]> => {
  try {
    if (!zoneId || isNaN(zoneId)) {
      throw new Error("Valid zoneId is required");
    }

    const response = await axiosInstance.get<ApiResponse<IZoneCity[]>>(
      `/city/${zoneId}`
    );

    if (response.data.success) {
      return response.data.data ?? [];
    }

    throw new Error(response.data.message || "Failed to fetch cities");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error(
      "Get Cities Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};

export const getCityById = async (cityId: number): Promise<IZoneCity | null> => {
  try {
    if (!cityId || isNaN(cityId)) {
      throw new Error("Valid cityId is required");
    }

    const response = await axiosInstance.get<ApiResponse<IZoneCity>>(
      `/city/by-id/${cityId}`
    );

    if (response.data.success) {
      return response.data.data ?? null;
    }

    throw new Error(response.data.message || "Failed to fetch city");
  } catch (error) {
    const err = error as AxiosError<ApiResponse<null>>;
    console.error(
      "Get City By ID Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};