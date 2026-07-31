import React from "react";
import { Contract, ContractStatus } from "../types/contract.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { translateContractStatus } from "@/shared/lib/formatters";
import { CheckCircle2, AlertTriangle, XCircle, StopCircle } from "lucide-react";

export interface ContractStatusActionsProps {
  contract: Contract;
  onStatusChange: (targetStatus: ContractStatus, reason?: string) => Promise<void>;
  loading?: boolean;
}

export const ContractStatusActions: React.FC<ContractStatusActionsProps> = ({
  contract,
  onStatusChange,
  loading = false,
}) => {
  const statusInfo = translateContractStatus(contract.status);

  const handleActivate = () => {
    if (confirm("Kích hoạt hợp đồng này? Phòng sẽ chuyển sang trạng thái Đang Thuê (RENTED).")) {
      onStatusChange("ACTIVE");
    }
  };

  const handleTerminate = () => {
    const reason = prompt("Nhập lý do kết thúc hợp đồng trước hạn (nếu có):");
    if (reason !== null) {
      onStatusChange("TERMINATED", reason);
    }
  };

  const handleCancel = () => {
    if (confirm("Hủy bỏ hợp đồng nháp này? Hành động này không thể hoàn tác.")) {
      onStatusChange("CANCELLED");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#73766F] uppercase tracking-wider block font-semibold">Trạng Thái Hợp Đồng</span>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusInfo.variant} className="text-xs py-1 px-3">
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#F2EFE9] flex flex-wrap gap-2">
        {contract.status === "DRAFT" && (
          <>
            <Button variant="primary" size="sm" onClick={handleActivate} disabled={loading}>
              <CheckCircle2 className="w-4 h-4" /> Kích Hoạt Hợp Đồng (ACTIVE)
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancel} disabled={loading}>
              <XCircle className="w-4 h-4" /> Hủy Hợp Đồng (CANCELLED)
            </Button>
          </>
        )}

        {(contract.status === "ACTIVE" || contract.status === "EXPIRING") && (
          <Button variant="outline" size="sm" className="text-[#A84646] hover:bg-[#FDF0F0]" onClick={handleTerminate} disabled={loading}>
            <StopCircle className="w-4 h-4" /> Kết Thúc Hợp Đồng (TERMINATED)
          </Button>
        )}

        {contract.status === "EXPIRING" && (
          <div className="text-xs text-[#A36E35] bg-[#FBF3E8] p-2.5 rounded-xl border border-[#F4E3CD] flex items-center gap-2 w-full">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Hợp đồng này sắp hết hạn! Vui lòng gia hạn hoặc chuẩn bị thanh lý.</span>
          </div>
        )}
      </div>
    </div>
  );
};
