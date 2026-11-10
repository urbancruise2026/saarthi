import { Employee } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

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

export function StepContact({ data, onChange }: StepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <F label="Personal Email Address *">
        <Input
          type="email"
          value={data.personalEmail || ""}
          onChange={(e) => onChange({ personalEmail: e.target.value })}
          placeholder="john@example.com"
        />
      </F>

      <F label="Mobile Number *">
        <Input
          value={data.mobile || ""}
          maxLength={10}
          minLength={10}
          inputMode="numeric"
          onChange={(e) =>
            onChange({
              mobile: e.target.value.replace(/\D/g, ""),
            })
          }
          placeholder="Enter Mobile Number"
        />
      </F>

      <F label=" Local Guardian/Contact Name ">
        <Input
          value={data.localName || ""}
          onChange={(e) => onChange({ localName: e.target.value })}
          placeholder="Enter Local Name"
          maxLength={15}
        />
      </F>
      <F label=" Local Guardian/Contact Relation ">
        <Input
          value={data.localRelation || ""}
          onChange={(e) => onChange({ localRelation: e.target.value })}
          placeholder="Enter Last Name"
          maxLength={15}
        />
      </F>

      <F label="Local Guardian/Contact Number ">
        <Input
          value={data.alternateNumber || ""}
          maxLength={10}
          minLength={10}
          inputMode="numeric"
          onChange={(e) =>
            onChange({
              alternateNumber: e.target.value.replace(/\D/g, ""),
            })
          }
          placeholder="Enter Local Emergency Number"
        />
      </F>
    </div>
  );
}
