import axiosInstance from "@/utils/axiosInstance";
import { City, Grade, State } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllStates = async (): Promise<State[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<State[]>>(`/states`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch states");
    }
  } catch (error: any) {
    console.error("Get States Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getStateByCity = async (cityName: string): Promise<State[]> => {
  const response = await axiosInstance.get<ApiResponse<State[]>>(
    `/states/${cityName}`,
  );
  const resData = response.data;
  if (!resData.success || !resData.data) {
    throw new Error(resData.message || "Failed to fetch state(s)");
  }
  return resData.data;
};
export const getAllCities = async (): Promise<City[]> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<City[]>>(`/states/allcity`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch cities");
    }
  } catch (error: any) {
    console.error(
      "Get All Cities Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getAllGrade = async (): Promise<Grade[]> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<Grade[]>>("/states/grades");

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to fetch grades");
  } catch (error: any) {
    console.error(
      "Get All Grades Error:",
      error?.response?.data?.message || error.message,
    );

    throw new Error(error?.response?.data?.message || "Unable to fetch grades");
  }
};
