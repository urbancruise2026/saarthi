import axiosInstance from "@/utils/axiosInstance";

export type TrainingFileType = "video" | "ppt";
export type TrainingCategory = "lead_video" | "lead_ppt";
import type { ModuleKey } from "../../../components/training/constants"; // apne path ke hisaab se

export interface TrainingModule {
  id: number;
  uuid: string;
  department: string;
  subDepartment: string;
  category: TrainingCategory;
  fileType: TrainingFileType;
  fileName: string;
  fileUrl: string; // video ya ppt ka Cloudinary URL
  duration: number | null;
  createdAt: string;
  moduleKey: ModuleKey | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isAuthenticated?: boolean;
}

// MySQL DECIMAL string me aata hai, isliye number me convert
const normalize = (m: any): TrainingModule => ({
  ...m,
  duration:
    m.duration !== null && m.duration !== undefined ? Number(m.duration) : null,
});

// Get Training Modules
export const getTrainingModules = async (params: {
  department?: string;
  subDepartment?: string;
  category?: TrainingCategory;
  fileType?: TrainingFileType;
  moduleKey?: ModuleKey;
}): Promise<TrainingModule[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TrainingModule[]>>(
      "/training-modules",
      { params },
    );

    if (response.data.success) {
      return (response.data.data || []).map(normalize);
    }

    throw new Error(
      response.data.message || "Failed to fetch training modules",
    );
  } catch (error: any) {
    console.error(
      "Get Training Modules Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Upload Training File
export const uploadTrainingModuleFile = async (
  payload: {
    department: string;
    subDepartment: string;
    category: TrainingCategory;
    file: File;
    moduleKey: ModuleKey;
  },
  onProgress?: (percent: number) => void,
): Promise<TrainingModule> => {
  try {
    const formData = new FormData();
    formData.append("department", payload.department);
    formData.append("subDepartment", payload.subDepartment);
    formData.append("category", payload.category);
    formData.append("moduleKey", payload.moduleKey);
    formData.append("file", payload.file);

    const response = await axiosInstance.post<ApiResponse<TrainingModule>>(
      "/training-modules",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0, // bade video ke liye timeout nahi
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      },
    );

    if (response.data.success && response.data.data) {
      return normalize(response.data.data);
    }

    throw new Error(response.data.message || "Failed to upload training file");
  } catch (error: any) {
    console.error(
      "Upload Training Module Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Delete Training Module
export const deleteTrainingModule = async (id: number) => {
  try {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/training-modules/${id}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Delete failed");
    }

    return true;
  } catch (error: any) {
    console.error(
      "Delete Training Module Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// ---------- Start Date (Training Date) ----------

export const getTrainingStartDate = async (params: {
  department: string;
  subDepartment: string;
}): Promise<string | null> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<{ startDate: string | null }>
    >("/training-modules/start-date", { params });

    if (response.data.success) {
      return response.data.data?.startDate ?? null;
    }
    throw new Error(response.data.message || "Failed to fetch start date");
  } catch (error: any) {
    console.error(
      "Get Start Date Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const saveTrainingStartDate = async (payload: {
  department: string;
  subDepartment: string;
  startDate: string; // "YYYY-MM-DD"
}): Promise<string> => {
  try {
    const response = await axiosInstance.put<
      ApiResponse<{ startDate: string }>
    >("/training-modules/start-date", payload);

    if (response.data.success && response.data.data) {
      return response.data.data.startDate;
    }
    throw new Error(response.data.message || "Failed to save start date");
  } catch (error: any) {
    console.error(
      "Save Start Date Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
