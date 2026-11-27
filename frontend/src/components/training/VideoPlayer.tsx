import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { playableVideoUrl, videoPoster } from "./utils";

export default function VideoPlayer({ url }: { url: string }) {
  const [src, setSrc] = useState(url);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    const fallback = playableVideoUrl(url);
    // Pehle original fail hua -> converted MP4 try karo, wo bhi fail to error dikhao
    if (src !== fallback) setSrc(fallback);
    else setFailed(true);
  };

  if (failed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-slate-900 px-4 text-center text-white">
        <AlertTriangle size={28} className="text-amber-400" />
        <p className="text-sm font-semibold">Video play nahi ho paayi.</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-sky-300 underline"
        >
          Naye tab me kholein
        </a>
      </div>
    );
  }

  return (
    <video
      key={src}
      src={src}
      poster={videoPoster(url)}
      controls
      playsInline
      preload="metadata"
      onError={handleError}
      className="aspect-video w-full bg-black"
    />
  );
}
