import {
  CheckCircle,
  Clock,
  XCircle,
  FileEdit,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

const config = {
  approved: {
    label: "Approved",
    className: "badge-approved",
    Icon: CheckCircle,
  },

  pending: {
    label: "Pending",
    className: "badge-pending",
    Icon: Clock,
  },

  rejected: {
    label: "Rejected",
    className: "badge-rejected",
    Icon: XCircle,
  },

  draft: {
    label: "Draft",
    className: "badge-draft",
    Icon: FileEdit,
  },

  resubmitted: {
    label: "Re-Submitted",
    className: "badge-resubmitted",
    Icon: RefreshCw,
  },

  verified: {
    label: "Verified",
    className: "badge-approved",
    Icon: ShieldCheck,
  },

  failed: {
    label: "Failed",
    className: "badge-rejected",
    Icon: ShieldX,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase();

  const { label, className, Icon } =
    config[normalizedStatus as keyof typeof config] ?? config.draft;

  return (
    <span className={className}>
      <Icon size={11} />
      {label}
    </span>
  );
}
