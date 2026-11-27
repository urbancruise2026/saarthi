export type Department = "sales" | "";
export type SubDepartment = "presales" | "telesales" | "";

export type Understood = "yes" | "no";
export type Assistance = "yes" | "no";

export type DayReview = {
  understood: Understood;
  learned: string; // "What did you learn?" (required)
  suggestions: string; // optional
  assistance: Assistance; // trainer ki madad chahiye ya nahi
  assistanceDetails: string; // assistance = yes ho to required
  completedAt: string; // ISO date
};

export type ReviewMap = Record<number, DayReview>;