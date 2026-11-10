import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Letter, LetterStatus, LetterTemplate } from "@/types/letter";
import { DocType } from "@/utils/documentGenerators";

interface LetterState {
  letters: Letter[];
  templates: LetterTemplate[];
}

const defaultTemplates: LetterTemplate[] = [
  {
    id: "tpl-1",
    letterType: "offer-letter",
    name: "Standard Offer Letter",
    content: `Dear {{employeeName}},

We are pleased to offer you the position of {{designation}} in our {{department}} department at an annual package of {{salaryPackage}}.

Your date of joining will be {{joiningDate}} and you will be based at {{workLocation}}, reporting to {{reportingManager}}.

This offer is contingent upon successful completion of our standard background verification process.

Please sign and return a copy of this letter to confirm your acceptance.

Warm regards,
HRMS Enterprise Suite`,
    placeholders: ["employeeName", "designation", "department", "salaryPackage", "joiningDate", "workLocation", "reportingManager"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-2",
    letterType: "confirmation-letter",
    name: "Standard Confirmation Letter",
    content: `Dear {{employeeName}},

We are pleased to confirm your employment with HRMS Enterprise Suite as {{designation}} (Employee ID: {{employeeIdField}}), effective from {{confirmationDate}}.

After a satisfactory review of your performance during the probation period, your services are hereby confirmed.

Remarks: {{remarks}}

Congratulations!

Warm regards,
HRMS Enterprise Suite`,
    placeholders: ["employeeName", "employeeIdField", "designation", "confirmationDate", "remarks"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-3",
    letterType: "increment-letter",
    name: "Standard Increment Letter",
    content: `Dear {{employeeName}},

In recognition of your consistent performance, we are pleased to revise your compensation.

Current Salary: {{currentSalary}}
New Salary: {{newSalary}}
Increment: {{incrementPercentage}}%
Effective Date: {{effectiveDate}}

Reason: {{reason}}

This letter is confidential.

Warm regards,
HRMS Enterprise Suite`,
    placeholders: ["employeeName", "currentSalary", "newSalary", "incrementPercentage", "effectiveDate", "reason"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-4",
    letterType: "promotion-letter",
    name: "Standard Promotion Letter",
    content: `Dear {{employeeName}},

We are delighted to inform you that you have been promoted from {{oldDesignation}} to {{newDesignation}}, effective {{effectiveDate}}.

Your revised salary will be {{newSalary}}.

Congratulations on this well-deserved achievement!

Warm regards,
HRMS Enterprise Suite`,
    placeholders: ["employeeName", "oldDesignation", "newDesignation", "newSalary", "effectiveDate"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-5",
    letterType: "relieving-letter",
    name: "Standard Relieving Letter",
    content: `To Whomsoever It May Concern,

This is to certify that {{employeeName}} ({{designation}}) has been relieved from employment effective {{lastWorkingDate}}.

Reason for leaving: {{reasonForLeaving}}
Clearance Status: {{clearanceStatus}}

We wish them all the best in future endeavors.

Warm regards,
HRMS Enterprise Suite`,
    placeholders: ["employeeName", "designation", "lastWorkingDate", "reasonForLeaving", "clearanceStatus"],
    updatedAt: new Date().toISOString(),
  },
];

const mockLetters: Letter[] = [
  {
    id: "ltr-1",
    employeeId: "emp-1",
    employeeName: "Arjun Sharma",
    employeeDesignation: "Senior Software Engineer",
    employeeDepartment: "Engineering",
    letterType: "offer-letter",
    status: "issued",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T14:00:00Z",
    issuedAt: "2024-01-10T14:00:00Z",
    formData: {
      employeeName: "Arjun Sharma",
      designation: "Senior Software Engineer",
      department: "Engineering",
      salaryPackage: "₹18,00,000",
      joiningDate: "2022-01-10",
      workLocation: "Bangalore HQ",
      reportingManager: "Priya Nair",
    },
  },
  {
    id: "ltr-2",
    employeeId: "emp-2",
    employeeName: "Priya Nair",
    employeeDesignation: "HR Manager",
    employeeDepartment: "HR",
    letterType: "confirmation-letter",
    status: "sent",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z",
    issuedAt: "2024-01-15T12:00:00Z",
    sentAt: "2024-01-16T11:00:00Z",
    formData: {
      employeeName: "Priya Nair",
      employeeIdField: "EMP-002",
      designation: "HR Manager",
      confirmationDate: "2021-12-01",
      remarks: "Excellent performance during probation",
    },
  },
  {
    id: "ltr-3",
    employeeId: "emp-5",
    employeeName: "Vikram Mehta",
    employeeDesignation: "Operations Director",
    employeeDepartment: "Operations",
    letterType: "promotion-letter",
    status: "draft",
    createdAt: "2024-02-20T08:00:00Z",
    updatedAt: "2024-02-20T08:00:00Z",
    formData: {
      employeeName: "Vikram Mehta",
      oldDesignation: "Operations Manager",
      newDesignation: "Operations Director",
      newSalary: "₹30,00,000",
      effectiveDate: "2024-03-01",
    },
  },
];

const initialState: LetterState = {
  letters: mockLetters,
  templates: defaultTemplates,
};

const letterSlice = createSlice({
  name: "letters",
  initialState,
  reducers: {
    addLetter: (state, action: PayloadAction<Letter>) => {
      state.letters.push(action.payload);
    },
    updateLetter: (state, action: PayloadAction<Letter>) => {
      const idx = state.letters.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.letters[idx] = action.payload;
    },
    deleteLetter: (state, action: PayloadAction<string>) => {
      state.letters = state.letters.filter((l) => l.id !== action.payload);
    },
    updateLetterStatus: (
      state,
      action: PayloadAction<{ id: string; status: LetterStatus }>
    ) => {
      const letter = state.letters.find((l) => l.id === action.payload.id);
      if (letter) {
        letter.status = action.payload.status;
        letter.updatedAt = new Date().toISOString();
        if (action.payload.status === "issued") letter.issuedAt = new Date().toISOString();
        if (action.payload.status === "sent") letter.sentAt = new Date().toISOString();
      }
    },
    updateTemplate: (state, action: PayloadAction<LetterTemplate>) => {
      const idx = state.templates.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.templates[idx] = action.payload;
    },
  },
});

export const { addLetter, updateLetter, deleteLetter, updateLetterStatus, updateTemplate } =
  letterSlice.actions;
export default letterSlice.reducer;
