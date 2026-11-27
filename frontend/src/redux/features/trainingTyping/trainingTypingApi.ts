import axiosInstance from "@/utils/axiosInstance";

export interface TypingEntry {
  date: string;
  day: string;
  time: string;
  score: string | number;
}

export interface SavedTypingEntry {
  id: number;
  date: string;
  day: string;
  time: string;
  score: number;
}

export interface FetchTypingParams {
  subDepartment: string;
  trainingDay: number;
}

export const addTypingScores = async (payload: {
  subDepartment: string;
  trainingDay: number;
  entries: TypingEntry[];
}): Promise<{ count: number }> => {
  const response = await axiosInstance.post("/typing", payload);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to save typing scores");
  }
  return response.data.data ?? { count: payload.entries.length };
};

export const fetchTypingScores = async (
  params: FetchTypingParams,
): Promise<SavedTypingEntry[]> => {
  const response = await axiosInstance.get("/typing", { params });
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch typing scores");
  }
  return response.data.data;
};

export const deleteTypingScore = async (id: number): Promise<number> => {
  const response = await axiosInstance.delete(`/typing/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete score");
  }
  return id;
};
