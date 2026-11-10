"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Plus,
  Search,
  Users,
  Wallet,
  CalendarMinus,
  CalendarCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// sabhi months null se shuru, sirf jo values di hain wo override hongi
const mk = (over = {}) => ({
  ...Object.fromEntries(months.map((m) => [m, null])),
  ...over,
});

const employees = [
  {
    id: 1,
    name: "Ashish Mathur",
    doj: "17-Apr-25",
    dol: "",
    joiningMonth: 3,
    monthly: mk({ SEP: 1, OCT: 0, NOV: 1, DEC: 0 }),
    cf: 0,
    credit: 5,
    total: 5,
    available: 2,
    balance: 3,
  },
  {
    id: 2,
    name: "Monu Gehlot",
    doj: "29-May-25",
    dol: "",
    joiningMonth: 4,
    monthly: mk({ NOV: 2, DEC: 0 }),
    cf: 0,
    credit: 3,
    total: 3,
    available: 2,
    balance: 1,
  },
  {
    id: 3,
    name: "Vishnu Yadav",
    doj: "27-May-25",
    dol: "13-Oct-25",
    joiningMonth: 4,
    leavingMonth: 9,
    monthly: mk(),
    cf: 0,
    credit: 0,
    total: 0,
    available: 0,
    balance: 0,
  },
  {
    id: 4,
    name: "Mitali Singh",
    doj: "27-Nov-25",
    dol: "",
    joiningMonth: 10,
    monthly: mk(),
    cf: 0,
    credit: 4,
    total: 4,
    available: 0,
    balance: 4,
  },
  {
    id: 5,
    name: "Garima Verma",
    doj: "11-Jun-25",
    dol: "",
    joiningMonth: 5,
    monthly: mk(),
    cf: 0,
    credit: 0,
    total: 0,
    available: 0,
    balance: 0,
  },
  {
    id: 6,
    name: "Abhishek Kumar",
    doj: "15-Sep-25",
    dol: "",
    joiningMonth: 8,
    monthly: mk(),
    cf: 0,
    credit: 0,
    total: 0,
    available: 0,
    balance: 0,
  },
  {
    id: 7,
    name: "Kumari Cristi",
    doj: "10-Jun-25",
    dol: "",
    joiningMonth: 5,
    monthly: mk({ SEP: 1, OCT: 0, NOV: 0, DEC: 0 }),
    cf: 0,
    credit: 4,
    total: 4,
    available: 1,
    balance: 3,
  },
  {
    id: 8,
    name: "Sannu Chaturedi",
    doj: "10-Nov-25",
    dol: "",
    joiningMonth: 10,
    monthly: mk(),
    cf: 0,
    credit: 5,
    total: 5,
    available: 0,
    balance: 5,
  },
  {
    id: 9,
    name: "Anshika Chaurasiya",
    doj: "30-Jun-25",
    dol: "",
    joiningMonth: 6,
    monthly: mk(),
    cf: 0,
    credit: 0,
    total: 0,
    available: 0,
    balance: 0,
  },
];

const departmentGroups = [
  { name: "HO", ids: [1, 2, 3, 4, 5, 6] },
  { name: "SALES", ids: [7, 8] },
  { name: "ADMIN", ids: [9] },
];

// sticky left columns ki width (px). left offset inme se calculate hota hai
const COL = { name: 190, doj: 96, dol: 96, tenure: 78 };
const LEFT = {
  name: 0,
  doj: COL.name,
  dol: COL.name + COL.doj,
  tenure: COL.name + COL.doj + COL.dol,
};

// "17-Apr-25" -> Date
function parseDate(value) {
  if (!value) return null;
  const [d, mon, yy] = value.split("-");
  const mi = months.indexOf(mon?.toUpperCase());
  if (mi < 0) return null;
  const year = 2000 + Number(yy);
  const date = new Date(year, mi, Number(d));
  return isNaN(date.getTime()) ? null : date;
}

function getTenure(doj, dol) {
  const start = parseDate(doj);
  if (!start) return "—";
  const end = parseDate(dol) ?? new Date();
  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) totalMonths -= 1;
  if (totalMonths < 0) return "—";
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y && m) return `${y}y ${m}m`;
  if (y) return `${y}y`;
  return `${m}m`;
}

const isNotApplicable = (e, monthIdx) =>
  monthIdx < e.joiningMonth ||
  (e.leavingMonth !== undefined && monthIdx > e.leavingMonth);

const NA_STRIPES = {
  backgroundImage:
    "repeating-linear-gradient(45deg, #E5E7EB 0, #E5E7EB 4px, #F3F4F6 4px, #F3F4F6 8px)",
};

