import { useState } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { DollarSign, Download, Search, Filter, TrendingUp, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generatePayroll(emp: any, month: number, year: number) {
  const basic = 45000 + Math.floor(Math.random() * 30000);
  const hra = Math.round(basic * 0.4);
  const da = Math.round(basic * 0.1);
  const gross = basic + hra + da;
  const pf = Math.round(basic * 0.12);
  const tax = gross > 50000 ? Math.round(gross * 0.1) : 0;
  const net = gross - pf - tax;
  return { basic, hra, da, gross, pf, tax, net, month, year };
}

export default function Payroll() {
  const employees = useAppSelector((s) =>
    s.employees.employees.filter((e) => e.status === "approved")
  );
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const payrollData = filtered.map((emp) => ({
    ...emp,
    ...generatePayroll(emp, selectedMonth, selectedYear),
  }));

  const totalGross = payrollData.reduce((s, e) => s + e.gross, 0);
  const totalNet = payrollData.reduce((s, e) => s + e.net, 0);
  const totalPF = payrollData.reduce((s, e) => s + e.pf, 0);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage monthly salary processing</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Download size={15} /> Export Payslips
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Gross", value: fmt(totalGross), icon: DollarSign, color: "primary" },
          { label: "Total Net Pay", value: fmt(totalNet), icon: TrendingUp, color: "success" },
          { label: "Total PF", value: fmt(totalPF), icon: Users, color: "warning" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
            style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `hsl(var(--${color}) / 0.12)` }}>
              <Icon size={20} style={{ color: `hsl(var(--${color}))` }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background text-sm">
          <Calendar size={14} className="text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent focus:outline-none text-sm"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m} {selectedYear}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Employee", "Department", "Basic", "HRA", "DA", "Gross", "PF", "Tax", "Net Pay", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrollData.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground text-sm">No approved employees found</td></tr>
              ) : payrollData.map((emp) => (
                <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.department}</td>
                  <td className="px-4 py-3 font-medium">{fmt(emp.basic)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(emp.hra)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(emp.da)}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(emp.gross)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(emp.pf)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(emp.tax)}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold" style={{ color: "hsl(var(--success))" }}>{fmt(emp.net)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">
                      <Download size={12} /> Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
