import { useEffect, useState } from "react";
import { Building2, CalendarDays, ChevronDown, Users, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getTrainingStartDate } from "@/redux/features/TrainingModule/traininModuleApi";
import { updateStartDate } from "@/redux/features/TrainingModule/trainingModuleSlice";
import type { Department, SubDepartment } from "./types";

type Props = {
  defaultDepartment: Department;
  defaultSubDepartment: SubDepartment;
  onSaved: (department: Department, subDepartment: SubDepartment) => void;
  onClose: () => void;
};

const selectCls =
  "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function TrainingDateModal({
  defaultDepartment,
  defaultSubDepartment,
  onSaved,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();
  const savingDate = useAppSelector(
    (state: any) => state.trainingModule.savingDate,
  );

  const [department, setDepartment] = useState<Department>(defaultDepartment);
  const [subDepartment, setSubDepartment] =
    useState<SubDepartment>(defaultSubDepartment);
  const [date, setDate] = useState("");
  const [loadingDate, setLoadingDate] = useState(false);
  const [error, setError] = useState("");

  // Program select hote hi uski existing date dikhao
  useEffect(() => {
    if (!department || !subDepartment) {
      setDate("");
      return;
    }
    let cancelled = false;
    setLoadingDate(true);
    getTrainingStartDate({ department, subDepartment })
      .then((d) => !cancelled && setDate(d ?? ""))
      .catch(() => !cancelled && setDate(""))
      .finally(() => !cancelled && setLoadingDate(false));
    return () => {
      cancelled = true;
    };
  }, [department, subDepartment]);

  const handleDepartmentChange = (v: Department) => {
    setDepartment(v);
    setSubDepartment("");
    setError("");
  };

  const handleSave = async () => {
    if (!department) return setError("Please select a department");
    if (!subDepartment) return setError("Please select a sub department");
    if (!date) return setError("Please select a training date");

    try {
      setError("");
      await dispatch(
        updateStartDate({ department, subDepartment, startDate: date }),
      ).unwrap();
      onSaved(department, subDepartment);
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Failed to save training date");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <CalendarDays size={20} className="text-blue-800" />
            Add Training Date
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 size={16} className="text-blue-800" />
              Department
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) =>
                  handleDepartmentChange(e.target.value as Department)
                }
                className={selectCls}
              >
                <option value="">Select Department</option>
                <option value="sales">Sales</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-3.5 text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Users size={16} className="text-blue-800" />
              Sub Department
            </label>
            <div className="relative">
              <select
                value={subDepartment}
                disabled={!department}
                onChange={(e) => {
                  setSubDepartment(e.target.value as SubDepartment);
                  setError("");
                }}
                className={selectCls}
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
                className="pointer-events-none absolute right-2.5 top-3.5 text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
              <CalendarDays size={16} className="text-blue-800" />
              Training Start Date
            </label>
            <input
              type="date"
              value={date}
              disabled={!subDepartment || loadingDate}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            {loadingDate && (
              <p className="mt-1 text-xs text-slate-500">
                Loading existing date...
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={savingDate || loadingDate}
            className="h-10 rounded-lg bg-green-600 px-5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingDate ? "Saving..." : "Save Date"}
          </button>
        </div>
      </div>
    </div>
  );
}


