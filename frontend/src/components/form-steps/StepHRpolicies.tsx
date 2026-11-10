import { Employee } from "@/types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

const HR_POLICY_TEXT = `1. Employee must follow company rules and code of conduct.
2. Notice period must be served as per company policy.
3. Confidential information must not be shared outside the company.
4. Leave policy and attendance policy must be followed strictly.
5. Any misconduct may lead to disciplinary action or termination.`;

const COMMITMENT_TEXT = `I hereby declare that I am joining with full commitment. I will not engage in any other employment, freelancing, or part-time job activities during my tenure. I also confirm that I have no immediate plans to pursue further education. Any violation of this declaration may lead to appropriate action by the company.`;

const INFORMATION_TEXT = `I hereby certify that the information provided above is correct to the best of my knowledge. I understand that any falsification of information may
 lead to strict action or termination after joining. I also give consent to contact my former employers for background verification.`;

/** Renders HR policy lines with line 2 bold + red */
function HRPolicyContent() {
  const lines = HR_POLICY_TEXT.split("\n");
  return (
    <div className="w-full leading-relaxed space-y-1">
      {lines.map((line, i) =>
        i === 1 ? (
          <p key={i}>
            <strong className="text-red-600">{line}</strong>
          </p>
        ) : (
          <p key={i}>{line}</p>
        ),
      )}
    </div>
  );
}

/** Renders commitment text with the employment line bold + red */
function CommitmentContent() {
  const HIGHLIGHTED =
    "I will not engage in any other employment, freelancing, or part-time job activities during my tenure.";

  const parts = COMMITMENT_TEXT.split(HIGHLIGHTED);

  return (
    <div className="w-full whitespace-pre-line leading-relaxed">
      {parts[0]}
      <strong className="text-red-600">{HIGHLIGHTED}</strong>
      {parts[1]}
    </div>
  );
}

export function StepHRpoliciest({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6 w-full">
      {/* HR POLICY */}

      <div className="border rounded-lg p-4 bg-muted/30 w-full">
        <h3 className="text-sm font-semibold mb-3">HR Policy Information</h3>

        <ScrollArea className="h-48 w-full rounded-md  p-4 text-md">
          <HRPolicyContent />
        </ScrollArea>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          checked={Boolean(data.hrPolicyAccepted)}
          onCheckedChange={(checked) =>
            onChange({
              hrPolicyAccepted: checked ? HR_POLICY_TEXT : "",
            })
          }
        />
        <Label className="text-sm">
          I agree abide by the HR Policy <span className="text-red-500">*</span>
        </Label>
      </div>

      {/* COMMITMENT */}

      <div className="border rounded-lg p-4 bg-muted/30 w-full">
        <h3 className="text-sm font-semibold mb-3">Commitment Declaration</h3>

        <ScrollArea className="h-30 w-full rounded-md p-4 text-md">
          <CommitmentContent />
        </ScrollArea>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          checked={Boolean(data.commitmentDeclarationAccepted)}
          onCheckedChange={(checked) =>
            onChange({
              commitmentDeclarationAccepted: checked ? COMMITMENT_TEXT : "",
            })
          }
        />
        <Label className="text-sm">
          I agree to the above Commitment Declaration{" "}
          <span className="text-red-500">*</span>
        </Label>
      </div>

      {/* INFORMATION */}

      <div className="border rounded-lg p-4 bg-muted/30 w-full">
        <h3 className="text-sm font-semibold mb-3">Information Declaration</h3>

        <ScrollArea className="h-30 w-full rounded-md  p-4 text-md">
          <div className="w-full whitespace-pre-line leading-relaxed">
            {INFORMATION_TEXT}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          checked={Boolean(data.informationDeclarationAccepted)}
          onCheckedChange={(checked) =>
            onChange({
              informationDeclarationAccepted: checked ? INFORMATION_TEXT : "",
            })
          }
        />
        <Label className="text-sm">
          I agree to the above Information Declaration{" "}
          <span className="text-red-500">*</span>
        </Label>
      </div>
    </div>
  );
}