function StatCard({ label, value, icon: Icon, bg }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-4 py-4 shadow-md"
      style={{ background: bg }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/60 text-gray-800">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xl font-bold leading-tight text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function EmployeeRow({ employee }) {
  const initial = employee.name.charAt(0).toUpperCase();

  return (
    <tr className="group h-11">
      <td
        className="sticky z-10 border-b border-r bg-white px-3 group-hover:bg-green-50"
        style={{ left: LEFT.name, minWidth: COL.name, width: COL.name }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
            {initial}
          </span>
          <span className="truncate text-sm font-semibold text-gray-900">
            {employee.name}
          </span>
        </div>
      </td>

      <td
        className="sticky z-10 border-b border-r bg-white px-3 text-xs text-gray-600 group-hover:bg-green-50"
        style={{ left: LEFT.doj, minWidth: COL.doj, width: COL.doj }}
      >
        {employee.doj || "—"}
      </td>

      <td
        className="sticky z-10 border-b border-r bg-white px-3 text-xs text-gray-600 group-hover:bg-green-50"
        style={{ left: LEFT.dol, minWidth: COL.dol, width: COL.dol }}
      >
        {employee.dol || "—"}
      </td>

      <td
        className="sticky z-10 border-b border-r bg-white px-3 text-xs font-medium text-gray-700 group-hover:bg-green-50"
        style={{ left: LEFT.tenure, minWidth: COL.tenure, width: COL.tenure }}
      >
        {getTenure(employee.doj, employee.dol)}
      </td>

      {months.map((month, idx) => {
        const na = isNotApplicable(employee, idx);
        const value = employee.monthly[month];

        if (na) {
          return (
            <td
              key={month}
              className="border-b border-r"
              style={NA_STRIPES}
              title="Not applicable"
            />
          );
        }

        if (value === null) {
          return <td key={month} className="border-b border-r bg-green-50" />;
        }

        return (
          <td key={month} className="border-b border-r bg-white text-center">
            {value > 0 ? (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-100 px-1.5 text-xs font-bold text-orange-700">
                {value}
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-400">0</span>
            )}
          </td>
        );
      })}

      {/* Annual */}
      <td className="border-b border-r bg-amber-50/60 text-center text-sm text-gray-500">
        {employee.cf}
      </td>
      <td className="border-b border-r bg-amber-50/60 text-center text-sm text-gray-700">
        {employee.credit}
      </td>
      <td className="border-b border-r bg-amber-50/60 text-center text-sm font-bold text-gray-900">
        {employee.total}
      </td>
      <td className="border-b border-r bg-yellow-50 text-center">
        <span
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
            employee.available > 0 ? "bg-red-100 text-red-600" : "text-gray-400"
          }`}
        >
          {employee.available}
        </span>
      </td>
      <td className="border-b bg-green-50 text-center">
        <span
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
            employee.balance > 0
              ? "bg-green-200 text-green-800"
              : "text-gray-400"
          }`}
        >
          {employee.balance}
        </span>
      </td>
    </tr>
  );
}

