import { useState } from "react";
import { Receipt, Plus, Search, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

type ExpenseStatus = "pending" | "approved" | "rejected";
type ExpenseCategory = "Travel" | "Food" | "Accommodation" | "Office Supplies" | "Medical" | "Training" | "Other";

interface Expense {
  id: string;
  employeeName: string;
  department: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  receipt: boolean;
}

const MOCK_EXPENSES: Expense[] = [
  { id: "EX001", employeeName: "Priya Sharma", department: "Engineering", category: "Travel", description: "Client visit to Mumbai", amount: 12500, date: "2025-02-10", status: "pending", receipt: true },
  { id: "EX002", employeeName: "Rahul Mehta", department: "Sales", category: "Food", description: "Team lunch meeting", amount: 3200, date: "2025-02-08", status: "approved", receipt: true },
  { id: "EX003", employeeName: "Anjali Singh", department: "HR", category: "Training", description: "HR certification course", amount: 18000, date: "2025-02-05", status: "approved", receipt: true },
  { id: "EX004", employeeName: "Karan Patel", department: "Finance", category: "Office Supplies", description: "Stationery and printer ink", amount: 1850, date: "2025-02-03", status: "rejected", receipt: false },
  { id: "EX005", employeeName: "Neha Gupta", department: "Marketing", category: "Accommodation", description: "Conference stay - 3 nights", amount: 9600, date: "2025-01-28", status: "pending", receipt: true },
];

const STATUS_CONFIG: Record<ExpenseStatus, { label: string; icon: any; bg: string; color: string }> = {
  pending: { label: "Pending", icon: Clock, bg: "hsl(var(--warning) / 0.12)", color: "hsl(var(--warning))" },
  approved: { label: "Approved", icon: CheckCircle, bg: "hsl(var(--success) / 0.12)", color: "hsl(var(--success))" },
  rejected: { label: "Rejected", icon: XCircle, bg: "hsl(var(--destructive) / 0.12)", color: "hsl(var(--destructive))" },
};

export default function ImprestExpense() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "all">("all");

  const filtered = expenses.filter((e) => {
    const matchSearch =
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === "all" || e.status === statusFilter);
  });

  const totalPending = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const totalApproved = expenses.filter((e) => e.status === "approved").reduce((s, e) => s + e.amount, 0);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const handleStatusChange = (id: string, newStatus: ExpenseStatus) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Imprest & Expense</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage employee expense claims and reimbursements</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus size={15} /> New Claim
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Claims", value: expenses.filter((e) => e.status === "pending").length, sub: fmt(totalPending), color: "warning" },
          { label: "Approved This Month", value: expenses.filter((e) => e.status === "approved").length, sub: fmt(totalApproved), color: "success" },
          { label: "Total Claims", value: expenses.length, sub: "All time", color: "primary" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
            style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `hsl(var(--${color}) / 0.12)` }}>
              <TrendingUp size={20} style={{ color: `hsl(var(--${color}))` }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
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
            placeholder="Search expenses…"
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border"
              style={
                statusFilter === s
                  ? { background: "hsl(var(--primary))", color: "white", borderColor: "hsl(var(--primary))" }
                  : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Employee", "Category", "Description", "Amount", "Date", "Receipt", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => {
                const sc = STATUS_CONFIG[exp.status];
                const Icon = sc.icon;
                return (
                  <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{exp.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{exp.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{exp.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{exp.description}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{fmt(exp.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{exp.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${exp.receipt ? "text-green-600" : "text-red-500"}`}>
                        {exp.receipt ? "✓ Attached" : "✗ Missing"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: sc.bg, color: sc.color }}>
                        <Icon size={11} /> {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {exp.status === "pending" && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleStatusChange(exp.id, "approved")}
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ background: "hsl(var(--success))" }}>
                            Approve
                          </button>
                          <button onClick={() => handleStatusChange(exp.id, "rejected")}
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ background: "hsl(var(--destructive))" }}>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
