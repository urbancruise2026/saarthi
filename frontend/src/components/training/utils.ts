import type { TrainingFileType } from "@/redux/features/TrainingModule/traininModuleApi";
import { PPT_EXT } from "./constants";

// File video hai ya ppt (dono nahi to null)
export const getFileType = (f: File): TrainingFileType | null =>
  f.type.startsWith("video/") ? "video" : PPT_EXT.test(f.name) ? "ppt" : null;

// PPT browser me seedha nahi chalta -> Office online viewer me kholte hain
export const officeViewerUrl = (url: string) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;

// Cloudinary URL ko download link banao
export const downloadUrl = (url: string) =>
  url.replace("/upload/", "/upload/fl_attachment/");

// ✅ NEW: .mov / .mkv / .avi / HEVC ko browser-friendly MP4 (H.264 + AAC) banao
export const playableVideoUrl = (url: string) =>
  url.includes("/upload/")
    ? url
        .replace("/upload/", "/upload/f_mp4,vc_h264,ac_aac/")
        .replace(/\.[a-z0-9]+(\?.*)?$/i, ".mp4")
    : url;

// ✅ NEW: Pehle frame ka thumbnail (taaki player black na dikhe)
export const videoPoster = (url: string) =>
  url.includes("/upload/")
    ? url
        .replace("/upload/", "/upload/so_0,f_jpg,w_640/")
        .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg")
    : undefined;

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getDayDate = (startDate: string | null, day: number): string => {
  if (!startDate) return "--";

  const [y, m, d] = startDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  if (date.getDay() === 0) date.setDate(date.getDate() + 1);

  let remaining = day - 1;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) remaining--; // 0 = Sunday
  }

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
