import { Employee } from "@/types";

interface Props {
  employee: Employee;
  today: string;
}

export default function RelievingLetterPreview({ employee, today }: Props) {
  return (
    <>
      <p>To Whomsoever It May Concern,</p>
      <p>
        This is to certify that{" "}
        <strong>
          {employee.firstName} {employee.lastName}
        </strong>{" "}
        (Employee ID: {employee.employeeId}) has been employed with HRMS
        Enterprise Suite as <strong>{employee.designation}</strong> in the{" "}
        <strong>{employee.department}</strong> Department from{" "}
        <strong>{employee.joiningDate}</strong> to <strong>{today}</strong>.
      </p>
      <p>
        {employee.firstName} has been relieved from{" "}
        {employee.employmentType === "Full-time"
          ? "full-time"
          : employee.employmentType.toLowerCase()}{" "}
        employment effective {today} as per mutual agreement.
      </p>
      <p>
        During the tenure, we found {employee.firstName} to be sincere,
        hardworking and a team player. We wish {employee.firstName} all the best
        in future endeavors.
      </p>
    </>
  );
}
