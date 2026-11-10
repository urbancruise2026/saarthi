import { Employee } from "@/types";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import { FileText, Upload, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface StepProps {
  data: Partial<Employee>;
  onChange: (d: Partial<Employee>) => void;
}

const MAX_PDF_SIZE = 300 * 1024;
const MAX_IMAGE_SIZE = 100 * 1024;

const docFields: Array<{
  key: keyof Employee;
  label: string;
  desc: string;
  accept: string;
}> = [
  {
    key: "aadhaarUploaded",
    label: "Aadhaar Card *",
    desc: "Upload front & back scan (PDF max 300KB)",
    accept: ".pdf",
  },
  {
    key: "panUploaded",
    label: "PAN Card *",
    desc: "Upload PAN card scan (PDF max 300KB)",
    accept: ".pdf",
  },
  {
    key: "passportPhotoUploaded",
    label: "Passport Photo *",
    desc: "Upload passport size photo (Image max 100KB)",
    accept: ".jpg,.jpeg,.png",
  },
  {
    key: "twelthCertificateUploaded",
    label: "12th Certificate *",
    desc: "Upload 12th marksheet (PDF max 300KB)",
    accept: ".pdf",
  },
  {
    key: "graduationCertificateUploaded",
    label: "Graduation Certificate *",
    desc: "Upload graduation degree (PDF max 300KB)",
    accept: ".pdf",
  },
  {
    key: "signatureUploaded",
    label: "Signature Upload *",
    desc: "Upload candidate signature (Image max 100KB)",
    accept: ".jpg,.jpeg,.png",
  },
  {
    key: "resumeUploaded",
    label: "Resume / CV *",
    desc: "Latest resume (PDF max 300KB)",
    accept: ".pdf",
  },
  // ✅ currentAddressProofUploaded hata diya — ab StepAddress mein hai
];

export function StepDocuments({ data, onChange }: StepProps) {
  const handleUpload = async (key: keyof Employee, file: File) => {
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPDF && !isImage) {
      toast.error("Only PDF and Image files allowed");
      return;
    }

    if (isPDF && file.size > MAX_PDF_SIZE) {
      toast.error("PDF must be under 300KB");
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 100KB");
      return;
    }

    let loadingId: string | number | undefined;

    try {
      loadingId = toast.loading("Uploading document...");
      const url = await uploadToCloudinary(file);
      onChange({ [key]: url } as Partial<Employee>);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    } finally {
      if (loadingId) toast.dismiss(loadingId);
    }
  };

  const handleRemove = (key: keyof Employee) => {
    onChange({ [key]: undefined } as Partial<Employee>);
    toast.success("File removed");
  };

  const allUploaded = docFields
    .filter((f) => f.label.includes("*"))
    .every((f) => !!data[f.key]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {docFields.map(({ key, label, desc, accept }) => {
        const fileUrl = data[key] as string | undefined;

        return (
          <div
            key={key}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              fileUrl
                ? "border-green-500 bg-green-50"
                : "border-dashed border-gray-300 hover:border-blue-400"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {fileUrl ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <FileText size={20} className="text-gray-400" />
              )}

              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {label.replace("*", "")}
                  {label.includes("*") && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </p>

                {fileUrl ? (
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    Uploaded
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">{desc}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {fileUrl && (
                <button
                  onClick={() => handleRemove(key)}
                  className="text-red-500 hover:bg-red-100 p-1 rounded"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              )}

              <label className="cursor-pointer">
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${
                    fileUrl
                      ? "text-green-600"
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {fileUrl ? (
                    "Replace"
                  ) : (
                    <>
                      <Upload size={12} /> Upload
                    </>
                  )}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(key, file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        );
      })}

      {allUploaded && (
        <div className="md:col-span-3 mt-2 p-3 rounded-lg bg-green-100 border border-green-300 text-sm text-green-700 font-medium flex items-center gap-2">
          <CheckCircle size={16} />
          All required documents uploaded — status will be set to "Submitted"
        </div>
      )}
    </div>
  );
}
