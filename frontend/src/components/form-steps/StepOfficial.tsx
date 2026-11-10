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
const F = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium ">{label}</Label>
    {children}
  </div>
);
const WorkShift = ["Morning", "Evening", "Night", "Rotational"];

export function StepOfficial({ data, onChange }: StepProps) {
  return (
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
  );
}
