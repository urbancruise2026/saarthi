import { DocType } from "@/utils/documentGenerators";

export type LetterStatus = "draft" | "issued" | "sent";

export interface Letter {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  employeeDepartment: string;
  letterType: DocType;
  status: LetterStatus;
  createdAt: string;
  updatedAt: string;
  issuedAt?: string;
  sentAt?: string;
  // Dynamic form data per letter type
  formData: LetterFormData;
}

export interface OfferLetterData {
  employeeName: string;
  designation: string;
  department: string;
  salaryPackage: string;
  joiningDate: string;
  workLocation: string;
  reportingManager: string;
}

export interface ConfirmationLetterData {
  employeeName: string;
  employeeIdField: string;
  designation: string;
  confirmationDate: string;
  remarks: string;
}

export interface IncrementLetterData {
  employeeName: string;
  currentSalary: string;
  newSalary: string;
  incrementPercentage: string;
  effectiveDate: string;
  reason: string;
}

export interface PromotionLetterData {
  employeeName: string;
  oldDesignation: string;
  newDesignation: string;
  newSalary: string;
  effectiveDate: string;
}

export interface RelievingLetterData {
  employeeName: string;
  lastWorkingDate: string;
  designation: string;
  reasonForLeaving: string;
  clearanceStatus: string;
}

export type LetterFormData =
  | OfferLetterData
  | ConfirmationLetterData
  | IncrementLetterData
  | PromotionLetterData
  | RelievingLetterData;

export interface LetterTemplate {
  id: string;
  letterType: DocType;
  name: string;
  content: string;
  placeholders: string[];
  updatedAt: string;
}
