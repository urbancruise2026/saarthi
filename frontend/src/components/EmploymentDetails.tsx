import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StepEmployment } from "@/components/form-steps/StepEmployment";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Employee } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchEmployeesThunk,
  updateEmployeeThunk,
  getEmployeeByIdThunk,
} from "@/redux/features/userSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: number | string;
}

export function EmploymentDetails({ open, onClose, employeeId }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.user);

  const [employmentData, setEmploymentData] = useState<Partial<Employee>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // ✅ Dynamic required fields based on HO selection
  const getRequiredFields = () => {
    const isHoSelected = !!employmentData.ho_id;

    return [
      "grade",
      "designation",
      "department_id",
      "hrManager",
      "joiningDate",
      "employmentType",
      "employeeStatus",
      "probationTenure",
      "noticePeriod",
      "workLocation",
      "branchOffice_id",
      
      "workShift",
      "shiftTiming",
      "weeklyoff",
      "ctc",
      "basicSalary",
      "username",
      "password",
      "shortName",
      "access_role",
      ...(isHoSelected ? ["ho_id"] : ["subDepartment_id", "role_id"]),
    ];
  };

  // ✅ Jab bhi modal khule ya employeeId badle — fresh data fetch karo
  useEffect(() => {
    if (open && employeeId) {
      setIsFetching(true);
      setShowErrors(false);

      dispatch(getEmployeeByIdThunk(employeeId))
        .unwrap()
        .then((data) => {
          setEmploymentData({ ...data });
        })
        .catch(() => {
          toast.error("Failed to load employee data");
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [open, employeeId, dispatch]);

  // ✅ Validation with dynamic required fields
  const validateForm = () => {
    const requiredFields = getRequiredFields();

    return !requiredFields.some((field) => {
      const value = employmentData[field as keyof typeof employmentData];

      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
      );
    });
  };

  const handleSave = async () => {
    setShowErrors(true);

    if (!validateForm()) {
      const dialogContent = document.querySelector('[role="dialog"]');
      if (dialogContent) dialogContent.scrollTop = 0;
      return;
    }

    if (!employeeId) {
      toast.error("Employee ID not found.");
      return;
    }

    // ✅ Payload clean-up for HO logic
    const updatePayload: Partial<Employee> = { ...employmentData };

    if (updatePayload.ho_id) {
      // HO selected => subDepartment & role remove/clear
      updatePayload.subDepartment_id = undefined;
      updatePayload.role_id = undefined;
      updatePayload.zoneName = undefined;
    }

    try {
      await dispatch(
        updateEmployeeThunk({
          userId: employeeId,
          updateData: updatePayload,
        }),
      ).unwrap();

      toast.success("Employee details updated successfully!");
      dispatch(fetchEmployeesThunk(1));
      setShowErrors(false);
      setEmploymentData({});
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to update employee");
    }
  };

  const handleCancel = () => {
    setShowErrors(false);
    setEmploymentData({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto
        [&>button]:h-9 [&>button]:w-9 [&>button]:border-2 
        [&>button]:flex [&>button]:justify-center [&>button]:items-center 
        [&>button]:rounded-md [&>button]:transition-all [&>button]:bg-red-600 [&>button]:text-white
        [&>button]:hover:bg-red-700"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Employment Details
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Please fill in all required fields marked with{" "}
            <span className="text-red-500">*</span>
          </p>
        </DialogHeader>

        <div className="mt-4">
          {/* ✅ Loading spinner jab fetch ho raha ho */}
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading employee data...</p>
            </div>
          ) : (
            <StepEmployment
              data={employmentData}
              showErrors={showErrors}
              onChange={(data: Partial<Employee>) =>
                setEmploymentData((prev) => ({ ...prev, ...data }))
              }
            />
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading || isFetching}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="px-6 bg-green-600 hover:bg-green-700 text-white"
            disabled={loading || isFetching}
          >
            {loading ? "Saving..." : "Save Employment Details"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
