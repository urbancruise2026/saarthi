import React, { useState, useEffect } from "react";
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
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import { FileText, Upload, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useAppSelector } from "@/hooks/useRedux";
import {
  fetchAllCities,
  fetchStateByCity,
} from "@/redux/features/state/stateSlice";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

const MAX_IMAGE_SIZE = 100 * 1024;
const MAX_PDF_SIZE = 300 * 1024;

const F = ({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) => {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "");
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-sm font-medium text-black">
        {cleanLabel}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
};

// ─── Reusable Upload Card ────────────────────────────────────────────────────
function UploadCard({
  label,
  desc,
  accept,
  fileUrl,
  onUpload,
  onRemove,
}: {
  label: string;
  desc: string;
  accept: string;
  fileUrl?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all sm:col-span-2 ${
        fileUrl
          ? "border-green-500 bg-green-50"
          : "border-dashed border-gray-300 hover:border-blue-400"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {fileUrl ? (
          <CheckCircle size={20} className="text-green-600" />
        ) : (
          <FileText size={20} className="text-gray-400" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {label.replace("*", "")}
            {label.includes("*") && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </p>
          {fileUrl ? (
            <p className="text-xs text-green-600 font-medium">Uploaded ✓</p>
          ) : (
            <p className="text-xs text-gray-500">{desc}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {fileUrl && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:bg-red-100 p-1 rounded"
            title="Remove file"
          >
            <X size={14} />
          </button>
        )}
        <label className="cursor-pointer">
          <span
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${
              fileUrl ? "text-green-600" : "text-blue-600 hover:bg-blue-100"
            }`}
          >
            {fileUrl ? (
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
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

export function StepAddress({ data, onChange }: StepProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [sameAddress, setSameAddress] = useState(false);

  const { cities, permanentStates, currentStates } = useAppSelector(
    (state) => state.states,
  );

  useEffect(() => {
    dispatch(fetchAllCities());
  }, [dispatch]);

  const handlePermanentCityChange = (cityName: string) => {
    onChange({ permanentCity: cityName, permanentState: "" });
    dispatch(fetchStateByCity({ cityName, type: "permanent" }));
    if (sameAddress) {
      onChange({ currentCity: cityName, currentState: "" });
      dispatch(fetchStateByCity({ cityName, type: "current" }));
    }
  };

  const handleCurrentCityChange = (cityName: string) => {
    onChange({ currentCity: cityName, currentState: "" });
    dispatch(fetchStateByCity({ cityName, type: "current" }));
  };

  useEffect(() => {
    if (sameAddress && data.permanentCity) {
      onChange({
        currentAddress: data.permanentAddress,
        currentCity: data.permanentCity,
        currentState: data.permanentState,
        currentPincode: data.permanentPincode,
      });
      dispatch(
        fetchStateByCity({ cityName: data.permanentCity, type: "current" }),
      );
    }
  }, [
    sameAddress,
    data.permanentAddress,
    data.permanentCity,
    data.permanentState,
    data.permanentPincode,
  ]);

  // ─── Upload Handler ────────────────────────────────────────────────────
  const handleUpload = async (key: keyof Employee, file: File) => {
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPDF && !isImage) {
      toast.error("Only PDF and Image files allowed");
      return;
    }
    if (isPDF && file.size > MAX_PDF_SIZE) {
      toast.error("PDF must be under 300KB");
      return;
    }
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 100KB");
      return;
    }

    const loadingId = toast.loading("Uploading document...");
    try {
      const url = await uploadToCloudinary(file);
      onChange({ [key]: url } as Partial<Employee>);
      toast.success("File uploaded successfully");
    } catch {
      toast.error("Upload failed");
    } finally {
      toast.dismiss(loadingId);
    }
  };

  const handleRemove = (key: keyof Employee) => {
    onChange({ [key]: undefined } as Partial<Employee>);
    toast.success("File removed");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* ── Permanent Address ── */}
      <F label="Permanent Address *" full>
        <Input
          value={data.permanentAddress || ""}
          onChange={(e) => onChange({ permanentAddress: e.target.value })}
          placeholder="Enter Permanent Address"
        />
      </F>

      <F label="Permanent City *">
        <Select
          value={data.permanentCity || ""}
          onValueChange={handlePermanentCityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.cityName}>
                {city.cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </F>

      <F label="Permanent State *">
        <Select
          value={data.permanentState || ""}
          onValueChange={(v) => onChange({ permanentState: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {permanentStates.map((state) => (
              <SelectItem key={state.id} value={state.stateName}>
                {state.stateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </F>

      <F label="Permanent Pincode *">
        <Input
          value={data.permanentPincode || ""}
          maxLength={6}
          onChange={(e) =>
            onChange({ permanentPincode: e.target.value.replace(/\D/g, "") })
          }
          placeholder="Pincode"
        />
      </F>

      {/* ✅ Permanent Address Proof Upload */}
      <UploadCard
        label="Permanent Address Proof *"
        desc="Upload permanent address proof (Image/PDF max 300KB)"
        accept=".jpg,.jpeg,.png,.pdf"
        fileUrl={data.permanentAddressProofUploaded as string | undefined}
        onUpload={(file) => handleUpload("permanentAddressProofUploaded", file)}
        onRemove={() => handleRemove("permanentAddressProofUploaded")}
      />

      {/* ── Same Address Checkbox ── */}
      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          checked={sameAddress}
          onChange={(e) => {
            const checked = e.target.checked;
            setSameAddress(checked);
            if (!checked) {
              onChange({
                currentAddress: "",
                currentCity: "",
                currentState: "",
                currentPincode: "",
              });
            } else {
              onChange({
                currentAddress: data.permanentAddress,
                currentCity: data.permanentCity,
                currentState: data.permanentState,
                currentPincode: data.permanentPincode,
              });
              if (data.permanentCity) {
                dispatch(
                  fetchStateByCity({
                    cityName: data.permanentCity,
                    type: "current",
                  }),
                );
              }
            }
          }}
        />
        <Label>Current address same as Permanent</Label>
      </div>

      {/* ── Current Address ── */}
      <F label="Current Address *" full>
        <Input
          value={data.currentAddress || ""}
          disabled={sameAddress}
          onChange={(e) => onChange({ currentAddress: e.target.value })}
          placeholder="Enter Current Address"
        />
      </F>

      <F label="Current City *">
        <Select
          value={data.currentCity || ""}
          disabled={sameAddress}
          onValueChange={handleCurrentCityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.cityName}>
                {city.cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </F>

      <F label="Current State *">
        <Select
          value={data.currentState || ""}
          disabled={sameAddress}
          onValueChange={(v) => onChange({ currentState: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {currentStates.map((state) => (
              <SelectItem key={state.id} value={state.stateName}>
                {state.stateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </F>

      <F label="Current Pincode *">
        <Input
          value={data.currentPincode || ""}
          maxLength={6}
          disabled={sameAddress}
          onChange={(e) =>
            onChange({ currentPincode: e.target.value.replace(/\D/g, "") })
          }
          placeholder="Pincode"
        />
      </F>

      {/* ✅ Current Address Proof Upload */}
      <UploadCard
        label="Current Address Proof *"
        desc="Upload current address proof (Image/PDF max 300KB)"
        accept=".jpg,.jpeg,.png,.pdf"
        fileUrl={data.currentAddressProofUploaded as string | undefined}
        onUpload={(file) => handleUpload("currentAddressProofUploaded", file)}
        onRemove={() => handleRemove("currentAddressProofUploaded")}
      />
    </div>
  );
}
