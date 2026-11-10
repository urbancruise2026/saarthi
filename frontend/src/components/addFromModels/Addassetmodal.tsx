"use client";

import { useState } from "react";
import { Package, MapPin, ShoppingCart, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================
// Types
// ============================
export type AssetStatus = "assigned" | "available" | "maintenance";

export type AssetFormData = {
  name: string;
  category: string;
  serial: string;
  status: AssetStatus;
  assignedTo: string;
  purchaseDate: string;
  value: string;
  seller: string;
  invoiceNo: string;
  department: string;
  warrantyTill: string;
  remarks: string;
};

type AddAssetModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => void;
  employees: { id: string; name: string }[];
};

// ============================
// Constants
// ============================
const CATEGORIES = [
  "Computer",
  "Laptop",
  "Mobile",
  "Monitor",
  "Charger",
  "Accessory",
  "Furniture",
  "Appliance",
  "Other",
];

const DEPARTMENTS = [
  "SALES",
  "HR-HIRING",
  "A/C & MIS",
  "TELE-COMM.",
  "GRAPHICS",
  "IT",
  "ACCOUNTS",
  "OTHER",
];

const defaultForm: AssetFormData = {
  name: "",
  category: "",
  serial: "",
  status: "available",
  assignedTo: "",
  purchaseDate: "",
  value: "",
  seller: "",
  invoiceNo: "",
  department: "",
  warrantyTill: "",
  remarks: "",
};

const REQUIRED_FIELDS: (keyof AssetFormData)[] = [
  "name",
  "category",
  "purchaseDate",
  "value",
];

// ============================
// F — Field Wrapper (same as StepEmployment)
// ============================
const F = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className={error ? "border border-red-500 rounded-md" : ""}>
      {children}
    </div>
    {error && <p className="text-xs text-red-500">This field is required</p>}
  </div>
);

// ============================
// SectionHeading (same as StepEmployment)
// ============================
const SectionHeading = ({
  icon: Icon,
  title,
  color = "text-gray-700",
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    <Icon className={`w-5 h-5 ${color}`} />
    <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
  </div>
);

// ============================
// Main Modal Component
// ============================
export default function AddAssetModal({
  open,
  onClose,
  onSubmit,
  employees,
}: AddAssetModalProps) {
  const [form, setForm] = useState<AssetFormData>(defaultForm);
  const [showErrors, setShowErrors] = useState(false);

  // Compute errors (same pattern as StepEmployment)
  const errors: Record<string, boolean> = {};
  REQUIRED_FIELDS.forEach((field) => {
    const value = form[field];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors[field] = true;
    }
  });
  if (form.status === "assigned" && !form.assignedTo) {
    errors.assignedTo = true;
  }

  const hasErrors = Object.keys(errors).length > 0;

  const set = <K extends keyof AssetFormData>(
    key: K,
    value: AssetFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setShowErrors(true);
    if (hasErrors) return;
    onSubmit(form);
    setForm(defaultForm);
    setShowErrors(false);
    onClose();
  };

  const handleClose = () => {
    setForm(defaultForm);
    setShowErrors(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Upload size={18} className="text-purple-600" />
            Add New Asset
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* ── Section 1: Asset Details ── */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <SectionHeading
              icon={Package}
              title="Asset Details"
              color="text-purple-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F
                label="Asset Name / Description"
                required
                error={showErrors && errors.name}
              >
                <Input
                  placeholder="e.g. HP- CPU & Monitor | KB + Mouse"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </F>

              <F
                label="Category / Type"
                required
                error={showErrors && errors.category}
              >
                <Select
                  value={form.category}
                  onValueChange={(v) => set("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>

              <F label="Serial / UC Tag No.">
                <Input
                  placeholder="e.g. 1H, 2H, 16R"
                  value={form.serial}
                  onChange={(e) => set("serial", e.target.value)}
                />
              </F>

              <F label="Status" required>
                <Select
                  value={form.status}
                  onValueChange={(v) => {
                    set("status", v as AssetStatus);
                    if (v !== "assigned") set("assignedTo", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </F>

              <F label="Remarks">
                <Input
                  placeholder="e.g. CPU Tag is 7H"
                  value={form.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                />
              </F>
            </div>
          </div>

          {/* ── Section 2: Location ── */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <SectionHeading
              icon={MapPin}
              title="Location"
              color="text-purple-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Department">
                <Select
                  value={form.department}
                  onValueChange={(v) => set("department", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>

              <F
                label="Assigned To (Name)"
                required={form.status === "assigned"}
                error={showErrors && !!errors.assignedTo}
              >
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) => set("assignedTo", v)}
                  disabled={form.status !== "assigned"}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.status !== "assigned"
                          ? "Not assigned"
                          : "Select employee"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>
            </div>
          </div>

          {/* ── Section 3: Purchase Details ── */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <SectionHeading
              icon={ShoppingCart}
              title="Purchase Details"
              color="text-purple-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F
                label="Purchase Date"
                required
                error={showErrors && errors.purchaseDate}
              >
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => set("purchaseDate", e.target.value)}
                />
              </F>

              <F label="Seller">
                <Input
                  placeholder="Seller name"
                  value={form.seller}
                  onChange={(e) => set("seller", e.target.value)}
                />
              </F>

              <F
                label="Price / Current Value (₹)"
                required
                error={showErrors && errors.value}
              >
                <Input
                  type="number"
                  placeholder="e.g. 45000"
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                />
              </F>

              <F label="Invoice No.">
                <Input
                  placeholder="Invoice number"
                  value={form.invoiceNo}
                  onChange={(e) => set("invoiceNo", e.target.value)}
                />
              </F>

              <F label="Warranty Till">
                <Input
                  type="date"
                  value={form.warrantyTill}
                  onChange={(e) => set("warrantyTill", e.target.value)}
                />
              </F>
            </div>
          </div>

          {/* ── Errors Summary (same as StepEmployment) ── */}
          {showErrors && hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Please fill in all required fields:
              </h4>
              <ul className="list-disc list-inside text-xs text-red-600">
                {Object.keys(errors).map((field) => (
                  <li key={field}>{field.replace(/_/g, " ")} is required</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Asset</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
