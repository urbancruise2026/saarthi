import axiosInstance from "@/utils/axiosInstance";

export interface ModuleQuestionParams {
  department: string;
  subDepartment: string;
  moduleKey: string;
}

export interface ModuleQuestion {
  id: number;
  text: string;
}

// Module ke saved questions
export const fetchModuleQuestions = async (
  params: ModuleQuestionParams,
): Promise<ModuleQuestion[]> => {
  const response = await axiosInstance.get("/training-map-questions", {
    params,
  });
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch questions");
  }
  return response.data.data;
};

// Questions save (us module ke purane questions replace)
export const addModuleQuestions = async (
  payload: ModuleQuestionParams & { questions: string[] },
): Promise<{ count: number }> => {
  const response = await axiosInstance.post("/training-map-questions", payload);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to save questions");
  }
  return response.data.data ?? { count: payload.questions.length };
};
