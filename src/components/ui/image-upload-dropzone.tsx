"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, RefreshCw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploadDropzoneProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  previewUrl?: string | null;
  filename?: string | null;
  onFileSelect: (file: File | null, base64?: string) => void;
  className?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  label = "Upload Ảnh Bằng Chứng Chốt Đồng Hồ",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  previewUrl: initialPreviewUrl = null,
  filename: initialFilename = null,
  onFileSelect,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(initialPreviewUrl);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(initialFilename);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Kích thước file vượt quá ${maxSizeMB}MB`);
      return;
    }

    setSelectedFilename(file.name);
    setFileSizeStr(formatBytes(file.size));

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setLocalPreview(resultStr);
      const base64 = resultStr.split(",")[1];
      onFileSelect(file, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    setSelectedFilename(null);
    setFileSizeStr(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="block text-xs font-semibold text-[#252724]">{label}</label>}

      {error && (
        <div className="p-2 text-xs font-medium text-[#A84646] bg-[#FDF0F0] border border-[#F5D5D5] rounded-xl">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {localPreview ? (
        /* Selected State Preview */
        <div className="relative rounded-2xl border border-[#E8E5DF] bg-[#F8F7F4] p-3 flex items-center gap-3 shadow-2xs group">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#EBF0ED] border border-[#D1E3D5] shrink-0 relative flex items-center justify-center">
            <img src={localPreview} alt="Preview" className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#252724] truncate">
              <ImageIcon className="w-3.5 h-3.5 text-[#3F594F] shrink-0" />
              <span className="truncate">{selectedFilename || "Ảnh bằng chứng đồng hồ"}</span>
            </div>
            {fileSizeStr && <p className="text-[10px] text-[#73766F] font-mono">{fileSizeStr}</p>}
            <p className="text-[10px] text-[#3E6148] font-medium flex items-center gap-1">
              ✓ Đã tải ảnh lên thành công
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl text-[#73766F] hover:text-[#3F594F] hover:bg-white border border-transparent hover:border-[#E8E5DF] transition-all cursor-pointer"
              title="Đổi ảnh khác"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-xl text-[#A84646] hover:bg-[#FDF0F0] border border-transparent hover:border-[#F5D5D5] transition-all cursor-pointer"
              title="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center gap-2",
            dragActive
              ? "border-[#3F594F] bg-[#EBF0ED]/60 scale-[0.99]"
              : "border-[#C8B8A8]/60 bg-[#F8F7F4] hover:border-[#3F594F] hover:bg-[#F2EFE9]"
          )}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EBF0ED] border border-[#D1E3D5] text-[#3F594F] flex items-center justify-center transition-transform group-hover:scale-105">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[#252724]">
              <span className="text-[#3F594F] underline underline-offset-2">Bấm để chọn ảnh</span> hoặc kéo thả vào đây
            </p>
            <p className="text-[11px] text-[#A3A69F]">
              Định dạng PNG, JPG, WebP (Tối đa {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
