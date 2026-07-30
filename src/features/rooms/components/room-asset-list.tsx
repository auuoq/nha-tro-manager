"use client";

import React from "react";
import { RoomAssetDTO } from "../types/room.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface RoomAssetListProps {
  assets: RoomAssetDTO[];
  onAdd: () => void;
  onEdit: (asset: RoomAssetDTO) => void;
  onArchive: (assetId: string) => void;
}

export const RoomAssetList: React.FC<RoomAssetListProps> = ({ assets, onAdd, onEdit, onArchive }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Danh Sách Trang Thiết Bị / Tài Sản ({assets.length})</h3>
          <p className="text-xs text-slate-500 mt-0.5">Danh mục tài sản đính kèm theo phòng phục vụ biên bản bàn giao phòng</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          + Thêm Thiết Bị
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 italic">Chưa có trang thiết bị nào được khai báo trong phòng này.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {assets.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <span>📦 {a.name}</span>
                  {a.assetCode && <span className="font-mono text-[11px] text-slate-500">({a.assetCode})</span>}
                </div>
                <div className="text-slate-400 text-[11px]">Tình trạng: {a.condition}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{a.condition}</Badge>
                <Button variant="ghost" size="sm" onClick={() => onEdit(a)}>
                  Sửa
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => onArchive(a.id)}>
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
