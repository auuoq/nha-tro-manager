"use client";

import React, { useEffect, useState, use } from "react";
import {
  BuildingDetailHeader,
  BuildingChargeConfigForm,
  BuildingFormDialog,
  BuildingDetailDTO,
  getBuildingDetailAction,
} from "@/features/buildings";

export default function BuildingDetailPage({ params }: { params: Promise<{ buildingId: string }> }) {
  const { buildingId } = use(params);
  const [building, setBuilding] = useState<BuildingDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await getBuildingDetailAction(buildingId);
    if (res.success && res.data) {
      setBuilding(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [buildingId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin chi tiết tòa nhà...</div>;
  }

  if (!building) {
    return <div className="p-8 text-center text-red-600 font-semibold">Tòa nhà không tồn tại hoặc bạn không có quyền truy cập.</div>;
  }

  return (
    <div className="space-y-6">
      <BuildingDetailHeader building={building} onEdit={() => setIsEditOpen(true)} />

      <BuildingChargeConfigForm
        buildingId={building.id}
        chargeConfigs={building.chargeConfigs}
        onSuccess={fetchDetail}
      />

      <BuildingFormDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchDetail}
        editBuilding={building}
      />
    </div>
  );
}
