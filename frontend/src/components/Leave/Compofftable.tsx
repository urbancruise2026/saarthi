import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, Search, CalendarDays } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
// apne actual path se update kar lena
import { RootState } from "@/redux/store";
import { fetchCompOffs } from "@/redux/features/Compoff/Compoffslice";
import { CompOffFilters } from "@/redux/features/Compoff/Compoffapi";
import BranchFilter from "@/components/FilterComponent/BranchFilter";
import DepartmentFilter from "@/components/FilterComponent/DepartmentFilter";
import EmployeeFilter from "@/components/FilterComponent/EmployeeFilter";
import { Pagination } from "@/components/Pagination/Pagination"; // apne actual path se update kar lena
import { useAccessControl } from "@/utils/Accesscontrol";

const statusColor: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border-green-300",
  pending: "bg-orange-100 text-orange-700 border-orange-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
};

function CompOffTable() {
  const dispatch = useAppDispatch();
  const { can } = useAccessControl();
  const canUseFilters = can("COMP_OFF_FILTERS");
  const { list, loading, error, pagination } = useAppSelector(
    (s: RootState) => s.compOffs,
  );

  // Filters — same components/pattern as DutyRoster.tsx
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Jab bhi koi filter badle, page 1 pe reset kar do
  useEffect(() => {
    setPage(1);
  }, [
    branchFilter,
    departmentFilter,
    employeeFilter,
    statusFilter,
    dateFilter,
  ]);

  useEffect(() => {
    const params: CompOffFilters = {
      branchId: branchFilter !== "all" ? branchFilter : undefined,
      departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
      employeeId: employeeFilter !== "all" ? employeeFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      startDate: dateFilter || undefined,
      endDate: dateFilter || undefined,
      page,
      limit,
    };
    dispatch(fetchCompOffs(params));
  }, [
    dispatch,
    branchFilter,
    departmentFilter,
    employeeFilter,
    statusFilter,
    dateFilter,
    page,
    limit,
  ]);

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase();
    const safeList = Array.isArray(list) ? list : [];
    return safeList.filter((c: any) =>
      (c.employee_name ?? "").toLowerCase().includes(keyword),
    );
  }, [list, search]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filters — same components/pattern as DutyRoster.tsx */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <div className="flex flex-col sm:flex-row flex-wrap gap-7 w-full justify-center">
          <div className="relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee…"
              className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm"
            />
          </div>

          {canUseFilters && (
            <>
              <BranchFilter value={branchFilter} onChange={setBranchFilter} />

              <DepartmentFilter
                value={departmentFilter}
                onChange={setDepartmentFilter}
              />

              <EmployeeFilter
                value={employeeFilter}
                onChange={setEmployeeFilter}
                branchId={branchFilter}
              />
            </>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg px-3 py-2 text-sm font-medium"
          style={{ background: "#FEE2E2", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl border-2 bg-card overflow-hidden"
        style={{ borderColor: "#99F6E4" }}
      >
        <Table>
          <TableHeader>
            <TableRow
              style={{ background: "#0F766E" }}
              className="hover:bg-transparent"
            >
              <TableHead className="text-white uppercase text-xs font-semibold">
                Employee
              </TableHead>
              <TableHead className="text-white uppercase text-xs font-semibold">
                Branch
              </TableHead>
              <TableHead className="text-white uppercase text-xs font-semibold">
                Department
              </TableHead>
              <TableHead className="text-white uppercase text-xs font-semibold">
                Earned Date
              </TableHead>
              <TableHead className="text-white uppercase text-xs font-semibold">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Loading comp-offs…
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CalendarClock size={28} className="opacity-50" />
                    <span>No comp-offs found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.employee_name}
                  </TableCell>
                  <TableCell>{c.branch_name || "-"}</TableCell>
                  <TableCell>{c.department_name || "-"}</TableCell>
                  <TableCell>{c.earned_date?.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusColor[c.status?.toLowerCase()] ??
                        "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          hasPrevPage={pagination.hasPrevPage}
          hasNextPage={pagination.hasNextPage}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  );
}

export default CompOffTable;
