"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addContractMemberAction } from "../actions/add-contract-member.action";
import { changePrimaryTenantAction } from "../actions/change-primary-tenant.action";

export interface TenantOption {
  id: string;
  name: string;
}

export interface ContractTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractId: string;
  tenants: TenantOption[];
  mode: "ADD_MEMBER" | "CHANGE_PRIMARY";
}

export const ContractTenantDialog: React.FC<ContractTenantDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contractId,
  tenants,
  mode,
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "ADD_MEMBER") {
      const res = await addContractMemberAction({ contractId, tenantId: selectedTenantId });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Thêm người ở cùng thất bại");
        return;
      }
    } else {
      const res = await changePrimaryTenantAction({ contractId, newPrimaryTenantId: selectedTenantId });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Đổi đại diện PRIMARY thất bại");
        return;
      }
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "ADD_MEMBER" ? "Thêm Khách Ở Cùng Vào Hợp Đồng" : "Thay Đổi Khách Đại Diện (PRIMARY)"}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <Select
          label="Chọn Khách Thuê (*)"
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
        />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {mode === "ADD_MEMBER" ? "Thêm Người Ở Cùng" : "Cập Nhật PRIMARY"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
