import {
  Building2,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Plus,
  Users,
} from "lucide-react";
import type { Department, SubDepartment } from "./types";

type Props = {
  department: Department;
  subDepartment: SubDepartment;
  onDepartmentChange: (v: Department) => void;
  onSubDepartmentChange: (v: SubDepartment) => void;
  onAdd: () => void;
  onAddDate?: () => void;
  onAddMapQuery?: () => void;
  showAdd?: boolean;
  showAddDate?: boolean;
  showAddMapQuery?: boolean;
  showTrack?: boolean;
  onTrack?: () => void;
};

export default function TrainingPageHeader({
  department,
  subDepartment,
  onDepartmentChange,
  onSubDepartmentChange,
  onAdd,
  onAddDate,
  onAddMapQuery,
  showAdd = false,
  showAddDate = false,
  showAddMapQuery = false,
  showTrack = false,
  onTrack,
}: Props) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-sky-100 p-5 lg:flex-row lg:items-center">
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sky-200">
          <GraduationCap size={40} className="text-blue-800" />
        </div>
        <div>
          <div className="text-sm font-semibold text-blue-500">
            Employee Development
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Training Manager
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage employee training programs and learning schedules.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* DEPARTMENT */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Building2 size={16} className="text-blue-800" />
            Department
          </label>
          <div className="relative">
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value as Department)}
              className="h-9 w-44 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">Select Department</option>
              <option value="sales">Sales</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-2.5 text-slate-500"
            />
          </div>
        </div>

        {/* SUB DEPARTMENT */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Users size={16} className="text-blue-800" />
            Sub Department
          </label>
          <div className="relative">
            <select
              value={subDepartment}
              disabled={!department}
              onChange={(e) =>
                onSubDepartmentChange(e.target.value as SubDepartment)
              }
              className="h-9 w-44 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Select Sub Department</option>
              {department === "sales" && (
                <>
                  <option value="presales">Pre-Sales</option>
                  <option value="telesales">Tele-Sales</option>
                </>
              )}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-2.5 text-slate-500"
            />
          </div>
        </div>

        {/* ADD TRAINING DATE */}
        {showAddDate && (
          <button
            type="button"
            onClick={onAddDate}
            className="flex h-[74px] items-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
          >
            <CalendarDays size={18} />
            Add Training Date
          </button>
        )}

        {/* ADD MAP QUERY */}
        {showAddMapQuery && (
          <button
            type="button"
            onClick={onAddMapQuery}
            className="flex h-[74px] items-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
          >
            <HelpCircle size={18} />
            Add Map Query
          </button>
        )}

        {/* ADD MODULE */}
        {showAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex h-[74px] items-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus size={18} />
            Add Training Module
          </button>
        )}

        {showTrack && (
          <button
            type="button"
            onClick={onTrack}
            className="flex h-[74px] items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Training Track Table
          </button>
        )}
      </div>
    </div>
  );
}
