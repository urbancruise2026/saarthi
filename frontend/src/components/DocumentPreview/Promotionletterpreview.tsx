import { Employee } from "@/types";

interface Props {
  employee: Employee;
  today: string;
}

export default function PromotionLetterPreview({ employee, today }: Props) {
  return (
    <>
      <p>Dear {employee.firstName} {employee.lastName},</p>
      <p>
        We are delighted to inform you that based on your exemplary performance,
        you have been promoted within the{" "}
        <strong>{employee.department}</strong> department, effective{" "}
        <strong>{today}</strong>.
      </p>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <tbody>
          {[
            ["Employee ID",        employee.employeeId],
            ["Current Designation",employee.designation],
            ["Department",         employee.department],
            ["Effective Date",     today],
            ["Reporting Manager",  employee.reportingManager],
          ].map(([l, v], i) => (
            <tr key={l} className={i % 2 === 0 ? "bg-muted/30" : ""}>
              <td className="px-3 py-2 font-medium text-muted-foreground w-40">{l}</td>
              <td className="px-3 py-2 text-foreground">{v || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        This promotion is a testament to your dedication and leadership. Revised
        terms will be communicated separately. Congratulations!
      </p>
    </>
  );
}