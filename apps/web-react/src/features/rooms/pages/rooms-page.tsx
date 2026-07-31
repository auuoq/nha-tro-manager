import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { roomsApi } from "../api/rooms.api";
import { buildingsApi } from "@/features/buildings/api/buildings.api";
import { Room, RoomCreateInput, RoomStatus } from "../types/room.types";
import { adaptRoomToViewModel } from "../adapters/room.adapter";
import { RoomFormDialog } from "../components/room-dialog";
import { DoorOpen, ArrowRight, Trash2, Wrench, Search } from "lucide-react";

export const RoomsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: buildingsData } = useQuery({
    queryKey: ["buildings"],
    queryFn: () => buildingsApi.list({ page: 1, pageSize: 100 }),
  });
  const buildings = buildingsData?.items || [];

  const { data, isLoading } = useQuery({
    queryKey: ["rooms", { buildingId: selectedBuildingId, status: selectedStatus, search, page }],
    queryFn: () =>
      roomsApi.list({
        buildingId: selectedBuildingId || undefined,
        status: (selectedStatus as RoomStatus) || undefined,
        search: search || undefined,
        page,
        pageSize: 12,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (input: RoomCreateInput) => roomsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "ROOM_NUMBER_ALREADY_EXISTS") {
        setErrorMsg("Số phòng này đã tồn tại trong tòa nhà!");
      } else {
        setErrorMsg(err?.response?.data?.message || "Tạo phòng thất bại");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomCreateInput }) => roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setIsDialogOpen(false);
      setEditingRoom(null);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Cập nhật phòng thất bại");
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: ({ id, targetStatus }: { id: string; targetStatus: "VACANT" | "MAINTENANCE" }) =>
      roomsApi.updateMaintenanceStatus(id, targetStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "INVALID_ROOM_STATUS_TRANSITION") {
        alert("Chuyển trạng thái không hợp lệ! Không thể thay đổi trạng thái khi phòng đang thuê (RENTED).");
      } else {
        alert(err?.response?.data?.message || "Thay đổi trạng thái thất bại");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      if (code === "ROOM_HAS_ACTIVE_CONTRACT") {
        alert("Không thể xóa phòng đang có hợp đồng hoạt động (ROOM_HAS_ACTIVE_CONTRACT)!");
      } else {
        alert(err?.response?.data?.message || "Xóa phòng thất bại");
      }
    },
  });

  const handleFormSubmit = async (input: RoomCreateInput) => {
    setErrorMsg(null);
    if (editingRoom) {
      await updateMutation.mutateAsync({ id: editingRoom.id, data: input });
    } else {
      await createMutation.mutateAsync(input);
    }
  };

  const handleToggleMaintenance = (room: Room) => {
    if (room.status === "RENTED" || room.status === "RESERVED") {
      alert("Không thể chuyển bảo trì phòng đang có hợp đồng/cọc!");
      return;
    }
    const targetStatus = room.status === "MAINTENANCE" ? "VACANT" : "MAINTENANCE";
    maintenanceMutation.mutate({ id: room.id, targetStatus });
  };

  const rooms = (data?.items || []).map(adaptRoomToViewModel);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Danh Sách Phòng Trọ"
        description="Toàn bộ danh sách các phòng trọ thuộc các cơ sở nhà trọ của bạn"
        action={
          <Button variant="primary" onClick={() => { setEditingRoom(null); setIsDialogOpen(true); }}>
            + Thêm Phòng Mới
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <Select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">-- Tất cả tòa nhà --</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">-- Trạng thái --</option>
            <option value="VACANT">Còn trống</option>
            <option value="RENTED">Đang thuê</option>
            <option value="RESERVED">Đã cọc</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </Select>
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Tìm theo số phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-[#73766F] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Không tìm thấy phòng trọ"
          description="Chưa có phòng trọ nào phù hợp với bộ lọc hoặc hệ thống chưa có phòng."
          action={
            <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
              + Thêm Phòng Mới
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((r) => (
            <Card key={r.id} className="hover:border-[#C8B8A8] transition-all p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF0ED] text-[#3F594F] flex items-center justify-center font-bold text-sm">
                      <DoorOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#252724]">Phòng {r.roomNumber}</h4>
                      <p className="text-[11px] text-[#73766F]">Tầng {r.floor}</p>
                    </div>
                  </div>
                  <Badge variant={r.statusVariant}>{r.statusLabel}</Badge>
                </div>

                <div className="text-xs text-[#73766F] space-y-1">
                  <div>Giá thuê: <strong className="text-[#3F594F] font-bold">{r.displayPrice}</strong></div>
                  <div>Diện tích: <span>{r.area} m²</span> • Tối đa <span>{r.maxTenants} người</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between mt-3">
                <button
                  onClick={() => handleToggleMaintenance(r)}
                  className="p-1.5 text-[#73766F] hover:text-[#3F594F] hover:bg-[#F2EFE9] rounded-lg transition-colors"
                  title="Chuyển trạng thái Bảo Trì / Trống"
                >
                  <Wrench className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#A84646] p-1.5"
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa phòng ${r.roomNumber}?`)) {
                        deleteMutation.mutate(r.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <Link to={`/admin/rooms/${r.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Chi Tiết <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoomFormDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingRoom(null); }}
        onSubmit={handleFormSubmit}
        editRoom={editingRoom}
        buildings={buildings}
        loading={createMutation.isPending || updateMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
