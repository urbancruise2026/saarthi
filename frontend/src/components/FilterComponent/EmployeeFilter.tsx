import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { fetchEmployeeListThunk } from "@/redux/features/userSlice";
import { RootState } from "@/redux/store";

interface EmployeeFilterProps {
  value: string;
  onChange: (value: string) => void;
  branchId?: string;
  includeAllOption?: boolean;
  className?: string;
}

export default function EmployeeFilter({
  value,
  onChange,
  branchId,
  includeAllOption = true,
  className = "w-full sm:w-[220px] h-10",
}: EmployeeFilterProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const employeeList = useAppSelector(
    (state: RootState) => state.user.employeeList,
  );

  useEffect(() => {
    dispatch(
      fetchEmployeeListThunk(
        branchId && branchId !== "all" ? branchId : undefined,
      ),
    );
  }, [dispatch, branchId]);

  const employeeOptions = useMemo(
    () => (Array.isArray(employeeList) ? employeeList : []),
    [employeeList],
  );

  const selectedEmployee = employeeOptions.find(
    (e: any) => String(e.id) === value,
  );

  const selectedLabel =
    value === "all" || !value
      ? "All Employees"
      : selectedEmployee?.full_name || "Select Employee";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            className,
            "justify-between rounded-xl border border-orange-200 hover:bg-orange-100 text-orange-700 shadow-sm transition-all focus:ring-2 focus:ring-orange-300",
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 text-sky-600 shrink-0" />
            <span className="truncate">{selectedLabel}</span>
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 text-sky-600 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0 rounded-xl border border-sky-200">
        <Command>
          <CommandInput placeholder="Search employee..." />

          <CommandList>
            <CommandEmpty>No employee found.</CommandEmpty>

            <CommandGroup>
              {includeAllOption && (
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange("all");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-sky-600",
                      value === "all" || !value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  All Employees
                </CommandItem>
              )}

              {employeeOptions.map((emp: any) => (
                <CommandItem
                  key={emp.id}
                  value={`${emp.id} ${emp.full_name ?? ""}`}
                  onSelect={() => {
                    onChange(String(emp.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-sky-600",
                      value === String(emp.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {emp.full_name || "Unknown Employee"}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
