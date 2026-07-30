"use client";

import React from "react";
import Link from "next/link";
import { BuildingDetailDTO } from "../types/building.types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3 } from "lucide-react";

export interface BuildingDetailHeaderProps {
  building: BuildingDetailDTO;
  onEdit: () => void;
}

export const BuildingDetailHeader: React.FC<BuildingDetailHeaderProps> = ({ building, onEdit }) => {
  return (
    <div>
      <div className="mb-3">
        <Link href="/admin/buildings" className="text-xs font-medium text-[#73766F] hover:text-[#252724] inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Danh sách Tòa nhà</span>
        </Link>
      </div>
      <PageHeader
        title={building.name}
        description={building.address}
        action={
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit3 className="w-3.5 h-3.5 text-[#3F594F]" />
            <span>Sửa Thông Tin Tòa Nhà</span>
          </Button>
        }
      />
    </div>
  );
};
