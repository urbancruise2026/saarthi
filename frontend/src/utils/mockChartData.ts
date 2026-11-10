// ─── Monthly Trends ─────────────────────────────────────────

export const AllState = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];



export const monthlyTrends = [
  { month: "Sep", attendance: 91, tasks: 78, leaves: 5, salary: 320000 },
  { month: "Oct", attendance: 93, tasks: 82, leaves: 4, salary: 325000 },
  { month: "Nov", attendance: 89, tasks: 85, leaves: 7, salary: 330000 },
  { month: "Dec", attendance: 87, tasks: 80, leaves: 10, salary: 340000 },
  { month: "Jan", attendance: 94, tasks: 88, leaves: 3, salary: 345000 },
  { month: "Feb", attendance: 92, tasks: 90, leaves: 6, salary: 350000 },
];

// ─── Department Stats ───────────────────────────────────────
export const departmentStats = [
  { name: "Engineering", employees: 45, attendance: 94, tasksCompleted: 88 },
  { name: "HR", employees: 12, attendance: 97, tasksCompleted: 95 },
  { name: "Finance", employees: 18, attendance: 92, tasksCompleted: 82 },
  { name: "Marketing", employees: 22, attendance: 90, tasksCompleted: 79 },
  { name: "Sales", employees: 30, attendance: 88, tasksCompleted: 85 },
  { name: "Design", employees: 15, attendance: 93, tasksCompleted: 91 },
  { name: "Operations", employees: 20, attendance: 91, tasksCompleted: 87 },
];

// ─── Gender Distribution ────────────────────────────────────
export const genderData = [
  { name: "Male", value: 98, fill: "hsl(var(--primary))" },
  { name: "Female", value: 60, fill: "hsl(var(--brand-orange))" },
  { name: "Other", value: 4, fill: "hsl(var(--brand-yellow))" },
];

// ─── Employee Personal Monthly Attendance ───────────────────
export const personalAttendance = [
  { month: "Sep", present: 21, absent: 1, late: 0, leave: 0 },
  { month: "Oct", present: 20, absent: 0, late: 2, leave: 1 },
  { month: "Nov", present: 19, absent: 1, late: 1, leave: 1 },
  { month: "Dec", present: 18, absent: 0, late: 1, leave: 3 },
  { month: "Jan", present: 21, absent: 0, late: 1, leave: 0 },
  { month: "Feb", present: 17, absent: 1, late: 1, leave: 1 },
];

// ─── Employee Leave Usage Breakdown ─────────────────────────
export const leaveUsageData = [
  { name: "Casual", value: 4, fill: "hsl(var(--primary))" },
  { name: "Sick", value: 2, fill: "hsl(var(--destructive))" },
  { name: "Earned", value: 1, fill: "hsl(var(--brand-orange))" },
  { name: "Remaining", value: 11, fill: "hsl(var(--muted))" },
];

// ─── Team Attendance Trend ──────────────────────────────────
export const teamAttendanceTrend = [
  { month: "Sep", present: 88, absent: 5, late: 4, leave: 3 },
  { month: "Oct", present: 90, absent: 3, late: 5, leave: 2 },
  { month: "Nov", present: 85, absent: 6, late: 3, leave: 6 },
  { month: "Dec", present: 82, absent: 4, late: 6, leave: 8 },
  { month: "Jan", present: 92, absent: 2, late: 3, leave: 3 },
  { month: "Feb", present: 89, absent: 3, late: 4, leave: 4 },
];

// ─── Team Performance Ratings ───────────────────────────────
export const teamPerformanceRatings = [
  { name: "Rahul G.", rating: 3.5, tasks: 70, attendance: 80 },
  { name: "Sneha K.", rating: 4.5, tasks: 95, attendance: 88 },
  { name: "Ananya P.", rating: 3.8, tasks: 80, attendance: 85 },
  { name: "Vikram S.", rating: 4.0, tasks: 88, attendance: 92 },
];

// ─── Task Completion Trend ──────────────────────────────────
export const taskCompletionTrend = [
  { month: "Sep", completed: 12, pending: 3, inProgress: 5 },
  { month: "Oct", completed: 15, pending: 2, inProgress: 4 },
  { month: "Nov", completed: 10, pending: 5, inProgress: 6 },
  { month: "Dec", completed: 14, pending: 1, inProgress: 3 },
  { month: "Jan", completed: 18, pending: 2, inProgress: 2 },
  { month: "Feb", completed: 16, pending: 3, inProgress: 4 },
];

// ─── Payroll Summary ────────────────────────────────────────
export const payrollSummary = [
  { month: "Sep", gross: 520000, deductions: 78000, net: 442000 },
  { month: "Oct", gross: 525000, deductions: 79000, net: 446000 },
  { month: "Nov", gross: 530000, deductions: 80000, net: 450000 },
  { month: "Dec", gross: 540000, deductions: 82000, net: 458000 },
  { month: "Jan", gross: 545000, deductions: 83000, net: 462000 },
  { month: "Feb", gross: 550000, deductions: 84000, net: 466000 },
];

// ─── Recent Activity (Admin) ────────────────────────────────
export const recentActivity = [
  { id: 1, action: "New employee onboarded", name: "Priya Sharma", department: "Engineering", time: "2 hours ago", type: "success" as const },
  { id: 2, action: "Leave approved", name: "Rahul Gupta", department: "Finance", time: "4 hours ago", type: "success" as const },
  { id: 3, action: "Task completed", name: "Sneha Kulkarni", department: "Design", time: "5 hours ago", type: "info" as const },
  { id: 4, action: "Payroll processed", name: "February Batch", department: "All", time: "1 day ago", type: "info" as const },
  { id: 5, action: "Leave rejected", name: "Vikram Singh", department: "Sales", time: "1 day ago", type: "warning" as const },
];

// ─── Salary Breakdown (Employee) ────────────────────────────
export const salaryBreakdown = [
  { component: "Basic", amount: 30000 },
  { component: "HRA", amount: 15000 },
  { component: "DA", amount: 10000 },
  { component: "Special", amount: 12000 },
  { component: "PF Deduction", amount: -3600 },
  { component: "Tax", amount: -5000 },
];