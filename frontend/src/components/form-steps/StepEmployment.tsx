import { Employee } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/hooks/useRedux";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import {
  fetchDepartmentRoles,
  fetchDepartments,
  fetchHoByDepartment,
  fetchSubDepartmentRoles,
} from "@/redux/features/department/departmentSlice";
import { Phone, MapPin, Clock, Info, Briefcase, Calendar } from "lucide-react";
import {
  fetchEmployeesThunk,
  fetchHREmployeesThunk,
  fetchReportingManagersByDepartmentThunk,
} from "@/redux/features/userSlice";
import { fetchBranchesThunk } from "@/redux/features/branch/branchSlice";
import {
  fetchAllCities,
  fetchAllGrades,
} from "@/redux/features/state/stateSlice";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
  showErrors?: boolean;
}

const F = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className={error ? "border border-red-500 rounded-md" : ""}>
      {children}
    </div>
    {error && <p className="text-xs text-red-500">This field is required</p>}
  </div>
);

const SectionHeading = ({
  icon: Icon,
  title,
  color = "text-gray-700",
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    <Icon className={`w-5 h-5 ${color}`} />
    <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
  </div>
);

const WORK_SHIFTS = ["1st Shift", "Gen. Shift", "2nd Shift", "Night Shift"];

// Dynamic shift timings based on selected work shift
const SHIFT_TIMINGS: Record<string, string[]> = {
  "1st Shift": [
    "9:00 am - 5:30 pm",
    "9:30 am - 6:00 pm",
    "10:00 am - 6:30 pm",
    "10:30 am - 7:00 pm",
  ],
  "Gen. Shift": ["11:00 am - 7:30 pm", "11:30 am - 8:00 pm"],
  "2nd Shift": [
    "12:00 pm - 8:30 pm",
    "12:30 pm - 9:00 pm",
    "1:00 pm - 9:30 pm",
    "1:30 pm - 10:00 pm",
  ],
  "Night Shift": [
    "9:00 pm - 6:00 am",
    "9:30 pm - 6:30 am",
    "10:00 pm - 7:00 am",
    "10:30 pm - 7:30 am",
    "12:00 am - 9:00 am",
    "12:30 am - 9:30 am",
  ],
};

const WEEKLY_OFF_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ACCESS_ROLES = [
  "EMPLOYEE",
  "TEAM_LEAD",
  "MANAGER",
  "ZONAL_HEAD",
  "HOD",
  "SUPER_ADMIN",
];

const EMPLOYMENT_TYPES = ["Intern", "Probation", "Contractual", "Full-time"];

const EMPLOYEE_STATUSES = [
  "Active",
  "Resigned & On Notice",
  "Exited & F&F Done",
  "Terminated",
  "Absconding",
];

const NOTICE_PERIODS = ["15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];

export function StepEmployment({
  data,
  onChange,
  showErrors = false,
}: StepProps) {
  // ✅ HO selected check
  const isHoSelected = !!data.ho_id;

  // ✅ Dynamic required fields
  const requiredFields = [
    "grade",
    "designation",
    "department_id",
    // HO required
    ...(isHoSelected ? [] : ["subDepartment_id", "role_id"]),
    "hrManager",
    "joiningDate",
    "employmentType",
    "employeeStatus",
    "probationTenure",
    "noticePeriod",
    "workLocation",
    "branchOffice_id",
    "workShift",
    "shiftTiming",
    "weeklyoff",
    "ctc",
    "basicSalary",
    "username",
    "password",
    "shortName",
    "access_role",
  ];

  const errors: Record<string, boolean> = {};
  requiredFields.forEach((field) => {
    const value = data[field as keyof typeof data];
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      errors[field] = true;
    }
  });

  const hasErrors = Object.keys(errors).length > 0;

  const dispatch = useDispatch<AppDispatch>();

  const { departments } = useAppSelector((state) => state.department);
  const { employees } = useSelector((state: RootState) => state.user);
  const { branches } = useAppSelector((state) => state.branch);
  const { grades } = useAppSelector((state) => state.states);

  const filteredDesignations = grades.filter((g) => g.gradeName === data.grade);

  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [ho, setHo] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const { reportingManagers } = useSelector((state: RootState) => state.user);
  const hrEmployees = useSelector((state: RootState) => state.user.hrEmployees);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchAllCities());
    dispatch(fetchEmployeesThunk(1));
    dispatch(fetchBranchesThunk());
    dispatch(fetchAllGrades());
    dispatch(fetchHREmployeesThunk());
  }, [dispatch]);

  // ✅ Department select hone par Sub-Departments fetch karo
  useEffect(() => {
    if (data.department_id) {
      dispatch(fetchDepartmentRoles(data.department_id))
        .unwrap()
        .then((res: any) => {
          setSubDepartments(res.sub_department || []);
        })
        .catch(() => {
          setSubDepartments([]);
        });
    } else {
      setSubDepartments([]);
    }
  }, [data.department_id, dispatch]);

  // ✅ Department select hone par HO fetch karo
  useEffect(() => {
    if (data.department_id) {
      dispatch(fetchHoByDepartment(data.department_id))
        .unwrap()
        .then((res: any) => {
          setHo(res.hos || []);
        })
        .catch(() => {
          setHo([]);
        });
    } else {
      setHo([]);
    }
  }, [data.department_id, dispatch]);

  // ✅ Sub-Department select hone par Roles fetch karo
  useEffect(() => {
    // HO selected hai to roles ki zarurat nahi
    if (isHoSelected) {
      setRoles([]);
      return;
    }

    if (data.subDepartment_id) {
      dispatch(fetchSubDepartmentRoles(data.subDepartment_id))
        .unwrap()
        .then((res: any) => {
          setRoles(res.roles || []);
        })
        .catch(() => {
          setRoles([]);
        });
    } else {
      setRoles([]);
    }
  }, [data.subDepartment_id, dispatch, isHoSelected]);

  const formatIndianNumber = (value: any) => {
    if (!value) return "";
    const number = value.toString().replace(/,/g, "");
    return new Intl.NumberFormat("en-IN").format(number);
  };

  const selectedSubDepartment = subDepartments.find(
    (d) => d.id === data.subDepartment_id,
  );

  // Available timings for currently selected shift
  const availableTimings = data.workShift
    ? (SHIFT_TIMINGS[data.workShift] ?? [])
    : [];

  // When shift changes: reset timing so user picks again
  const handleShiftChange = (shift: string) => {
    onChange({ workShift: shift, shiftTiming: "" });
  };

  const handleDepartmentChange = (value: string) => {
    const dept = departments.find((d) => d.id === Number(value));

    onChange({
      department_id: Number(value),
      ho_id: undefined,
      subDepartment_id: undefined,
      role_id: undefined,
      manager_id: null, // ✅ reset manager
    });

    setSubDepartments([]);
    setHo([]);
    setRoles([]);

    // ✅ API call yahin se hoga
    if (dept?.department_name) {
      dispatch(fetchReportingManagersByDepartmentThunk(dept.department_name));
    }
  };

  // ✅ HO change handler
  const handleHoChange = (value: string) => {
    onChange({
      ho_id: Number(value),
      subDepartment_id: undefined,
      role_id: undefined,
    });
    setRoles([]);
  };

  // ✅ SubDepartment change handler
  const handleSubDepartmentChange = (value: string) => {
    onChange({
      subDepartment_id: Number(value),
      role_id: undefined,
    });
    setRoles([]);
  };

  return (
    <div className="space-y-8">
      {/* Employment Details */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Briefcase}
          title="Employment Details"
          color="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Grade */}
          <F label="Grade" required error={showErrors && errors.grade}>
            <Select
              value={data.grade || ""}
              onValueChange={(v) => onChange({ grade: v, designation: "" })}
            >
              <SelectTrigger className="[&>svg]:text-blue-500 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:opacity-50">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>

              <SelectContent className="[&_[data-radix-select-scroll-down-button]>svg]:h-6 [&_[data-radix-select-scroll-down-button]>svg]:w-6 [&_[data-radix-select-scroll-down-button]>svg]:text-blue-500">
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.gradeName}>
                    {grade.gradeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* Designation */}
          <F
            label="Designation"
            required
            error={showErrors && errors.designation}
          >
            <Select
              value={data.designation || ""}
              onValueChange={(v) => onChange({ designation: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>

              <SelectContent>
                {filteredDesignations.map((g) => (
                  <SelectItem key={g.id} value={g.designation}>
                    {g.designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* Department */}
          <F
            label="Department"
            required
            error={showErrors && errors.department_id}
          >
            <Select
              value={data.department_id?.toString() || ""}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments
                  ?.filter((dept) => dept.is_active === 1)
                  .map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </F>

          {/* HO */}
          <F label="HO" required error={showErrors && errors.ho_id}>
            <Select
              value={data.ho_id?.toString() || ""}
              onValueChange={handleHoChange}
              disabled={!data.department_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HO" />
              </SelectTrigger>
              <SelectContent>
                {ho?.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.ho_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* Sub-Department */}
          <F
            label="Sub-Department"
            required={!isHoSelected}
            error={showErrors && errors.subDepartment_id}
          >
            <Select
              value={data.subDepartment_id?.toString() || ""}
              onValueChange={handleSubDepartmentChange}
              disabled={!data.department_id || isHoSelected}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sub-department" />
              </SelectTrigger>
              <SelectContent>
                {subDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.subDepartment_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* Zone Name - Only for Zonal Head */}
          {!isHoSelected &&
            selectedSubDepartment?.subDepartment_name === "zonal_head" && (
              <F label="Zone Name">
                <Input
                  value={data.zoneName || ""}
                  onChange={(e) => onChange({ zoneName: e.target.value })}
                  placeholder="Enter Zone Name"
                />
              </F>
            )}

          {/* Role */}
          <F
            label="Role"
            required={!isHoSelected}
            error={showErrors && errors.role_id}
          >
            <Select
              value={data.role_id?.toString() || ""}
              onValueChange={(v) => onChange({ role_id: Number(v) })}
              disabled={!data.subDepartment_id || isHoSelected}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* Reporting Manager */}
          <F label="Reporting Manager">
            <Select
              value={data.manager_id?.toString() || "none"}
              onValueChange={(v) =>
                onChange({ manager_id: v === "none" ? null : Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Reporting Manager" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">Reporting Manager</SelectItem>

                {reportingManagers?.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.full_name} {emp.lastName} ({emp.role_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* HR Manager */}
          <F label="HR Manager" required error={showErrors && errors.hrManager}>
            <Select
              value={data.hrManager || ""}
              onValueChange={(v) => onChange({ hrManager: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HR Manager" />
              </SelectTrigger>
              <SelectContent>
                {hrEmployees?.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Phone}
          title="Contact Details"
          color="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <F label="Official Email">
            <Input
              type="email"
              value={data.officeEmail || ""}
              onChange={(e) => onChange({ officeEmail: e.target.value })}
              placeholder="john@company.com"
            />
          </F>

          <F label="Official Number">
            <Input
              type="tel"
              maxLength={10}
              value={data.officeNumber || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  onChange({ officeNumber: value });
                }
              }}
              placeholder="Enter 10 digit number"
            />
          </F>

          <F label="Alias Name">
            <Input
              type="tel"
              maxLength={10}
              value={data.aliasName || ""}
              onChange={(e) => onChange({ aliasName: e.target.value })}
              placeholder="Enter Alias Name"
            />
          </F>
        </div>
      </div>

      {/* Work Location */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={MapPin}
          title="Work Location"
          color="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <F label="Company Name">
            <Input
              value={data.companyName || ""}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="Enter company name"
            />
          </F>

          <F
            label="Office"
            required
            error={showErrors && errors.branchOffice_id}
          >
            <Select
              value={data.branchOffice_id?.toString() || ""}
              onValueChange={(v) => {
                const selectedBranch = branches.find(
                  (b: any) => b.id === Number(v),
                );
                onChange({
                  branchOffice_id: Number(v),
                  workLocation: selectedBranch?.location || "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Office" />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F
            label="Office Address"
            required
            error={showErrors && errors.workLocation}
          >
            <Input
              value={data.workLocation || ""}
              onChange={(e) => onChange({ workLocation: e.target.value })}
              placeholder="e.g., HQ, Mumbai"
            />
          </F>
        </div>
      </div>

      {/* Working Hours & Shifts */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Clock}
          title="Working Hours & Shifts"
          color="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Work Shift */}
          <F label="Work Shift" required error={showErrors && errors.workShift}>
            <Select
              value={data.workShift || ""}
              onValueChange={handleShiftChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Work Shift" />
              </SelectTrigger>
              <SelectContent>
                {WORK_SHIFTS.map((shift) => (
                  <SelectItem key={shift} value={shift}>
                    {shift}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* Shift Timing */}
          <F
            label="Shift Timing"
            required
            error={showErrors && errors.shiftTiming}
          >
            {availableTimings.length > 0 ? (
              <Select
                value={data.shiftTiming || ""}
                onValueChange={(v) => onChange({ shiftTiming: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift timing" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimings.map((timing) => (
                    <SelectItem key={timing} value={timing}>
                      {timing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={data.shiftTiming || ""}
                onChange={(e) => onChange({ shiftTiming: e.target.value })}
                placeholder={
                  data.workShift ? "Enter shift timing" : "Select a shift first"
                }
                disabled={!data.workShift}
              />
            )}
          </F>

          {/* Weekly Off */}
          <F label="Weekly Off" required error={showErrors && errors.weeklyoff}>
            <Select
              value={data.weeklyoff || ""}
              onValueChange={(v) => onChange({ weeklyoff: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Weekly Off" />
              </SelectTrigger>
              <SelectContent>
                {WEEKLY_OFF_DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
        </div>
      </div>

      {/* Official Information */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Calendar}
          title="Official Information"
          color="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F
            label="Joining Date"
            required
            error={showErrors && errors.joiningDate}
          >
            <Input
              type="date"
              value={data.joiningDate || ""}
              onChange={(e) => onChange({ joiningDate: e.target.value })}
            />
          </F>

          <F
            label="Probation Tenure"
            required
            error={showErrors && errors.probationTenure}
          >
            <Input
              value={data.probationTenure || ""}
              onChange={(e) => onChange({ probationTenure: e.target.value })}
              placeholder="e.g., 3 months"
            />
          </F>

          <F label="Confirmation Date">
            <Input
              type="date"
              value={data.confirmationDate || ""}
              onChange={(e) => onChange({ confirmationDate: e.target.value })}
            />
          </F>

          <F
            label="Notice Period"
            required
            error={showErrors && errors.noticePeriod}
          >
            <Select
              value={data.noticePeriod || ""}
              onValueChange={(v) => onChange({ noticePeriod: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notice period" />
              </SelectTrigger>
              <SelectContent>
                {NOTICE_PERIODS.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Annual CTC (₹)" required error={showErrors && errors.ctc}>
            <Input
              type="text"
              value={formatIndianNumber(data.ctc)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(Number(raw))) {
                  onChange({ ctc: raw });
                }
              }}
              placeholder="Enter Annual CTC (₹)"
            />
          </F>

          <F
            label="Monthly Net Pay (₹)"
            required
            error={showErrors && errors.basicSalary}
          >
            <Input
              type="text"
              value={formatIndianNumber(data.basicSalary)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(Number(raw))) {
                  onChange({ basicSalary: raw });
                }
              }}
              placeholder="Enter Monthly Net Pay (₹)"
            />
          </F>

          <F
            label="Employment Type"
            required
            error={showErrors && errors.employmentType}
          >
            <Select
              value={data.employmentType || ""}
              onValueChange={(v) => onChange({ employmentType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F
            label="Employee Status"
            required
            error={showErrors && errors.employeeStatus}
          >
            <Select
              value={data.employeeStatus || ""}
              onValueChange={(v) => onChange({ employeeStatus: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
        </div>
      </div>

      {/* Login Credentials */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Info}
          title="Login Credentials"
          color="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Username" required error={showErrors && errors.username}>
            <Input
              value={data.username || ""}
              onChange={(e) => onChange({ username: e.target.value })}
              placeholder="Enter username"
            />
          </F>

          <F label="Password" required error={showErrors && errors.password}>
            <Input
              type="password"
              value={data.password || ""}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder="Enter password"
            />
          </F>

          <F label="Short Name" required error={showErrors && errors.shortName}>
            <Input
              type="text"
              value={data.shortName || ""}
              maxLength={5}
              onChange={(e) =>
                onChange({
                  shortName: e.target.value.toUpperCase(),
                })
              }
              placeholder="Enter Short Name (max 5 characters)"
            />
          </F>

          <F
            label="Access Role"
            required
            error={showErrors && errors.access_role}
          >
            <Select
              value={data.access_role || ""}
              onValueChange={(v) => onChange({ access_role: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Access Role" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ROLES.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
        </div>
      </div>

      {showErrors && hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Please fill in all required fields:
          </h4>
          <ul className="list-disc list-inside text-xs text-red-600">
            {Object.keys(errors).map((field) => (
              <li key={field}>{field.replace(/_/g, " ")} is required</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
