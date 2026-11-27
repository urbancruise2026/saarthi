import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const VIDEO_SRC =
  "https://www.youtube.com/embed/yrUUVpiBL_Y?si=-ulSeKFtx5JKNnmn";

export default function MapVideoModal({ open, onClose }: Props) {
  // Esc dabane par band
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-green-600 px-5 py-3 text-white">
          <h3 className="text-lg font-extrabold">Google Maps - Video</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="aspect-video w-full bg-black">
          {/* open hone par hi iframe mount hoga, close par video band ho jayega */}
          <iframe
            className="h-full w-full"
            src={VIDEO_SRC}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
