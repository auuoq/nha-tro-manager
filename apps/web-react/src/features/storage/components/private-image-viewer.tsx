import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ShieldCheck, Eye, RefreshCw, Trash2 } from "lucide-react";

export interface PrivateImageViewerProps {
  title: string;
  fetchSignedUrl: () => Promise<string>;
  onDelete?: () => Promise<void>;
}

export const PrivateImageViewer: React.FC<PrivateImageViewerProps> = ({
  title,
  fetchSignedUrl,
  onDelete,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSignedUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await fetchSignedUrl();
      setSignedUrl(url);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể lấy liên kết xem ảnh bảo mật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F7F4] p-4 rounded-xl border border-[#E8E5DF] space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#252724] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#3F594F]" /> {title}
        </span>
        <div className="flex items-center gap-1">
          {!signedUrl ? (
            <Button variant="outline" size="sm" onClick={handleLoadSignedUrl} disabled={loading}>
              <Eye className="w-3.5 h-3.5" /> Xem Ảnh Bảo Mật
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleLoadSignedUrl} disabled={loading} title="Làm mới Signed URL">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#A84646] p-1.5"
              onClick={async () => {
                if (confirm("Xóa ảnh bảo mật này?")) {
                  await onDelete();
                  setSignedUrl(null);
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {loading && <Skeleton className="h-48 w-full rounded-xl" />}

      {error && <p className="text-[#A84646] italic">{error}</p>}

      {signedUrl && !loading && (
        <div className="relative rounded-xl overflow-hidden border border-[#E8E5DF] max-h-64 bg-white p-2 flex items-center justify-center">
          <img src={signedUrl} alt={title} className="max-h-60 object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
};
