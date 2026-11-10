import { Employee } from "@/types";

interface Props {
  employee: Employee;
  today: string;
}

export default function IncrementLetterPreview({ employee, today }: Props) {
  return (
    <>
      <p>Dear {employee.firstName} {employee.lastName},</p>
      <p>
        In recognition of your consistent performance and valuable contributions
        to the <strong>{employee.department}</strong> department, we are pleased
        to inform you about a revision in your compensation package, effective
        from <strong>{today}</strong>.
      </p>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <tbody>
          {[
            ["Employee ID",        employee.employeeId],
            ["Current Designation",employee.designation],
            ["Department",         employee.department],
            ["Effective Date",     today],
          ].map(([l, v], i) => (
            <tr key={l} className={i % 2 === 0 ? "bg-muted/30" : ""}>
              <td className="px-3 py-2 font-medium text-muted-foreground w-40">{l}</td>
              <td className="px-3 py-2 text-foreground">{v || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        The revised compensation reflects our appreciation of your hard work and
        commitment. All other terms remain unchanged. This letter is
        confidential.
      </p>
    </>
  );
}