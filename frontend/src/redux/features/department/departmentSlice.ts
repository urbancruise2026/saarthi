import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  DepartmentRole,
  getAllDepartments,
  getDepartmentRoles,
  getHoByDepartment,
  getRolesBySubDepartment,
} from "./dipartmentApi";
import { Department } from "@/types";

interface DepartmentState {
  departments: Department[];
  desgnationsRoles: DepartmentRole[];
  roles: DepartmentRole[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  desgnationsRoles: [],
  roles: [],
  loading: false,
  error: null,
};

// Fetch all departments
export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllDepartments();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch departments",
      );
    }
  },
);

// Fetch designations/roles for a specific department
export const fetchDepartmentRoles = createAsyncThunk<
  DepartmentRole[],
  number,
  { rejectValue: string }
>("department/fetchDepartmentRoles", async (departmentId, thunkAPI) => {
  try {
    const data = await getDepartmentRoles(departmentId);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch roles");
  }
});

export const fetchHoByDepartment = createAsyncThunk<
  DepartmentRole[],
  number,
  { rejectValue: string }
>("department/fetchHoByDepartment", async (departmentId, thunkAPI) => {
  try {
    const data = await getHoByDepartment(departmentId);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch roles");
  }
});

export const fetchSubDepartmentRoles = createAsyncThunk<
  DepartmentRole[],
  number,
  { rejectValue: string }
>("department/fetchSubDepartmentRoles", async (subDepartmentId, thunkAPI) => {
  try {
    const data = await getRolesBySubDepartment(subDepartmentId);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch roles");
  }
});
const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    clearRoles: (state) => {
      state.desgnationsRoles = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDepartments.fulfilled,
        (state, action: PayloadAction<Department[]>) => {
          state.loading = false;
          state.departments = action.payload;
        },
      )
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Designations / Roles
    builder
      .addCase(fetchDepartmentRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDepartmentRoles.fulfilled,
        (state, action: PayloadAction<DepartmentRole[]>) => {
          state.loading = false;
          state.desgnationsRoles = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchDepartmentRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch roles";
      })

      .addCase(fetchSubDepartmentRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubDepartmentRoles.fulfilled,
        (state, action: PayloadAction<DepartmentRole[]>) => {
          state.loading = false;
          state.desgnationsRoles = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchSubDepartmentRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch roles";
      })

      .addCase(fetchHoByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHoByDepartment.fulfilled,
        (state, action: PayloadAction<DepartmentRole[]>) => {
          state.loading = false;
          state.desgnationsRoles = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchHoByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch roles";
      });
  },
});

export const { clearRoles } = departmentSlice.actions;
export default departmentSlice.reducer;
