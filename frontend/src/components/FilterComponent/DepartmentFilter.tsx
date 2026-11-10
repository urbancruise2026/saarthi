import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDepartments } from "@/redux/features/department/departmentSlice";
import { RootState } from "@/redux/store";

interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  className?: string;
}

export default function DepartmentFilter({
  value,
  onChange,
  placeholder = "Department",
  includeAllOption = true,
  className,
}: DepartmentFilterProps) {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector(
    (state: RootState) => state.department,
  );

  useEffect(() => {
    if (!departments || departments.length === 0) {
      dispatch(fetchDepartments());
    }
  }, [dispatch, departments]);

  const departmentOptions = departments ?? [];

  const hasCustomStyle = Boolean(className && className.trim().length > 0);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "w-full sm:w-[180px] h-10 rounded-xl shadow-sm transition-all",
          hasCustomStyle
            ? className
            : "border border-orange-200 hover:bg-orange-100 text-orange-700 focus:ring-2 focus:ring-orange-300",
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">All Departments</SelectItem>
        )}
        {departmentOptions.map((dept: any) => (
          <SelectItem key={dept.id} value={String(dept.id)}>
            {dept.department_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
