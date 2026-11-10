import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { uploadToCloudinary } from "@/utils/cloudinaryUpload";

import { Upload, CheckCircle, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addPolicy } from "@/redux/features/policy/policySlice";
import { useAppDispatch } from "@/hooks/useRedux";

interface Props {
  onClose: () => void;
}

const allowedCategories = [
  "1. Organisation Structure",
  "2. Work Place Policy",
  "3. Leave & Attendance Policy",
  "4. Joining & Probation Policy",
  "4. Salary, Incentive, Promotion & Retention Policy",
  "4. Separation Policy",
  "5. IT Policy",
  "6. Travel Policy",
  "7. POSH Policy",
];

export default function UploadPolicyForm({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1.0");
  const [category, setCategory] = useState(allowedCategories[0]);
  const [policy1, setPolicy1] = useState("");

  const [description, setDescription] = useState("");

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload File
  const handleUpload = async (file: File) => {
    let toastId: string | number | undefined;

    try {
      setUploading(true);
      toastId = toast.loading(`Uploading ${file.name}...`);

      const url = await uploadToCloudinary(file); // FIX

      setFileUrl(url);
      setFileName(file.name);

      toast.success("File uploaded successfully", { id: toastId });
    } catch (error) {
      toast.error("File upload failed", { id: toastId });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Remove file
  const handleRemove = () => {
    setFileUrl(null);
    setFileName(null);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!title || !description || !fileUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        addPolicy({
          title,
          version,
          category: category as any,
          policy1,

          description,
          fileUrl,
          status: "pending",
        } as any),
      ).unwrap();

      toast.success("Policy uploaded successfully");

      onClose();
    } catch (error) {
      toast.error("Policy upload failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Upload New Policy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Policy Title *</Label>
            <Input
              placeholder="Employee Code of Conduct"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Version + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Version</Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {allowedCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Policy 1 + Policy 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Policy 1</Label>
              <Input
                placeholder="Enter policy 1"
                value={policy1}
                onChange={(e) => setPolicy1(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>

            <Textarea
              placeholder="Write policy description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Policy Document *</Label>

            <div
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                fileUrl
                  ? "border-green-500 bg-green-50"
                  : "border-dashed border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {uploading ? (
                  <Loader2 className="animate-spin text-blue-500" />
                ) : fileUrl ? (
                  <CheckCircle className="text-green-600" />
                ) : (
                  <FileText className="text-gray-400" />
                )}

                <div>
                  {fileName ? (
                    <p className="text-sm">{fileName}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Upload PDF (Max 10MB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileUrl && (
                  <button
                    onClick={handleRemove}
                    className="text-red-500 hover:bg-red-100 p-1 rounded"
                  >
                    <X size={16} />
                  </button>
                )}

                {!fileUrl && (
                  <label className="cursor-pointer">
                    <span className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-100">
                      {uploading ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Uploading
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          Upload
                        </>
                      )}
                    </span>

                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("File must be less than 10MB");
                          return;
                        }

                        if (file.type !== "application/pdf") {
                          toast.error("Only PDF allowed");
                          return;
                        }

                        handleUpload(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className="flex gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading || uploading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading || uploading || !fileUrl}
              className="bg-green-500 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Uploading Policy...
                </>
              ) : (
                "Upload Policy"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
