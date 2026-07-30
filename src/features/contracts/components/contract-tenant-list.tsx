"use client";

import React from "react";
import { ContractTenantDTO } from "../types/contract.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ContractTenantListProps {
  tenants: ContractTenantDTO[];
  onAddMember: () => void;
  onChangePrimary: () => void;
  onRemoveMember: (contractTenantId: string) => void;
}

export const ContractTenantList: React.FC<ContractTenantListProps> = ({
  tenants,
  onAddMember,
  onChangePrimary,
  onRemoveMember,
}) => {
  const activeTenants = tenants.filter((t) => !t.leftAt);
  const leftTenants = tenants.filter((t) => t.leftAt !== null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Danh Sách Thành Viên Cư Trú Trong Hợp Đồng ({activeTenants.length})</h3>
          <p className="text-xs text-slate-500 mt-0.5">Một đại diện PRIMARY duy nhất và các thành viên MEMBER cùng ở</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onChangePrimary}>
            🔄 Đổi Đại Diện PRIMARY
          </Button>
          <Button variant="primary" size="sm" onClick={onAddMember}>
            + Thêm Người Ở Cùng
          </Button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {activeTenants.map((t) => (
          <div key={t.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <span>👤 {t.tenantName}</span>
                {t.tenantPhone && <span className="font-mono text-slate-500">({t.tenantPhone})</span>}
              </div>
              <div className="text-slate-400 text-[11px]">CCCD: {t.tenantIdCard || "Chưa cập nhật"} • Ngày vào ở: {new Date(t.joinedAt).toLocaleDateString("vi-VN")}</div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={t.role === "PRIMARY" ? "warning" : "neutral"}>
                {t.role === "PRIMARY" ? "👑 Đại Diện (PRIMARY)" : "Khách Ở Cùng (MEMBER)"}
              </Badge>
              {t.role !== "PRIMARY" && (
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => onRemoveMember(t.id)}>
                  Khách Rời Đi
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {leftTenants.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lịch Sử Khách Đã Rời Phòng ({leftTenants.length})</span>
          <div className="divide-y divide-slate-100 opacity-60">
            {leftTenants.map((t) => (
              <div key={t.id} className="py-2 flex items-center justify-between text-xs">
                <span>👤 {t.tenantName} ({t.role})</span>
                <span className="text-slate-400">Rời phòng ngày: {new Date(t.leftAt!).toLocaleDateString("vi-VN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
