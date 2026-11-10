import { Employee } from "@/types";

interface Props {
  employee: Employee;
}

export default function ConfirmationLetterPreview({ employee }: Props) {
  return (
    <>
      <p>Dear {employee.firstName} {employee.lastName},</p>
      <p>
        We are pleased to confirm your employment with HRMS Enterprise Suite as{" "}
        <strong>{employee.designation}</strong> in the{" "}
        <strong>{employee.department}</strong> department, effective from{" "}
        <strong>{employee.joiningDate}</strong>.
      </p>
      <p>
        After a satisfactory review of your performance during the probation
        period, your services are hereby confirmed. All terms and conditions as
        communicated in your original offer letter shall continue to apply.
      </p>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <tbody>
          {[
            ["Employee ID",      employee.employeeId],
            ["Designation",      employee.designation],
            ["Department",       employee.department],
            ["Date of Joining",  employee.joiningDate],
            ["Employment Type",  employee.employmentType],
            ["Work Location",    employee.workLocation || employee.officeLocation],
          ].map(([l, v], i) => (
            <tr key={l} className={i % 2 === 0 ? "bg-muted/30" : ""}>
              <td className="px-3 py-2 font-medium text-muted-foreground w-40">{l}</td>
              <td className="px-3 py-2 text-foreground">{v || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        We appreciate your dedication and look forward to your continued
        contributions. Congratulations!
      </p>
    </>
  );
}