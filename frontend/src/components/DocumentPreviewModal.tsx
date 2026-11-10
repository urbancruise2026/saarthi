import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Employee } from "@/types";
import { DocType, DOC_TYPE_LABELS } from "@/utils/documentGenerators";
import { format } from "date-fns";
import OfferLetterPreview from "./DocumentPreview/Offerletterpreview";
import ConfirmationLetterPreview from "./DocumentPreview/Confirmationletterpreview";
import IncrementLetterPreview from "./DocumentPreview/Incrementletterpreview";
import PromotionLetterPreview from "./DocumentPreview/Promotionletterpreview";
import RelievingLetterPreview from "./DocumentPreview/Relievingletterpreview";

// ── CDN loader (same as OfferLetterPreview) ───────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
async function ensureLibs() {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  );
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  );
}

// ── Build PDF from a DOM ref (same logic as OfferLetterPreview) ───────────────
async function buildPDF(domRef: React.RefObject<HTMLDivElement>) {
  await ensureLibs();
  const { jsPDF } = (window as any).jspdf;

  const canvas = await (window as any).html2canvas(domRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: domRef.current!.scrollWidth,
    windowHeight: domRef.current!.scrollHeight,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW_mm = pdf.internal.pageSize.getWidth();
  const pageH_mm = pdf.internal.pageSize.getHeight();
  const canvasW = canvas.width;
  const canvasH = canvas.height;
  const pageH_px = Math.floor((pageH_mm / pageW_mm) * canvasW);

  let yOffset = 0;
  while (yOffset < canvasH) {
    const sliceH = Math.min(pageH_px, canvasH - yOffset);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvasW;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext("2d")!;
    ctx.drawImage(canvas, 0, yOffset, canvasW, sliceH, 0, 0, canvasW, sliceH);
    const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
    const renderedH_mm = sliceH * (pageW_mm / canvasW);
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pageW_mm, renderedH_mm);
    yOffset += sliceH;
  }
  return pdf;
}

// ── REF prefix map ────────────────────────────────────────────────────────────
const REF_PREFIX: Record<DocType, string> = {
  "offer-letter": "OL",
  "confirmation-letter": "CL",
  "increment-letter": "IL",
  "promotion-letter": "PL",
  "relieving-letter": "RL",
};

// ── LetterBody ────────────────────────────────────────────────────────────────
function LetterBody({
  employee,
  docType,
  today,
}: {
  employee: Employee;
  docType: DocType;
  today: string;
}) {
  switch (docType) {
    case "offer-letter":
      return <OfferLetterPreview employee={employee} />;
    case "confirmation-letter":
      return <ConfirmationLetterPreview employee={employee} />;
    case "increment-letter":
      return <IncrementLetterPreview employee={employee} today={today} />;
    case "promotion-letter":
      return <PromotionLetterPreview employee={employee} today={today} />;
    case "relieving-letter":
      return <RelievingLetterPreview employee={employee} today={today} />;
  }
}

// ── LetterContent ─────────────────────────────────────────────────────────────
function LetterContent({
  employee,
  docType,
  captureRef,
}: {
  employee: Employee;
  docType: DocType;
  captureRef: React.RefObject<HTMLDivElement>;
}) {
  const today = format(new Date(), "dd MMMM yyyy");
  return (
    <div
      ref={captureRef}
      className="space-y-4 text-sm leading-relaxed text-foreground print:text-black bg-white"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground">
          {DOC_TYPE_LABELS[docType].toUpperCase()}
        </h3>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Ref: {REF_PREFIX[docType]}-{employee.employeeId}
        </span>
        <span>Date: {today}</span>
      </div>
      <div className="space-y-3">
        <LetterBody employee={employee} docType={docType} today={today} />
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  docType: DocType;
}

export default function DocumentPreviewModal({
  open,
  onClose,
  employee,
  docType,
}: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  if (!employee) return null;

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setLoading(true);
    try {
      const pdf = await buildPDF(captureRef);
      pdf.save(
        `${DOC_TYPE_LABELS[docType].replace(/\s+/g, "_")}_${employee.firstName}_${employee.lastName}.pdf`,
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {DOC_TYPE_LABELS[docType]} — {employee.firstName}{" "}
            {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        <LetterContent
          employee={employee}
          docType={docType}
          captureRef={captureRef}
        />

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="gap-2 bg-green-700 hover:bg-green-800 text-white"
          >
            <Download size={14} />
            {loading ? "Generating PDF…" : "Download PDF"}
          </Button>

          <Button onClick={onClose} variant="ghost" size="icon">
            <X size={16} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
