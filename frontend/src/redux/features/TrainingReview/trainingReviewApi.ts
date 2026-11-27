import axiosInstance from "@/utils/axiosInstance";
import type {
  Assistance,
  DayReview,
  Understood,
} from "@/components/training/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type SameReviewPayload = {
  department: string;
  subDepartment: string;
  day: number;
  moduleName: string;
  understood: Understood;
  learned: string;
  suggestions: string;
  assistance: Assistance;
  assistanceDetails: string;
};

// Server se aaya review (day ke saath) -> DayReview
export type ServerReview = DayReview & { day: number };

// Track table ki ek row (employee ke naam ke saath)
export type TrackReview = {
  id: number;
  employeeId: number | string;
  employeeName: string | null;
  employeeCode: string | null;
  department: string;
  subDepartment: string;
  day: number;
  moduleName: string | null;
  understood: "yes" | "no";
  learned: string;
  suggestions: string | null;
  assistance: "yes" | "no";
  assistanceDetails: string | null;
  completedAt: string;
};

export type TrackParams = {
  subDepartment?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type TrackResult = {
  rows: TrackReview[];
  total: number;
  page: number;
  limit: number;
};

export const getMyReviews = async (
  subDepartment: string,
): Promise<ServerReview[]> => {
  const res = await axiosInstance.get<ApiResponse<ServerReview[]>>(
    "/training-reviews/my",
    { params: { subDepartment } },
  );
  if (res.data.success) return res.data.data || [];
  throw new Error(res.data.message || "Failed to fetch reviews");
};

// ✅ Sabhi employees ke reviews (HR / SUPER_ADMIN)
export const getAllReviews = async (
  params: TrackParams = {},
): Promise<TrackResult> => {
  const res = await axiosInstance.get<ApiResponse<TrackResult>>(
    "/training-reviews/all",
    { params },
  );
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || "Failed to fetch all reviews");
};

export const saveReview = async (
  payload: SameReviewPayload,
): Promise<ServerReview> => {
  const res = await axiosInstance.post<ApiResponse<ServerReview>>(
    "/training-reviews",
    payload,
  );
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || "Failed to save review");
};
