import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchBranchesThunk } from "@/redux/features/branch/branchSlice";
import { RootState } from "@/redux/store";

interface BranchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  className?: string;
}

export default function BranchFilter({
  value,
  onChange,
  placeholder = "Branch",
  includeAllOption = true,
  className,
}: BranchFilterProps) {
  const dispatch = useAppDispatch();

  const { branches } = useAppSelector((state: RootState) => state.branch);

  useEffect(() => {
    if (!branches || branches.length === 0) {
      dispatch(fetchBranchesThunk());
    }
  }, [dispatch, branches]);

  const branchOptions = branches ?? [];

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
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-orange-600" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>

      <SelectContent className="rounded-xl border border-sky-100">
        {includeAllOption && <SelectItem value="all">All Branches</SelectItem>}

        {branchOptions.map((branch: any) => (
          <SelectItem key={branch.id} value={String(branch.id)}>
            {branch.branch_name ?? branch.name ?? `Branch ${branch.id}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
