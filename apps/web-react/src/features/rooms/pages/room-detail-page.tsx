import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { roomsApi } from "../api/rooms.api";
import { RoomAsset, RoomAssetCreateInput } from "../types/room-asset.types";
import { adaptRoomToViewModel } from "../adapters/room.adapter";
import { ArrowLeft, DoorOpen, Package, Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";

export const RoomDetailPage: React.FC = () => {
  const { roomId = "" } = useParams<{ roomId: string }>();
  const queryClient = useQueryClient();

  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<RoomAsset | null>(null);
  const [assetName, setAssetName] = useState("");
  const [assetQuantity, setAssetQuantity] = useState(1);
  const [assetCondition, setAssetCondition] = useState("Tốt");
  const [assetNote, setAssetNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: rawRoom, isLoading: isRoomLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.getById(roomId),
    enabled: Boolean(roomId),
  });

  const { data: assets = [], isLoading: isAssetsLoading } = useQuery({
    queryKey: ["room-assets", roomId],
    queryFn: () => roomsApi.getAssets(roomId),
    enabled: Boolean(roomId),
  });

  const createAssetMutation = useMutation({
    mutationFn: (input: RoomAssetCreateInput) => roomsApi.createAsset(roomId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-assets", roomId] });
      setIsAssetDialogOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Thêm tài sản thất bại");
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ assetId, input }: { assetId: string; input: RoomAssetCreateInput }) =>
      roomsApi.updateAsset(roomId, assetId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-assets", roomId] });
      setIsAssetDialogOpen(false);
      setEditingAsset(null);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Cập nhật tài sản thất bại");
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: string) => roomsApi.deleteAsset(roomId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-assets", roomId] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Xóa tài sản thất bại");
    },
  });

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (assetQuantity < 1) {
      setErrorMsg("Số lượng tài sản phải >= 1");
      return;
    }

    const payload: RoomAssetCreateInput = {
      name: assetName,
      quantity: Number(assetQuantity),
      condition: assetCondition,
      note: assetNote,
    };

    if (editingAsset) {
      await updateAssetMutation.mutateAsync({ assetId: editingAsset.id, input: payload });
    } else {
      await createAssetMutation.mutateAsync(payload);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài sản này khỏi phòng?")) {
      deleteAssetMutation.mutate(assetId);
    }
  };

  if (isRoomLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!rawRoom) {
    return (
      <div className="p-8 text-center text-[#A84646] bg-[#FDF0F0] rounded-2xl border border-[#F5D5D5]">
        Phòng trọ không tồn tại hoặc bạn không có quyền truy cập (ROOM_NOT_FOUND).
      </div>
    );
  }

  const room = adaptRoomToViewModel(rawRoom);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/admin/rooms" className="text-xs text-[#73766F] hover:text-[#3F594F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách phòng
        </Link>
      </div>

      <PageHeader
        title={`Chi Tiết Phòng ${room.roomNumber}`}
        description={`Tầng ${room.floor} • Diện tích ${room.area} m² • Tối đa ${room.maxTenants} người`}
        action={<Badge variant={room.statusVariant}>{room.statusLabel}</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Overview */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-[#3F594F]" /> Thông Tin Chi Tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs text-[#73766F]">
              <div>
                <span className="font-semibold text-[#252724] block">Mã số phòng:</span>
                <span>P.{room.roomNumber} (Tầng {room.floor})</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Giá thuê cơ bản:</span>
                <strong className="text-[#3F594F] font-bold text-sm">{room.displayPrice}</strong>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Diện tích:</span>
                <span>{room.area} m²</span>
              </div>
              <div>
                <span className="font-semibold text-[#252724] block">Số người tối đa:</span>
                <span>{room.maxTenants} người</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Room Assets Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#3F594F]" /> Danh Sách Tài Sản Trang Thiết Bị ({assets.length})
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingAsset(null);
                  setAssetName("");
                  setAssetQuantity(1);
                  setAssetCondition("Tốt");
                  setAssetNote("");
                  setErrorMsg(null);
                  setIsAssetDialogOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Tài Sản
              </Button>
            </CardHeader>
            <CardContent>
              {isAssetsLoading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
              ) : assets.length === 0 ? (
                <p className="text-xs text-[#73766F] p-4 text-center">Chưa có trang thiết bị/tài sản nào được bàn giao cho phòng này.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F7F4] text-[#73766F] uppercase font-semibold border-b border-[#E8E5DF]">
                      <tr>
                        <th className="px-3 py-2.5">Tên Tài Sản</th>
                        <th className="px-3 py-2.5">Số Lượng</th>
                        <th className="px-3 py-2.5">Tình Trạng</th>
                        <th className="px-3 py-2.5">Ghi Chú</th>
                        <th className="px-3 py-2.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DF]">
                      {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-[#F8F7F4]/50">
                          <td className="px-3 py-3 font-semibold text-[#252724]">{asset.name}</td>
                          <td className="px-3 py-3 font-bold">{asset.quantity}</td>
                          <td className="px-3 py-3"><Badge variant="info">{asset.condition || "Tốt"}</Badge></td>
                          <td className="px-3 py-3 text-[#73766F]">{asset.note || "-"}</td>
                          <td className="px-3 py-3 text-right flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingAsset(asset);
                                setAssetName(asset.name);
                                setAssetQuantity(asset.quantity);
                                setAssetCondition(asset.condition || "Tốt");
                                setAssetNote(asset.note || "");
                                setIsAssetDialogOpen(true);
                              }}
                              className="p-1 text-[#73766F] hover:text-[#3F594F]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-1 text-[#A84646] hover:bg-[#FDF0F0] rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Asset Dialog */}
      <Dialog
        open={isAssetDialogOpen}
        onClose={() => setIsAssetDialogOpen(false)}
        title={editingAsset ? "Cập Nhật Tài Sản" : "Thêm Tài Sản Phòng Trọ"}
      >
        <form onSubmit={handleSaveAsset} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#FDF0F0] border border-[#F5D5D5] text-[#A84646] text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Tên Tài Sản (*)</label>
            <Input placeholder="VD: Điều hòa Panasonic 9000BTU" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Số Lượng (* tối thiểu 1)</label>
              <Input type="number" min={1} value={assetQuantity} onChange={(e) => setAssetQuantity(Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Tình Trạng Ban Đầu</label>
              <Input placeholder="VD: Mới 100%" value={assetCondition} onChange={(e) => setAssetCondition(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#252724] mb-1">Ghi Chú</label>
            <Input placeholder="Ghi chú thiết bị..." value={assetNote} onChange={(e) => setAssetNote(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E5DF]">
            <Button type="button" variant="ghost" onClick={() => setIsAssetDialogOpen(false)}>
              Hủy Bỏ
            </Button>
            <Button type="submit" variant="primary">
              Lưu Tài Sản
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