function DepartmentRow({ name, count }) {
  return (
    <tr>
      <td
        colSpan={4 + months.length + 5}
        className="border-b bg-green-100/70 px-3 py-1.5"
      >
        <div className="sticky left-3 flex w-fit items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-green-900">
            {name}
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-green-800">
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
}

export default function LeaveManagementTable() {
  const [year, setYear] = useState("2025");
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("HO");

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return employees;
    return employees.filter((e) => e.name.toLowerCase().includes(keyword));
  }, [search]);

  const totals = useMemo(
    () =>
      filteredEmployees.reduce(
        (acc, e) => ({
          credit: acc.credit + e.total,
          used: acc.used + e.available,
          balance: acc.balance + e.balance,
        }),
        { credit: 0, used: 0, balance: 0 },
      ),
    [filteredEmployees],
  );

  const prevYear = Number(year) - 1;

  return (
    <div className="w-full space-y-4">
      {/* ---------- Summary cards ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Employees"
          value={filteredEmployees.length}
          icon={Users}
          bg="#B8E6FE"
        />
        <StatCard
          label="Total Credit"
          value={totals.credit}
          icon={Wallet}
          bg="#DDD6FE"
        />
        <StatCard
          label="Leaves Used"
          value={totals.used}
          icon={CalendarMinus}
          bg="#FFD8A8"
        />
        <StatCard
          label="Balance"
          value={totals.balance}
          icon={CalendarCheck}
          bg="#B9F5D0"
        />
      </div>

      {/* ---------- Main card ---------- */}
      <div
        className="w-full overflow-hidden rounded-xl border-2 bg-white shadow-sm"
        style={{ borderColor: "#BBF7D0" }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50/70 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="h-9 w-[130px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HO">HO</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-9 w-[110px] bg-white font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-[240px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-white pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 gap-2 bg-white">
              <Download size={16} />
              Export
            </Button>
            <Button className="h-9 gap-2 bg-green-600 hover:bg-green-700">
              <Plus size={16} />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[68vh] w-full overflow-auto">
          <table className="w-full min-w-[1250px] border-separate border-spacing-0">
            <thead>
              {/* Group header */}
              <tr className="h-9">
                <th
                  colSpan={4}
                  className="sticky left-0 top-0 z-30 border-b border-r bg-orange-100 text-xs font-extrabold uppercase tracking-wide text-orange-900"
                >
                  Employment details
                </th>
                <th
                  colSpan={12}
                  className="sticky top-0 z-20 border-b border-r bg-pink-100 text-xs font-extrabold uppercase tracking-wide text-pink-900"
                >
                  Paid leaves (monthly)
                </th>
                <th
                  colSpan={5}
                  className="sticky top-0 z-20 border-b bg-amber-100 text-xs font-extrabold uppercase tracking-wide text-amber-900"
                >
                  Paid leaves (annual)
                </th>
              </tr>

              {/* Column header */}
              <tr className="h-10">
                <th
                  className="sticky top-9 z-30 border-b border-r bg-orange-50 px-3 text-left text-[11px] font-bold uppercase text-orange-900"
                  style={{
                    left: LEFT.name,
                    minWidth: COL.name,
                    width: COL.name,
                  }}
                >
                  Staff name
                </th>
                <th
                  className="sticky top-9 z-30 border-b border-r bg-orange-50 px-3 text-left text-[11px] font-bold uppercase text-orange-900"
                  style={{ left: LEFT.doj, minWidth: COL.doj, width: COL.doj }}
                >
                  DOJ
                </th>
                <th
                  className="sticky top-9 z-30 border-b border-r bg-orange-50 px-3 text-left text-[11px] font-bold uppercase text-orange-900"
                  style={{ left: LEFT.dol, minWidth: COL.dol, width: COL.dol }}
                >
                  DOL
                </th>
                <th
                  className="sticky top-9 z-30 border-b border-r bg-orange-50 px-3 text-left text-[11px] font-bold uppercase text-orange-900"
                  style={{
                    left: LEFT.tenure,
                    minWidth: COL.tenure,
                    width: COL.tenure,
                  }}
                >
                  Tenure
                </th>

                {months.map((month) => (
                  <th
                    key={month}
                    className="sticky top-9 z-20 min-w-[52px] border-b border-r bg-pink-50 text-[11px] font-bold text-pink-900"
                  >
                    {month}
                  </th>
                ))}

                <th className="sticky top-9 z-20 min-w-[56px] border-b border-r bg-amber-50 text-[10px] font-bold leading-tight text-amber-900">
                  C/F
                  <br />
                  {prevYear}
                </th>
                <th className="sticky top-9 z-20 min-w-[56px] border-b border-r bg-amber-50 text-[10px] font-bold uppercase text-amber-900">
                  Credit
                </th>
                <th className="sticky top-9 z-20 min-w-[56px] border-b border-r bg-amber-50 text-[10px] font-bold uppercase text-amber-900">
                  Total
                </th>
                <th className="sticky top-9 z-20 min-w-[72px] border-b border-r bg-yellow-100 text-[10px] font-bold uppercase text-yellow-900">
                  Available
                </th>
                <th className="sticky top-9 z-20 min-w-[72px] border-b bg-green-100 text-[10px] font-bold uppercase text-green-900">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={4 + months.length + 5}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No employees found.
                  </td>
                </tr>
              )}

              {departmentGroups.map((group) => {
                const groupEmployees = filteredEmployees.filter((e) =>
                  group.ids.includes(e.id),
                );
                if (!groupEmployees.length) return null;

                return (
                  <React.Fragment key={group.name}>
                    <DepartmentRow
                      name={group.name}
                      count={groupEmployees.length}
                    />
                    {groupEmployees.map((employee) => (
                      <EmployeeRow key={employee.id} employee={employee} />
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer: legend + count */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-gray-50/70 px-4 py-2.5 text-xs text-gray-600">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded border" style={NA_STRIPES} />
              Not applicable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded border bg-green-50" />
              No leave recorded
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-orange-100" />
              Leave taken
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>Total employees: {filteredEmployees.length}</span>
            <span>Year: {year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
