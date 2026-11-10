import { Employee, PaginatedEmployeeResponse } from "@/types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createUser,
  currentUser,
  getAllEmployees,
  loginUser,
  logoutUser,
  updateUserById,
  updateEmployeeStatus,
  getEmployeesByStatus,
  getUserById,
  getReportingManagersByDepartment,
  getHREmployees,
  getEmployees,
} from "./userAPi";

// ─── Pagination Meta Type ────────────────────────────────────────────────────
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
interface EmployeeDropdown {
  id: number;
  full_name: string;
}

interface EmployeeState {
  currentEmployee: Employee | null;
  selectedEmployee: Employee | null;
  employees: Employee[];
  employeeList: EmployeeDropdown[];
  pagination: PaginationMeta | null; // ✅ flat fields hata ke nested object
  loading: boolean;
  error: string | null;
  createdEmployee?: Employee | null;
  isAuthenticated: boolean;
  initialized: boolean;
  isAuthChecking: boolean;
  reportingManagers: Employee[];
  hrEmployees: Employee[];
}

const initialState: EmployeeState = {
  currentEmployee: null,
  selectedEmployee: null,
  employees: [],
  employeeList: [],
  pagination: null, // ✅
  loading: false,
  error: null,
  createdEmployee: null,
  isAuthenticated: false,
  initialized: false,
  isAuthChecking: true,
  reportingManagers: [],
  hrEmployees: [],
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginEmployeeThunk = createAsyncThunk<
  Employee,
  { username: string; password: string }
>("Employee/login", async (loginData, { rejectWithValue }) => {
  try {
    const Employee = await loginUser(loginData);
    return Employee;
  } catch (error: any) {
    return rejectWithValue(error.message || "Login failed");
  }
});

export const fetchEmployeeListThunk = createAsyncThunk<
  EmployeeDropdown[],
  number | string | undefined,
  { rejectValue: string }
>("Employee/fetchEmployeeList", async (branchId, { rejectWithValue }) => {
  try {
    return await getEmployees(branchId);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch employee list",
    );
  }
});

export const getEmployeeByIdThunk = createAsyncThunk<
  Employee,
  string | number,
  { rejectValue: string }
>("Employee/getById", async (id, { rejectWithValue }) => {
  try {
    const employee = await getUserById(id);
    return employee;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch employee");
  }
});

export const currentEmployeeThunk = createAsyncThunk<
  Employee | null,
  void,
  { rejectValue: string }
>("Employee/current", async (_, { rejectWithValue }) => {
  try {
    const Employee = await currentUser();
    return Employee;
  } catch (error: any) {
    if (error.response?.status === 401 || error.message === "Unauthorized") {
      return null;
    }
    return rejectWithValue(error.message || "Unauthorized");
  }
});

export const createEmployeeThunk = createAsyncThunk<
  Employee,
  Partial<Employee>,
  { rejectValue: string }
>("Employee/create", async (formData, { rejectWithValue }) => {
  try {
    const Employee = await createUser(formData);
    return Employee;
  } catch (error: any) {
    return rejectWithValue(error.message || "Employee creation failed");
  }
});

// ✅ page + limit dono accept karta hai
export const fetchEmployeesThunk = createAsyncThunk<
  PaginatedEmployeeResponse,
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("Employee/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await getAllEmployees(params?.page, params?.limit);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch employees");
  }
});

export const logoutEmployeeThunk = createAsyncThunk(
  "Employee/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  },
);

export const updateEmployeeThunk = createAsyncThunk<
  Employee,
  { userId: number | string; updateData: Partial<Employee> },
  { rejectValue: string }
>("Employee/update", async ({ userId, updateData }, { rejectWithValue }) => {
  try {
    const updatedEmployee = await updateUserById(userId, updateData);
    return updatedEmployee;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update employee");
  }
});

export const updateEmployeeStatusThunk = createAsyncThunk<
  Employee,
  { userId: number | string; status: string },
  { rejectValue: string }
>("Employee/updateStatus", async ({ userId, status }, { rejectWithValue }) => {
  try {
    const updatedEmployee = await updateEmployeeStatus(userId, status);
    return updatedEmployee;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update status");
  }
});

export const fetchEmployeesByStatusThunk = createAsyncThunk<
  {
    employees: Employee[];
    currentPage: number;
    totalEmployees: number;
    totalPages: number;
  },
  { page: number; status: string },
  { rejectValue: string }
>("Employee/fetchByStatus", async ({ page, status }, { rejectWithValue }) => {
  try {
    return await getEmployeesByStatus(page, status);
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Failed to fetch employees by status",
    );
  }
});

export const fetchReportingManagersByDepartmentThunk = createAsyncThunk<
  Employee[],
  string,
  { rejectValue: string }
>(
  "Employee/fetchReportingManagers",
  async (departmentName, { rejectWithValue }) => {
    try {
      return await getReportingManagersByDepartment(departmentName);
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch reporting managers",
      );
    }
  },
);

export const fetchHREmployeesThunk = createAsyncThunk<
  Employee[],
  void,
  { rejectValue: string }
