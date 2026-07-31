import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { buildingsApi } from "../api/buildings.api";
import { Building, BuildingCreateInput } from "../types/building.types";
import { BuildingFormDialog } from "../components/building-dialog";
import { Building2, DoorOpen, CreditCard, ArrowRight, Trash2 } from "lucide-react";

export const BuildingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["buildings", { page }],
    queryFn: () => buildingsApi.list({ page, pageSize: 12 }),
  });

  const createMutation = useMutation({
    mutationFn: (input: BuildingCreateInput) => buildingsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code || err?.response?.data?.message;
      setErrorMsg(code === "BUILDING_NOT_FOUND" ? "Tòa nhà không tồn tại" : "Không thể tạo tòa nhà");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BuildingCreateInput }) => buildingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      setIsDialogOpen(false);
      setEditingBuilding(null);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Cập nhật tòa nhà thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buildingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "ROOM_HAS_ACTIVE_CONTRACT") {
        alert("Không thể xóa/lưu trữ tòa nhà đang có hợp đồng hoạt động!");
      } else {
        alert(err?.response?.data?.message || "Xóa tòa nhà thất bại");
      }
    },
  });

  const handleFormSubmit = async (input: BuildingCreateInput) => {
    setErrorMsg(null);
    if (editingBuilding) {
      await updateMutation.mutateAsync({ id: editingBuilding.id, data: input });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn lưu trữ/xóa tòa nhà này?")) {
      deleteMutation.mutate(id);
    }
  };

  const buildings = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Cơ Sở & Tòa Nhà Trọ"
        description="Danh sách các tòa nhà thuộc sở hữu của bạn và thiết lập đơn giá dịch vụ mặc định"
        action={
          <Button variant="primary" onClick={() => { setEditingBuilding(null); setIsDialogOpen(true); }}>
            + Thêm Tòa Nhà
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : buildings.length === 0 ? (
        <EmptyState
          title="Chưa có tòa nhà nào"
          description="Hãy tạo tòa nhà trọ đầu tiên để bắt đầu quản lý phòng và hợp đồng."
          action={
            <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
              + Thêm Tòa Nhà Mới
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b) => (
            <Card key={b.id} className="hover:border-[#C8B8A8] transition-all flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF0ED] text-[#3F594F] flex items-center justify-center font-medium shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#252724] tracking-tight">{b.name}</h3>
                      <p className="text-xs text-[#73766F] font-normal">{b.address}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#A84646] hover:bg-[#FDF0F0] p-2"
                    onClick={() => handleArchive(b.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#F8F7F4] p-3 rounded-xl border border-[#E8E5DF]">
                    <div className="flex items-center gap-1.5 text-[#73766F] mb-1">
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span>Tổng phòng</span>
                    </div>
                    <span className="text-lg font-semibold text-[#252724]">{b.totalRooms ?? 0} phòng</span>
                  </div>
                  <div className="bg-[#EBF3ED] p-3 rounded-xl border border-[#D1E3D5]">
                    <div className="flex items-center gap-1.5 text-[#3E6148] mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Trạng thái</span>
                    </div>
                    <span className="text-lg font-semibold text-[#3E6148]">Hoạt động</span>
                  </div>
                </div>

                {b.bankAccount && (
                  <div className="flex items-center gap-2 text-xs text-[#73766F] bg-[#F2EFE9]/50 p-2.5 rounded-xl border border-[#E8E5DF]/60">
                    <CreditCard className="w-4 h-4 text-[#3F594F] shrink-0" />
                    <span className="truncate">
                      {b.bankName || "Ngân hàng"}: <strong className="text-[#252724] font-medium">{b.bankAccount}</strong> ({b.accountHolder})
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between mt-4">
                <Badge variant="success">Đang quản lý</Badge>
                <Link to={`/admin/buildings/${b.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    <span>Chi Tiết & Cấu Hình</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#73766F]" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BuildingFormDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingBuilding(null); }}
        onSubmit={handleFormSubmit}
        editBuilding={editingBuilding}
        loading={createMutation.isPending || updateMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
