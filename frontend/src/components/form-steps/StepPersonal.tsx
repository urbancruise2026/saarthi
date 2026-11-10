import React, { useState } from "react";
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

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

/* Reusable Field Component */
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

export function StepPersonal({ data, onChange }: StepProps) {
  const [dobError, setDobError] = useState(false);

  const maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18),
  )
    .toISOString()
    .split("T")[0];

  const handleDobChange = (value: string) => {
    const selectedDate = new Date(value);
    const today = new Date();

    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < selectedDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setDobError(true);
      return; // ❌ Do not save
    }

    setDobError(false);
    onChange({ dateOfBirth: value });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="First Name *">
        <Input
          value={data.firstName || ""}
          onChange={(e) => onChange({ firstName: e.target.value })}
          placeholder="Enter First Name"
          maxLength={15}
        />
      </F>

      <F label="Middle Name">
        <Input
          value={data.middleName || ""}
          onChange={(e) => onChange({ middleName: e.target.value })}
          placeholder="Enter Middle Name"
          maxLength={15}
        />
      </F>

      <F label="Last Name *">
        <Input
          value={data.lastName || ""}
          onChange={(e) => onChange({ lastName: e.target.value })}
          placeholder="Enter Last Name"
          maxLength={15}
        />
      </F>

      <F label="Date of Birth *">
        <Input
          type="date"
          value={data.dateOfBirth || ""}
          max={maxDate}
          className={
            dobError ? "border-red-500 focus-visible:ring-red-500" : ""
          }
          onChange={(e) => handleDobChange(e.target.value)}
        />
        {dobError && (
          <p className="text-xs text-red-500 mt-1">
            Employee must be 18 years or older
          </p>
        )}
      </F>

      <F label="Gender *">
        <Select
          value={data.gender || ""}
          onValueChange={(v) => onChange({ gender: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </F>

      <F label="Marital Status *">
        <Select
          value={data.maritalStatus || ""}
          onValueChange={(v) => onChange({ maritalStatus: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Married">Married</SelectItem>
            <SelectItem value="Divorced">Divorced</SelectItem>
            <SelectItem value="Widowed">Widowed</SelectItem>
          </SelectContent>
        </Select>
      </F>

      <F label="Blood Group *">
        <Select
          value={data.bloodGroup ?? undefined}
          onValueChange={(v) => onChange({ bloodGroup: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
          </SelectContent>
        </Select>
      </F>
    </div>
  );
}