>("Employee/fetchHREmployees", async (_, { rejectWithValue }) => {
  try {
    return await getHREmployees();
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch HR employees");
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const EmployeeSlice = createSlice({
  name: "Employee",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentEmployee = null;
      state.error = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.createdEmployee = null;
      state.initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
    employeeCreatedRealtime: (state, action: PayloadAction<Employee>) => {
      state.employees.unshift(action.payload);
      if (state.pagination) state.pagination.total += 1;
    },
    employeeUpdatedRealtime: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(
        (emp) => emp.id === action.payload.id,
      );
      if (index !== -1) {
        state.employees[index] = {
          ...state.employees[index],
          ...action.payload,
        };
      }
      if (state.currentEmployee?.id === action.payload.id) {
        state.currentEmployee = { ...state.currentEmployee, ...action.payload };
      }
    },
    employeeStatusUpdatedRealtime: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(
        (emp) => emp.id === action.payload.id,
      );
      if (index !== -1) {
        state.employees[index] = {
          ...state.employees[index],
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginEmployeeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginEmployeeThunk.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.loading = false;
          state.currentEmployee = action.payload;
          state.isAuthenticated = true;
          state.initialized = true;
          state.error = null;
        },
      )
      .addCase(loginEmployeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.currentEmployee = null;
        state.initialized = true;
      })

      // CURRENT EMPLOYEE
      .addCase(currentEmployeeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        currentEmployeeThunk.fulfilled,
        (state, action: PayloadAction<Employee | null>) => {
          state.loading = false;
          state.initialized = true;
          if (action.payload) {
            state.currentEmployee = action.payload;
            state.isAuthenticated = true;
          } else {
            state.currentEmployee = null;
            state.isAuthenticated = false;
          }
        },
      )
      .addCase(currentEmployeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.currentEmployee = null;
        state.error = action.payload || null;
        state.isAuthenticated = false;
        state.initialized = true;
      })

      // CREATE EMPLOYEE
      .addCase(createEmployeeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createEmployeeThunk.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.loading = false;
          state.createdEmployee = action.payload;
        },
      )
      .addCase(createEmployeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ FETCH EMPLOYEES — pagination object store karo
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.pagination = action.payload.pagination ?? null;
      })
      .addCase(fetchEmployeesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // LOGOUT
      .addCase(logoutEmployeeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutEmployeeThunk.fulfilled, (state) => {
        state.currentEmployee = null;
        state.isAuthenticated = false;
        state.createdEmployee = null;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(logoutEmployeeThunk.rejected, (state) => {
        state.loading = false;
        state.currentEmployee = null;
        state.isAuthenticated = false;
        state.createdEmployee = null;
        state.initialized = true;
      })

      // UPDATE EMPLOYEE
      .addCase(updateEmployeeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateEmployeeThunk.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.loading = false;
          const index = state.employees.findIndex(
            (emp) => emp.id === action.payload.id,
          );
          if (index !== -1) state.employees[index] = action.payload;
          if (state.currentEmployee?.id === action.payload.id) {
            state.currentEmployee = action.payload;
          }
        },
      )
      .addCase(updateEmployeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // UPDATE EMPLOYEE STATUS
      .addCase(
        updateEmployeeStatusThunk.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.loading = false;
          const index = state.employees.findIndex(
            (emp) => emp.id === action.payload.id,
          );
          if (index !== -1) {
            state.employees[index] = {
              ...state.employees[index],
              ...action.payload,
            };
          }
        },
      )
      .addCase(updateEmployeeStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH EMPLOYEES BY STATUS
      .addCase(fetchEmployeesByStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesByStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.totalEmployees,
          limit: state.pagination?.limit ?? 10,
          hasPrevPage: action.payload.currentPage > 1,
          hasNextPage: action.payload.currentPage < action.payload.totalPages,
        };
      })
      .addCase(fetchEmployeesByStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // GET EMPLOYEE BY ID
      .addCase(getEmployeeByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getEmployeeByIdThunk.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.loading = false;
          state.selectedEmployee = action.payload;
          const index = state.employees.findIndex(
            (emp) => emp.id === action.payload.id,
          );
          if (index !== -1) state.employees[index] = action.payload;
        },
      )
      .addCase(getEmployeeByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH REPORTING MANAGERS
      .addCase(fetchReportingManagersByDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchReportingManagersByDepartmentThunk.fulfilled,
        (state, action: PayloadAction<Employee[]>) => {
          state.loading = false;
          state.reportingManagers = action.payload;
        },
      )
      .addCase(
        fetchReportingManagersByDepartmentThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        },
      )

      // FETCH HR EMPLOYEES
      .addCase(fetchHREmployeesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHREmployeesThunk.fulfilled,
        (state, action: PayloadAction<Employee[]>) => {
          state.loading = false;
          state.hrEmployees = action.payload;
        },
      )
      .addCase(fetchHREmployeesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH EMPLOYEE DROPDOWN LIST
      .addCase(fetchEmployeeListThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEmployeeListThunk.fulfilled,
        (state, action: PayloadAction<EmployeeDropdown[]>) => {
          state.loading = false;
          state.employeeList = action.payload;
        },
      )
      .addCase(fetchEmployeeListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  clearError,
  resetState,
  employeeCreatedRealtime,
  employeeUpdatedRealtime,
  employeeStatusUpdatedRealtime,
} = EmployeeSlice.actions;
export default EmployeeSlice.reducer;
