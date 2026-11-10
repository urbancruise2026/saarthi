import { CheckCircle } from "lucide-react";

interface ApprovalPopupProps {
  open: boolean;
  employeeName?: string;
  onClose: () => void;
}

export function ApprovalPopup({
  open,
  employeeName,
  onClose,
}: ApprovalPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] text-center transform transition-all animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative mx-auto mb-4">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3 shadow-lg">
            <CheckCircle size={40} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Success!
        </h2>

        <div className="space-y-2">
          <p className="text-gray-600 text-base">Employee Approved</p>
          <p className="text-lg font-semibold text-gray-900 bg-gray-50 py-2 px-4 rounded-lg inline-block">
            {employeeName}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            has been approved successfully
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl 
                     hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98] 
                     transition-all duration-200 shadow-md hover:shadow-xl"
        >
          Close
        </button>

        <div className="absolute -top-2 -right-2 w-20 h-20 bg-green-100 rounded-full blur-2xl opacity-30 -z-10" />
        <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-emerald-100 rounded-full blur-2xl opacity-30 -z-10" />
      </div>
    </div>
  );
}
