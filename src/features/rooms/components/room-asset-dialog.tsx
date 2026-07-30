"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addRoomAssetAction } from "../actions/add-room-asset.action";
import { updateRoomAssetAction } from "../actions/update-room-asset.action";
import { RoomAssetDTO } from "../types/room.types";

export interface RoomAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomId: string;
  editAsset?: RoomAssetDTO | null;
}

export const RoomAssetDialog: React.FC<RoomAssetDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  editAsset,
}) => {
  const [name, setName] = useState(editAsset?.name || "");
  const [assetCode, setAssetCode] = useState(editAsset?.assetCode || "");
  const [condition, setCondition] = useState(editAsset?.condition || "GOOD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (editAsset) {
      const res = await updateRoomAssetAction(editAsset.id, { name, assetCode, condition });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Cập nhật thiết bị thất bại");
        return;
      }
    } else {
      const res = await addRoomAssetAction(roomId, { name, assetCode, condition });
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Thêm thiết bị thất bại");
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
      title={editAsset ? "Sửa Thiết Bị" : "Thêm Thiết Bị Vào Phòng"}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

        <Input label="Tên Trang Thiết Bị (*)" placeholder="Điều hòa Daikin 9000BTU / Điều hòa 12000" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Mã Định Danh / Số Serial" placeholder="TB-DH-01" value={assetCode} onChange={(e) => setAssetCode(e.target.value)} />
        <Select
          label="Tình Trạng Thiết Bị (*)"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          options={[
            { label: "Mới 100% / Hoạt động tốt (GOOD)", value: "GOOD" },
            { label: "Cũ / Đã sử dụng (USED)", value: "USED" },
            { label: "Cần Bảo Trì / Sửa Chữa (NEED_REPAIR)", value: "NEED_REPAIR" },
          ]}
        />

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {editAsset ? "Lưu Thay Đổi" : "Thêm Thiết Bị"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
