import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Employee, EmployeeStatus } from "@/types";
import { mockEmployees } from "@/utils/mockData";

interface EmployeeState {
  employees: Employee[];
  draftForm: Partial<Employee> | null;
}

const initialState: EmployeeState = {
  employees: mockEmployees,
  draftForm: null,
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployeeStatus: (
      state,
      action: PayloadAction<{ id: string; status: EmployeeStatus; rejectionReason?: string }>
    ) => {
      const emp = state.employees.find((e) => e.id === action.payload.id);
      if (emp) {
        emp.status = action.payload.status;
        if (action.payload.status === "approved") emp.approvedAt = new Date().toISOString();
        if (action.payload.status === "rejected") {
          emp.rejectedAt = new Date().toISOString();
          emp.rejectionReason = action.payload.rejectionReason;
          emp.formLinkActive = false;
        }
      }
    },
    generateFormLink: (state, action: PayloadAction<{ id: string; link: string }>) => {
      const emp = state.employees.find((e) => e.id === action.payload.id);
      if (emp) {
        emp.formLink = action.payload.link;
        emp.formLinkActive = true;
        emp.status = "pending";
      }
    },
    saveDraft: (state, action: PayloadAction<Partial<Employee>>) => {
      state.draftForm = action.payload;
    },
    clearDraft: (state) => {
      state.draftForm = null;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const idx = state.employees.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) state.employees[idx] = action.payload;
    },
  },
});

export const {
  addEmployee,
  updateEmployeeStatus,
  generateFormLink,
  saveDraft,
  clearDraft,
  updateEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;
