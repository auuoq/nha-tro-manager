import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { metersApi } from "../api/meters.api";
import { CreateMeterReadingInput, ReplaceMeterInput } from "../types/meter.types";
import { MeterReadingDialog } from "../components/meter-reading-dialog";
import { MeterReplaceDialog } from "../components/meter-replace-dialog";
import { ArrowLeft, Zap, Droplet, Plus, RefreshCw, Calendar } from "lucide-react";

export const MeterDetailPage: React.FC = () => {
  const { meterId = "" } = useParams<{ meterId: string }>();
  const queryClient = useQueryClient();

  const [isReadingDialogOpen, setIsReadingDialogOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);

  const { data: meter, isLoading: isMeterLoading } = useQuery({
    queryKey: ["meter", meterId],
    queryFn: () => metersApi.getById(meterId),
    enabled: Boolean(meterId),
  });

  const { data: readings = [], isLoading: isReadingsLoading } = useQuery({
    queryKey: ["meter-readings", meterId],
    queryFn: () => metersApi.getReadings(meterId),
    enabled: Boolean(meterId),
  });

  const createReadingMutation = useMutation({
    mutationFn: (input: CreateMeterReadingInput) => metersApi.createReading(meterId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter", meterId] });
      queryClient.invalidateQueries({ queryKey: ["meter-readings", meterId] });
      setIsReadingDialogOpen(false);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "METER_READING_DUPLICATE_PERIOD") {
        setReadingError("Kỳ chốt sổ này đã tồn tại chỉ số đồng hồ!");
      } else if (code === "METER_READING_OUT_OF_ORDER") {
        setReadingError("Kỳ chốt không đúng thứ tự thời gian!");
      } else if (code === "METER_READING_VALUE_DECREASED") {
        setReadingError("Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ!");
      } else if (code === "METER_NOT_ACTIVE") {
        setReadingError("Đồng hồ đã ngừng hoạt động!");
      } else {
        setReadingError(err?.response?.data?.message || "Chốt chỉ số thất bại");
      }
    },
  });

  const replaceMutation = useMutation({
    mutationFn: (input: ReplaceMeterInput) => metersApi.replace(meterId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter", meterId] });
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setIsReplaceDialogOpen(false);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Thay thế đồng hồ thất bại");
    },
  });

  const handleCreateReading = async (input: CreateMeterReadingInput) => {
    setReadingError(null);
    await createReadingMutation.mutateAsync(input);
  };

  const handleReplaceMeter = async (input: ReplaceMeterInput) => {
    await replaceMutation.mutateAsync(input);
  };

  if (isMeterLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!meter) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Đồng hồ không tồn tại hoặc bạn không có quyền truy cập.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/meters" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách đồng hồ
        </Link>
      </div>

      <PageHeader
        title={`Đồng Hồ: ${meter.serialNumber}`}
        description={`Phòng ${meter.roomNumber || "-"} • ${meter.buildingName || "-"}`}
        action={
          <div className="flex gap-2">
            {meter.isActive && (
              <>
                <Button variant="outline" onClick={() => setIsReplaceDialogOpen(true)}>
                  <RefreshCw className="w-3.5 h-3.5" /> Thay Đồng Hồ Mới
                </Button>
                <Button variant="primary" onClick={() => { setReadingError(null); setIsReadingDialogOpen(true); }}>
                  <Plus className="w-3.5 h-3.5" /> Chốt Chỉ Số Kỳ Này
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Meter Info Card */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {meter.type === "ELECTRICITY" ? <Zap className="w-4 h-4 text-[#A36E35]" /> : <Droplet className="w-4 h-4 text-[#4D6779]" />}
                Thông Tin Thiết Bị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#73766F]">
              <div>
                <span className="font-semibold text-[#252724] block">Mã Serial:</span>
                <span className="font-mono font-bold text-[#252724]">{meter.serialNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Loại đồng hồ:</span>
                <span>{meter.type === "ELECTRICITY" ? "Công tơ điện (kWh)" : "Đồng hồ nước (m³)"}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Chỉ số ban đầu:</span>
                <span className="font-mono font-bold text-[#252724]">{meter.initialReading}</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Trạng thái:</span>
                <Badge variant={meter.isActive ? "success" : "neutral"} className="mt-0.5">
                  {meter.isActive ? "Đang hoạt động" : "Đã dỡ bỏ"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Readings History Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3F594F]" /> Lịch Sử Chốt Chỉ Số ({readings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isReadingsLoading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
              ) : readings.length === 0 ? (
                <p className="text-xs text-[#73766F] p-4 text-center">Chưa có chỉ số lịch sử nào được chốt cho đồng hồ này.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F7F4] text-[#73766F] uppercase font-semibold border-b border-[#E8E5DF]">
                      <tr>
                        <th className="px-3 py-2.5">Kỳ Sổ (YYYY-MM)</th>
                        <th className="px-3 py-2.5 text-right">Chỉ Số Cũ</th>
                        <th className="px-3 py-2.5 text-right">Chỉ Số Mới</th>
                        <th className="px-3 py-2.5 text-right">Tiêu Thụ</th>
                        <th className="px-3 py-2.5">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DF]">
                      {readings.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F8F7F4]/50">
                          <td className="px-3 py-3 font-mono font-bold text-[#252724]">{r.period}</td>
                          <td className="px-3 py-3 text-right font-mono">{r.previousValue}</td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-[#252724]">{r.currentValue}</td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-[#3F594F]">+{r.consumption}</td>
                          <td className="px-3 py-3 text-[#73766F]">{r.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MeterReadingDialog
        open={isReadingDialogOpen}
        onClose={() => setIsReadingDialogOpen(false)}
        onSubmit={handleCreateReading}
        meterType={meter.type}
        loading={createReadingMutation.isPending}
        error={readingError}
      />

      <MeterReplaceDialog
        open={isReplaceDialogOpen}
        onClose={() => setIsReplaceDialogOpen(false)}
        onSubmit={handleReplaceMeter}
        loading={replaceMutation.isPending}
      />
    </div>
  );
};
