"use client";

import React, { useState } from "react";
import { TenantDetailDTO } from "../types/tenant.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadTenantIdCardAction } from "../actions/upload-tenant-id-card.action";
import { getTenantIdCardSignedUrlAction } from "../actions/get-tenant-id-card-signed-url.action";

export interface TenantIdCardSectionProps {
  tenant: TenantDetailDTO;
  onSuccess: () => void;
}

export const TenantIdCardSection: React.FC<TenantIdCardSectionProps> = ({ tenant, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedFrontUrl, setSignedFrontUrl] = useState<string | null>(null);
  const [signedBackUrl, setSignedBackUrl] = useState<string | null>(null);

  const handleFileUpload = async (side: "FRONT" | "BACK", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const res = await uploadTenantIdCardAction(tenant.id, side, base64, file.name);
      setLoading(false);

      if (!res.success) {
        setError(res.error || "Upload ảnh thất bại");
        return;
      }

      onSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleViewImage = async (side: "FRONT" | "BACK") => {
    setLoading(true);
    const res = await getTenantIdCardSignedUrlAction(tenant.id, side);
    setLoading(false);

    if (res.success && res.data) {
      if (side === "FRONT") setSignedFrontUrl(res.data.url);
      else setSignedBackUrl(res.data.url);
    } else {
      alert(res.error);
    }
  };

  return (
    <Card title="Quản Lý Ảnh Căn Cước Công Dân (CCCD Private Storage)">
      <div className="space-y-4 text-xs">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mặt Trước */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
            <span className="font-bold text-slate-800 block">📷 Mặt Trước CCCD</span>
            {tenant.hasIdCardFront ? (
              <div className="space-y-2">
                {signedFrontUrl ? (
                  <img src={signedFrontUrl} alt="CCCD Mặt trước" className="w-full h-40 object-cover rounded border" />
                ) : (
                  <div className="h-32 bg-slate-200 rounded flex items-center justify-center text-slate-500 italic">
                    Ảnh đang lưu trữ bảo mật
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewImage("FRONT")} isLoading={loading}>
                    👁️ Xem Ảnh (HMAC Signed URL)
                  </Button>
                  <label className="cursor-pointer bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                    Thay Ảnh
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFileUpload("FRONT", e)} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block text-center border-2 border-dashed border-slate-300 p-6 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="text-slate-600 block font-medium">+ Upload Mặt Trước CCCD</span>
                <span className="text-[11px] text-slate-400">JPEG, PNG, WebP (Tối đa 5MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFileUpload("FRONT", e)} />
              </label>
            )}
          </div>

          {/* Mặt Sau */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
            <span className="font-bold text-slate-800 block">📷 Mặt Sau CCCD</span>
            {tenant.hasIdCardBack ? (
              <div className="space-y-2">
                {signedBackUrl ? (
                  <img src={signedBackUrl} alt="CCCD Mặt sau" className="w-full h-40 object-cover rounded border" />
                ) : (
                  <div className="h-32 bg-slate-200 rounded flex items-center justify-center text-slate-500 italic">
                    Ảnh đang lưu trữ bảo mật
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewImage("BACK")} isLoading={loading}>
                    👁️ Xem Ảnh (HMAC Signed URL)
                  </Button>
                  <label className="cursor-pointer bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                    Thay Ảnh
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFileUpload("BACK", e)} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block text-center border-2 border-dashed border-slate-300 p-6 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="text-slate-600 block font-medium">+ Upload Mặt Sau CCCD</span>
                <span className="text-[11px] text-slate-400">JPEG, PNG, WebP (Tối đa 5MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFileUpload("BACK", e)} />
              </label>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
