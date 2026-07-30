"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BuildingListSection, BuildingFormDialog, BuildingItemDTO, getBuildingsAction, archiveBuildingAction } from "@/features/buildings";

export default function OwnerBuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchBuildings = async () => {
    setLoading(true);
    const res = await getBuildingsAction();
    if (res.success && res.data) {
      setBuildings(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleArchive = async (buildingId: string) => {
    if (confirm("Bạn có chắc chắn muốn lưu trữ tòa nhà này?")) {
      const res = await archiveBuildingAction(buildingId);
      if (res.success) fetchBuildings();
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Cơ Sở & Tòa Nhà Trọ"
        description="Danh sách các tòa nhà thuộc sở hữu của bạn và thiết lập đơn giá dịch vụ mặc định"
        action={<Button variant="primary" onClick={() => setIsDialogOpen(true)}>+ Thêm Tòa Nhà</Button>}
      />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          Đang tải danh sách tòa nhà...
        </div>
      ) : (
        <BuildingListSection buildings={buildings} onArchive={handleArchive} />
      )}

      <BuildingFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchBuildings}
      />
    </div>
  );
}
