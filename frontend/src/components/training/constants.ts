import type { TrainingCategory } from "@/redux/features/TrainingModule/traininModuleApi";

export const DEPARTMENT_LABEL: Record<string, string> = { sales: "Sales" };

export const SUB_DEPARTMENT_LABEL: Record<string, string> = {
  presales: "Pre-Sales",
  telesales: "Tele-Sales",
};

export const CATEGORY_LABEL: Record<TrainingCategory, string> = {
  lead_video: "Lead Video",
  lead_ppt: "Lead PPT",
};

export type ModuleKey =
  | "joining"
  | "veh1"
  | "veh2"
  | "veh3"
  | "sales1"
  | "sales2_basics"
  | "sales2_ratechart"
  | "joining"
  | "veh1"
  | "veh2"
  | "veh3"
  | "sales1"
  | "sales2_basics"
  | "sales2_ratechart"
  | "ps_overview"
  | "ps_leads"
  | "ps_recorded_calls"
  | "ps_script";

export const MODULE_OPTIONS: { value: ModuleKey; label: string }[] = [
  { value: "joining", label: "Joining Formalities" },
  { value: "veh1", label: "Veh. - 1" },
  { value: "veh2", label: "Veh. - 2" },
  { value: "veh3", label: "Veh. - 3" },
  { value: "sales1", label: "Sales - 1" },
  { value: "sales2_basics", label: "Sales - 2 (Basics)" },
  { value: "sales2_ratechart", label: "Sales - 2 (Rate Chart)" },
  // MODULE_OPTIONS me add karein:
  { value: "ps_overview", label: "Pre-Sales Overview" },
  { value: "ps_leads", label: "Pre-Sales Leads" },
  { value: "ps_recorded_calls", label: "Pre-Sales Recorded Calls" },
  { value: "ps_script", label: "Pre-Sales Script" },
];
export const DAY_INFO_PRESALES: Record<
  number,
  { date: string; module: string }
> = {
  1: { date: "", module: "Joining Formalities + Company Intro" },
  2: { date: "", module: "Veh. - 1" },
  3: { date: "", module: "Veh. - 2" },
  4: { date: "", module: "Veh. - 2 + Test - 1" },
  5: { date: "", module: "Overview (PPT) + PINAAK Overview" },
  6: { date: "", module: "Leads + Lead Mgmt System" },
  7: { date: "", module: "Recorded Calls + Pre-Sales Process" },
  8: { date: "", module: "Script + Test - 2" },
};

export const MODULE_LABEL = Object.fromEntries(
  MODULE_OPTIONS.map((m) => [m.value, m.label]),
) as Record<ModuleKey, string>;

export const DAY_INFO: Record<number, { date: string; module: string }> = {
  1: { date: "6 Nov", module: "Joining Formalities + Company Intro" },
  2: { date: "7 Nov", module: "Vehicle - 1" },
  3: { date: "28 Oct", module: "Vehicle - 2" },
  4: { date: "29 Oct", module: "Vehicle - 2" },
  5: { date: "30 Oct", module: "Vehicle - 3 + Test - 1" },
  6: { date: "31 Oct", module: "Sales - 1" },
  7: { date: "2 Nov", module: "Sales - 2 (Basics)" },
  8: { date: "3 Nov", module: "Sales - 2 (Rate Chart)" },
};

export const MAX_VIDEO_MB = 100; // Cloudinary free plan: 100 MB per video
export const MAX_PPT_MB = 20;
export const PPT_EXT = /\.(pptx?|ppsx?)$/i;
