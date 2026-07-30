"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ContractListSection, ContractFormDialog, ContractItemDTO, getContractsAction, OptionItem } from "@/features/contracts";
import { getRoomsAction } from "@/features/rooms";
import { getTenantsAction } from "@/features/tenants";

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<ContractItemDTO[]>([]);
  const [rooms, setRooms] = useState<OptionItem[]>([]);
  const [tenants, setTenants] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    const res = await getContractsAction();
    if (res.success && res.data) setContracts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
    getRoomsAction().then((res) => {
      if (res.success && res.data) {
        setRooms(res.data.map((r) => ({ id: r.id, name: `P.${r.roomNumber} (${r.buildingName})` })));
      }
    });
    getTenantsAction().then((res) => {
      if (res.success && res.data) {
        setTenants(res.data.map((t) => ({ id: t.id, name: `${t.fullName} (${t.phone || "No phone"})` })));
      }
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Quản Lý Hợp Đồng Thuê Trọ"
        description="Toàn bộ danh sách hợp đồng trọ, vòng đời kích hoạt / thanh lý và đồng bộ trạng thái phòng"
        action={<Button variant="primary" onClick={() => setIsDialogOpen(true)}>+ Tạo Hợp Đồng Mới</Button>}
      />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">Đang tải danh sách hợp đồng...</div>
      ) : (
        <ContractListSection contracts={contracts} />
      )}

      <ContractFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchContracts}
        rooms={rooms}
        tenants={tenants}
      />
    </div>
  );
}
