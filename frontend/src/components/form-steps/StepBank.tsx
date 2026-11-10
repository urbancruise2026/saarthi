import { Employee } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Landmark,
  Upload,
  X,
  CheckCircle,
  FileText,
} from "lucide-react";

import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import { toast } from "sonner";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

const MAX_IMAGE_SIZE = 100 * 1024;

// Section Heading
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

// Reusable Field
const F = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "");

  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-black font-bold">
        {cleanLabel}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
};

const AccountTypes = ["Savings", "Current", "Salary"];

export function StepBank({ data, onChange }: StepProps) {
  const handleQrUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 100KB");
      return;
    }

    let loadingId: string | number | undefined;

    try {
      loadingId = toast.loading("Uploading QR Code...");

      const url = await uploadToCloudinary(file);

      onChange({ qrCodeUploaded: url });

      toast.success("QR Code uploaded successfully");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      if (loadingId) toast.dismiss(loadingId);
    }
  };

  const removeQr = () => {
    onChange({ qrCodeUploaded: undefined });
    toast.success("QR removed");
  };

  return (
    <div className="space-y-8">
      {/* ===== BANK DETAILS ===== */}

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Landmark}
          title="Bank Account Details"
          color="text-green-600"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Bank Name *">
            <Input
              value={data.bankName || ""}
              onChange={(e) => onChange({ bankName: e.target.value })}
              placeholder="HDFC Bank"
            />
          </F>

          <F label="Account Holder Name *">
            <Input
              value={data.accountHolderName || ""}
              onChange={(e) => onChange({ accountHolderName: e.target.value })}
              placeholder="Full name as on account"
            />
          </F>

          <F label="Account Number *">
            <Input
              value={data.accountNumber || ""}
              onChange={(e) =>
                onChange({
                  accountNumber: e.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="50100123456789"
            />
          </F>

          <F label="IFSC Code *">
            <Input
              value={data.ifscCode || ""}
              onChange={(e) =>
                onChange({ ifscCode: e.target.value.toUpperCase() })
              }
              placeholder="HDFC0001234"
            />
          </F>

          <F label="Branch Name *">
            <Input
              value={data.branch || ""}
              onChange={(e) => onChange({ branch: e.target.value })}
              placeholder="Koramangala Branch"
            />
          </F>

          <F label="Account Type *">
            <Select
              value={data.accountType || ""}
              onValueChange={(v) => onChange({ accountType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Account Type" />
              </SelectTrigger>
              <SelectContent>
                {AccountTypes.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {/* ===== UPI ID ===== */}

          <F label="UPI ID *">
            <Input
              value={data.upiId || ""}
              onChange={(e) => onChange({ upiId: e.target.value })}
              placeholder="Enter UPI ID"
            />
          </F>

          {/* ===== QR CODE UPLOAD ===== */}

          <F label="QR Code Upload *">
            <div
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                data.qrCodeUploaded
                  ? "border-green-500 bg-green-50"
                  : "border-dashed border-gray-300 hover:border-blue-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {data.qrCodeUploaded ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <FileText size={20} className="text-gray-400" />
                )}

                <div>
                  {data.qrCodeUploaded ? (
                    <p className="text-xs text-gray-500">Uploaded</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Upload personal QR code (Image max 100KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {data.qrCodeUploaded && (
                  <button
                    onClick={removeQr}
                    className="text-red-500 hover:bg-red-100 p-1 rounded"
                  >
                    <X size={14} />
                  </button>
                )}

                <label className="cursor-pointer">
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${
                      data.qrCodeUploaded
                        ? "text-green-600"
                        : "text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {data.qrCodeUploaded ? (
                      "Replace"
                    ) : (
                      <>
                        <Upload size={12} /> Upload
                      </>
                    )}
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleQrUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </F>
        </div>
      </div>

      {/* ===== STATUTORY DETAILS ===== */}

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SectionHeading
          icon={Shield}
          title="Statutory Details"
          color="text-green-600"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <F label="PF Number">
            <Input
              value={data.pfNumber || ""}
              onChange={(e) => onChange({ pfNumber: e.target.value })}
              placeholder="Enter PF Number"
            />
          </F>

          <F label="ESIC Number">
            <Input
              value={data.esicNumber || ""}
              onChange={(e) => onChange({ esicNumber: e.target.value })}
              placeholder="Enter ESIC Number"
            />
          </F>

          <F label="UAN Number">
            <Input
              value={data.uanNumber || ""}
              onChange={(e) => onChange({ uanNumber: e.target.value })}
              placeholder="Enter UAN Number"
            />
          </F>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Shield size={12} className="text-gray-400" />
            PF, ESIC, and UAN numbers are used for statutory compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
