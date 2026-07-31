import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Upload, ShieldAlert, CheckCircle2 } from "lucide-react";

export interface PrivateImageUploadProps {
  label: string;
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export const PrivateImageUpload: React.FC<PrivateImageUploadProps> = ({
  label,
  onUpload,
  loading = false,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccess(false);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPEG, PNG, WebP only. No SVG!
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Chỉ hỗ trợ định dạng ảnh JPEG, PNG, WebP (STORAGE_FILE_INVALID)");
      return;
    }

    // Validate size: max 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg("Kích thước file vượt quá giới hạn 5 MB (STORAGE_FILE_TOO_LARGE)");
      return;
    }

    try {
      await onUpload(file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Tải ảnh riêng tư thất bại");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[#252724]">{label}</label>
      {errorMsg && (
        <div className="p-2 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {success && (
        <div className="p-2 bg-[#EBF3ED] border border-[#D6E6DA] text-[#3E6148] text-xs rounded-xl flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Tải ảnh bảo mật thành công!</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          <Button variant="outline" size="sm" type="button" disabled={loading} className="pointer-events-none">
            <Upload className="w-3.5 h-3.5" />
            <span>{loading ? "Đang tải..." : "Chọn Tệp Ảnh (Max 5MB)"}</span>
          </Button>
        </label>
      </div>
    </div>
  );
};
