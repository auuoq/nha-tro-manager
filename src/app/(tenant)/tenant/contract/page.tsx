"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractDetailDTO, getTenantOwnContractAction } from "@/features/contracts";

export default function TenantOwnContractPage() {
  const [contract, setContract] = useState<ContractDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantOwnContractAction().then((res) => {
      if (res.success && res.data) setContract(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải hợp đồng thuê trọ của bạn...</div>;
  if (!contract) return <div className="p-8 text-center text-slate-400 italic">Hiện tại bạn chưa có hợp đồng thuê trọ nào đang hoạt động.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <PageHeader title={`Hợp Đồng ${contract.contractCode}`} description={`Cơ sở: ${contract.buildingName} • Phòng: ${contract.roomNumber}`} />
        <Badge variant="success">Đang Cho Thuê (ACTIVE)</Badge>
      </div>

      <Card title="Thông Tin Chi Tiết Hợp Đồng">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Thời hạn hợp đồng</span>
            <span className="font-bold text-slate-800">{new Date(contract.startDate).toLocaleDateString("vi-VN")} ➔ {new Date(contract.endDate).toLocaleDateString("vi-VN")}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Giá thuê cố định / tháng</span>
            <span className="font-bold text-slate-900">{contract.monthlyPrice.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tiền đặt cọc</span>
            <span className="font-bold text-slate-800">{contract.depositAmount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div>
            <span className="text-slate-500 block">Ngày chốt hóa đơn hàng tháng</span>
            <span className="font-bold text-slate-800">Ngày {contract.billingDay} hàng tháng</span>
          </div>
        </div>
      </Card>

      <Card title="Thành Viên Cùng Cư Trú">
        <div className="divide-y divide-slate-100 text-xs">
          {contract.tenants.map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between">
              <span>👤 {t.tenantName} {t.role === "PRIMARY" ? "(Đại diện hợp đồng)" : ""}</span>
              <span className="text-slate-400">Tham gia: {new Date(t.joinedAt).toLocaleDateString("vi-VN")}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
