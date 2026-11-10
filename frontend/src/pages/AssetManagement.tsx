"use client";

import { useState } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import {
  Monitor,
  Plus,
  Search,
  Tag,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import AddAssetModal, {
  type AssetStatus,
  type AssetFormData,
} from "@/components/addFromModels/Addassetmodal";

// Types

type Asset = {
  id: string;
  name: string;
  category: string;
  serial: string;
  status: AssetStatus;
  assignedTo: string | null;
  purchaseDate: string;
  value: number;
  seller: string;
  invoiceNo: string;
  department: string;
  warrantyTill: string;
  remarks: string;
};

// Config

const STATUS_CONFIG: Record<
  AssetStatus,
  { label: string; icon: any; bg: string; color: string }
> = {
  assigned: {
    label: "Assigned",
    icon: CheckCircle,
    bg: "hsl(var(--success) / 0.12)",
    color: "hsl(var(--success))",
  },
  available: {
    label: "Available",
    icon: Tag,
    bg: "hsl(var(--primary) / 0.12)",
    color: "hsl(var(--primary))",
  },
  maintenance: {
    label: "Maintenance",
    icon: AlertTriangle,
    bg: "hsl(var(--warning) / 0.12)",
    color: "hsl(var(--warning))",
  },
};

// ============================
// Main Component
// ============================
export default function AssetManagement() {
  const employees = useAppSelector((s: any) =>
    (s.employees?.employees || s.user?.employees || []).filter(
      (e: any) => e.status === "approved" || e.is_active === 1,
    ),
  );

  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AssetStatus | "all">("all");
  const [openModal, setOpenModal] = useState(false);

  // ============================
  // Derived
  // ============================
  const filtered = assets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.serial.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    total: assets.length,
    assigned: assets.filter((a) => a.status === "assigned").length,
    available: assets.filter((a) => a.status === "available").length,
    maintenance: assets.filter((a) => a.status === "maintenance").length,
  };

  // ============================
  // Helpers
  // ============================
  const getEmployeeName = (id: string | null) => {
    if (!id) return "—";
    const emp = employees.find(
      (e: any) => e.id?.toString() === id || e.employeeId === id,
    );
    if (emp) {
      const first = emp.firstName || emp.first_name || "";
      const last = emp.lastName || emp.last_name || "";
      return `${first} ${last}`.trim() || id;
    }
    return id;
  };

  const employeeOptions = employees.map((e: any) => ({
    id: e.id?.toString() || e.employeeId,
    name:
      `${e.firstName || e.first_name || ""} ${e.lastName || e.last_name || ""}`.trim() ||
      `Employee #${e.id}`,
  }));

  // ============================
  // Add asset handler
  // ============================
  const handleAddAsset = (data: AssetFormData) => {
    const newAsset: Asset = {
      id: `A${String(assets.length + 1).padStart(3, "0")}`,
      name: data.name,
      category: data.category,
      serial: data.serial,
      status: data.status,
      assignedTo: data.status === "assigned" ? data.assignedTo || null : null,
      purchaseDate: data.purchaseDate,
      value: Number(data.value) || 0,
      seller: data.seller,
      invoiceNo: data.invoiceNo,
      department: data.department,
      warrantyTill: data.warrantyTill,
      remarks: data.remarks,
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  // ============================
  // Render
  // ============================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Asset Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage company fixed assets
          </p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus size={15} /> Add Asset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: counts.total, color: "primary" },
          { label: "Assigned", value: counts.assigned, color: "success" },
          { label: "Available", value: counts.available, color: "primary" },
          { label: "Maintenance", value: counts.maintenance, color: "warning" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: `hsl(var(--${color}))` }}
            >
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…"
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "assigned", "available", "maintenance"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border"
                style={
                  filter === s
                    ? {
                        background: "hsl(var(--primary))",
                        color: "white",
                        borderColor: "hsl(var(--primary))",
                      }
                    : {
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                      }
                }
              >
                {s}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  "Asset",
                  "Category",
                  "Serial / UC Tag",
                  "Status",
                  "Department",
                  "Assigned To",
                  "Purchase Date",
                  "Value",
                  "Remarks",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-muted-foreground text-sm"
                  >
                    {assets.length === 0
                      ? 'No assets added yet. Click "+ Add Asset" to get started.'
                      : "No assets match your search or filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => {
                  const sc = STATUS_CONFIG[asset.status];
                  const Icon = sc.icon;
                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "hsl(var(--primary) / 0.1)" }}
                          >
                            <Monitor
                              size={14}
                              style={{ color: "hsl(var(--primary))" }}
                            />
                          </div>
                          <span className="font-medium text-foreground whitespace-nowrap">
                            {asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {asset.category}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {asset.serial || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          <Icon size={11} /> {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {asset.department || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {getEmployeeName(asset.assignedTo)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {asset.purchaseDate || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        {asset.value
                          ? `₹${asset.value.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">
                        {asset.remarks || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddAsset}
        employees={employeeOptions}
      />
    </div>
  );
}
