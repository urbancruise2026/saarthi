import { PlayCircle, Presentation } from "lucide-react";
import type { TrainingCategory } from "@/redux/features/TrainingModule/traininModuleApi";

export default function LeadFileButton({
  category,
  onClick,
}: {
  category: TrainingCategory;
  onClick: () => void;
}) {
  const isVideo = category === "lead_video";

  return (
    <button
      type="button"
      onClick={onClick}
      title={isVideo ? "Lead Video dekhein" : "Lead PPT dekhein"}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition ${
        isVideo
          ? "bg-blue-700 hover:bg-blue-800"
          : "bg-orange-500 hover:bg-orange-600"
      }`}
    >
      {isVideo ? <PlayCircle size={20} /> : <Presentation size={20} />}
      {isVideo ? " Video" : "Lead PPT"}
    </button>
  );
}
