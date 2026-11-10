import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { InlineLoader } from "./Loading";
 

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const PasswordInput = ({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={error ? "border-red-500 pr-10" : "pr-10"}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await axiosInstance.post("user/change-password", {
        newPassword,
        confirmPassword,
      });

      const result = res.data;
      toast.success(result.message || "Password updated successfully");
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            Change Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* New Password */}
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              setErrors((p) => ({ ...p, newPassword: "" }));
            }}
            placeholder="Enter new password (min 6 characters)"
            error={errors.newPassword}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setErrors((p) => ({ ...p, confirmPassword: "" }));
            }}
            placeholder="Re-enter new password"
            error={errors.confirmPassword}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              <InlineLoader size="sm" color="white" />
            ) : (
              "Update Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
