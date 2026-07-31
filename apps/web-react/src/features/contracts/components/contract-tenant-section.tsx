import React, { useState } from "react";
import { ContractTenantRelation } from "../types/contract.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog } from "@/shared/components/ui/dialog";
import { Select } from "@/shared/components/ui/select";
import { Users, Plus, Trash2, Crown } from "lucide-react";

export interface ContractTenantSectionProps {
  contractId: string;
  tenants: ContractTenantRelation[];
  availableTenants: { id: string; name: string }[];
  onAddTenant: (tenantId: string, isPrimary: boolean) => Promise<void>;
  onRemoveTenant: (tenantId: string) => Promise<void>;
  loading?: boolean;
}

export const ContractTenantSection: React.FC<ContractTenantSectionProps> = ({
  tenants,
  availableTenants,
  onAddTenant,
  onRemoveTenant,
  loading = false,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedTenantId) return;

    try {
      await onAddTenant(selectedTenantId, isPrimary);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Thêm thành viên thất bại");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#3F594F]" /> Thành Viên Thuê Ở ({tenants.length})
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (availableTenants.length > 0) setSelectedTenantId(availableTenants[0].id);
            setErrorMsg(null);
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Thêm Thành Viên
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F7F4] text-[#73766F] uppercase font-semibold border-b border-[#E8E5DF]">
              <tr>
                <th className="px-3 py-2.5">Họ và Tên</th>
                <th className="px-3 py-2.5">Số Điện Thoại</th>
                <th className="px-5 py-2.5 text-center">Vai Trò</th>
                <th className="px-3 py-2.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {tenants.map((t) => (
                <tr key={t.tenantId} className="hover:bg-[#F8F7F4]/50">
                  <td className="px-3 py-3 font-semibold text-[#252724]">{t.fullName}</td>
                  <td className="px-3 py-3 font-mono text-[#52554E]">{t.phone || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    {t.isPrimary ? (
                      <Badge variant="success" className="gap-1">
                        <Crown className="w-3 h-3 text-[#3E6148]" /> Đại Diện PRIMARY
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Thành viên ở cùng</Badge>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {!t.isPrimary && (
                      <button
                        onClick={() => {
                          if (confirm(`Xóa ${t.fullName} khỏi hợp đồng?`)) {
                            onRemoveTenant(t.tenantId);
                          }
                        }}
                        className="p-1 text-[#A84646] hover:bg-[#FDF0F0] rounded-lg"
                        title="Xóa khỏi hợp đồng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} title="Thêm Thành Viên Vào Hợp Đồng">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {errorMsg && <div className="p-3 bg-[#FDF0F0] text-[#A84646] text-xs rounded-xl">{errorMsg}</div>}
          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Chọn Khách Thuê (*)</label>
            <Select value={selectedTenantId} onChange={(e) => setSelectedTenantId(e.target.value)} required>
              {availableTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded text-[#3F594F]"
            />
            <label htmlFor="isPrimary" className="text-xs text-[#252724] font-medium cursor-pointer">
              Đặt làm Khách Đại Diện (PRIMARY)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Hủy Bỏ
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              Lưu Thành Viên
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
};
