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

/* Reusable Field Component With Red Star */
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
      <Label className="text-sm font-medium text-black">
        {cleanLabel}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
};

export function StepFamily({ data, onChange }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="border rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* ===== FATHER ===== */}
          <F label="Father Name *">
            <Input
              value={data.fatherName || ""}
              onChange={(e) => onChange({ fatherName: e.target.value })}
              placeholder="Father's full name"
            />
          </F>

          <F label="Relation *">
            <Input value="Father" disabled />
          </F>

          <F label="Contact Number *">
            <Input
              value={data.fatherContact || ""}
              maxLength={10}
              onChange={(e) =>
                onChange({
                  fatherContact: e.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="9876543210"
            />
          </F>

          <F label="Occupation *">
            <Input
              value={data.fatherOccupation || ""}
              onChange={(e) => onChange({ fatherOccupation: e.target.value })}
              placeholder="Business / Service"
            />
          </F>

          {/* ===== MOTHER ===== */}
          <F label="Mother Name *">
            <Input
              value={data.motherName || ""}
              onChange={(e) => onChange({ motherName: e.target.value })}
              placeholder="Mother's full name"
            />
          </F>

          <F label="Relation *">
            <Input value="Mother" disabled />
          </F>

          <F label="Contact Number *">
            <Input
              value={data.motherContact || ""}
              maxLength={10}
              onChange={(e) =>
                onChange({
                  motherContact: e.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="9876543210"
            />
          </F>

          <F label="Occupation *">
            <Input
              value={data.motherOccupation || ""}
              onChange={(e) => onChange({ motherOccupation: e.target.value })}
              placeholder="Homemaker / Service"
            />
          </F>

          {/* ===== SPOUSE ===== */}
          <F label="Spouse Name ">
            <Input
              value={data.spouseName || ""}
              onChange={(e) => onChange({ spouseName: e.target.value })}
              placeholder="Spouse full name"
            />
          </F>

          <F label="Relation ">
            <Select
              value={data.spouseRelation || ""}
              onValueChange={(v) => onChange({ spouseRelation: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Husband">Husband</SelectItem>
                <SelectItem value="Wife">Wife</SelectItem>
              </SelectContent>
            </Select>
          </F>

          <F label="Contact Number ">
            <Input
              value={data.spouseContact || ""}
              maxLength={10}
              onChange={(e) =>
                onChange({
                  spouseContact: e.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="9876543210"
            />
          </F>

          <F label="Occupation ">
            <Input
              value={data.spouseOccupation || ""}
              onChange={(e) => onChange({ spouseOccupation: e.target.value })}
              placeholder="Profession"
            />
          </F>

          {/* ===== SIBLING (Previously Nominee) ===== */}
          <F label="Sibling Name *">
            <Input
              value={data.siblingName || ""}
              onChange={(e) => onChange({ siblingName: e.target.value })}
              placeholder="Sibling full name"
            />
          </F>

          <F label="Relation *">
            <Select
              value={data.siblingRelation || ""}
              onValueChange={(v) => onChange({ siblingRelation: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brother">Brother</SelectItem>
                <SelectItem value="Sister">Sister</SelectItem>
              </SelectContent>
            </Select>
          </F>

          <F label="Contact Number *">
            <Input
              value={data.siblingContact || ""}
              maxLength={10}
              onChange={(e) =>
                onChange({
                  siblingContact: e.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="9876543210"
            />
          </F>

          <F label="Occupation *">
            <Input
              value={data.siblingOccupation || ""}
              onChange={(e) => onChange({ siblingOccupation: e.target.value })}
              placeholder="Profession"
            />
          </F>
        </div>
      </div>
    </div>
  );
}
