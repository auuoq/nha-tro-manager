import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select } from "@/shared/components/ui/select";
import { metersApi } from "../api/meters.api";
import { buildingsApi } from "@/features/buildings/api/buildings.api";
import { roomsApi } from "@/features/rooms/api/rooms.api";
import { CreateMeterInput, MeterType } from "../types/meter.types";
import { MeterTable } from "../components/meter-table";
import { MeterFormDialog } from "../components/meter-dialog";

export const MetersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: buildingsData } = useQuery({
    queryKey: ["buildings"],
    queryFn: () => buildingsApi.list({ page: 1, pageSize: 100 }),
  });
  const buildings = buildingsData?.items || [];

  const { data: roomsData } = useQuery({
    queryKey: ["rooms", { buildingId: selectedBuildingId }],
    queryFn: () => roomsApi.list({ buildingId: selectedBuildingId || undefined, page: 1, pageSize: 100 }),
  });
  const rooms = (roomsData?.items || []).map((r) => ({ id: r.id, name: `Phòng ${r.roomNumber}` }));

  const { data, isLoading } = useQuery({
    queryKey: ["meters", { buildingId: selectedBuildingId, roomId: selectedRoomId, type: selectedType, page }],
    queryFn: () =>
      metersApi.list({
        buildingId: selectedBuildingId || undefined,
        roomId: selectedRoomId || undefined,
        type: (selectedType as MeterType) || undefined,
        page,
        pageSize: 12,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMeterInput) => metersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Tạo đồng hồ thất bại");
    },
  });

  const handleCreateSubmit = async (input: CreateMeterInput) => {
    setErrorMsg(null);
    await createMutation.mutateAsync(input);
  };

  const meters = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Chỉ Số Điện Nước & Đồng Hồ"
        description="Danh sách các công tơ điện và đồng hồ nước gắn với từng phòng trọ"
        action={
          <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
            + Thêm Đồng Hồ
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] shadow-2xs flex flex-wrap items-center gap-3">
        <Select
          value={selectedBuildingId}
          onChange={(e) => {
            setSelectedBuildingId(e.target.value);
            setSelectedRoomId("");
          }}
          className="w-full sm:w-48"
        >
          <option value="">-- Tất cả tòa nhà --</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>

        <Select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">-- Tất cả phòng --</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">-- Loại đồng hồ --</option>
          <option value="ELECTRICITY">Công tơ điện</option>
          <option value="WATER">Đồng hồ nước</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <MeterTable meters={meters} />
      )}

      <MeterFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        rooms={rooms}
        loading={createMutation.isPending}
        error={errorMsg}
      />
    </div>
  );
};
