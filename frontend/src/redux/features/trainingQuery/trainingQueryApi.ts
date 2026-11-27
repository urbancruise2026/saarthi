import axiosInstance from "@/utils/axiosInstance";

// ======================================================
// TYPES
// ======================================================

export type QueryStatus = "pending" | "answered" | "closed";

export interface TrainingQueryItem {
  id: number;
  batchId: string;
  employeeId: number;
  department?: string;
  subDepartment: string;
  day: number;
  moduleName?: string;
  question: string;
  status: QueryStatus;
  answer: string | null;
  answeredBy?: number | null;
  answeredAt?: string | null;
  createdAt: string;
}

export interface ModuleQueries {
  moduleName: string;
  total: number;
  questions: TrainingQueryItem[];
}

export interface DayQueries {
  day: number;
  modules: ModuleQueries[];
}

export interface FetchQueriesParams {
  status?: QueryStatus;
  subDepartment?: string;
  day?: number;
  moduleName?: string;
}

// ======================================================
// RAISE TRAINING QUESTIONS
// Employee submits multiple questions
// ======================================================

export const raiseTrainingQuery = async (payload: {
  department: string;
  subDepartment: string;
  day: number;
  moduleName: string;
  questions: string[];
}): Promise<{ count: number; batchId: string }> => {
  const response = await axiosInstance.post("/training-queries", payload);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to raise query");
  }

  return response.data.data;
};

// ======================================================
// GET ALL TRAINING QUESTIONS
// Admin / Trainer
// ======================================================

export const fetchTrainingQueries = async (
  params?: FetchQueriesParams,
): Promise<DayQueries[]> => {
  const response = await axiosInstance.get("/training-queries", { params });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch queries");
  }

  return response.data.data;
};

// ======================================================
// GET LOGGED-IN EMPLOYEE'S OWN QUESTIONS
// Employee can see only their own questions and answers
// ======================================================

export const fetchMyTrainingQueries = async (): Promise<
  TrainingQueryItem[]
> => {
  const response = await axiosInstance.get("/training-queries/my");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch your queries");
  }

  return response.data.data;
};

// ======================================================
// ANSWER TRAINING QUESTION
// Admin / Trainer
// ======================================================

export const answerTrainingQuery = async (payload: {
  queryId: number | string;
  answer: string;
}) => {
  const response = await axiosInstance.patch(
    `/training-queries/${payload.queryId}/answer`,
    {
      answer: payload.answer,
    },
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to submit answer");
  }

  return response.data.data;
};
