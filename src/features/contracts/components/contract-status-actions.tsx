"use client";

import React, { useState } from "react";
import { ContractDetailDTO } from "../types/contract.types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { activateContractAction } from "../actions/activate-contract.action";
import { cancelContractAction } from "../actions/cancel-contract.action";
import { terminateContractAction } from "../actions/terminate-contract.action";

export interface ContractStatusActionsProps {
  contract: ContractDetailDTO;
  onSuccess: () => void;
}

export const ContractStatusActions: React.FC<ContractStatusActionsProps> = ({ contract, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Terminate Modal state
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [depositReturnedAmount, setDepositReturnedAmount] = useState(contract.depositAmount);
  const [depositDeductionAmount, setDepositDeductionAmount] = useState(0);

  const handleActivate = async () => {
    if (confirm("Xác nhận kích hoạt hợp đồng này? Phòng trọ sẽ tự động chuyển sang trạng thái Đang Cho Thuê (RENTED).")) {
      setLoading(true);
      const res = await activateContractAction(contract.id);
      setLoading(false);
      if (res.success) onSuccess();
      else alert(res.error);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Vui lòng nhập lý do hủy hợp đồng DRAFT này:");
    if (reason) {
      setLoading(true);
      const res = await cancelContractAction({ contractId: contract.id, cancellationReason: reason });
      setLoading(false);
      if (res.success) onSuccess();
      else alert(res.error);
    }
  };

  const handleTerminateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await terminateContractAction({
      contractId: contract.id,
      terminationReason,
      terminationDate: new Date(),
      actualMoveOutDate: new Date(),
      depositReturnedAmount: Number(depositReturnedAmount),
      depositDeductionAmount: Number(depositDeductionAmount),
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Thanh lý hợp đồng thất bại");
      return;
    }

    setIsTerminateOpen(false);
    onSuccess();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div className="text-xs space-y-0.5">
        <span className="font-bold text-slate-800 block">Vòng Đời Hợp Đồng: {contract.status}</span>
        <span className="text-slate-500">
          {contract.status === "DRAFT" && "Hợp đồng nháp chưa có hiệu lực pháp lý và chưa đổi trạng thái phòng."}
          {contract.status === "ACTIVE" && "Hợp đồng đang có hiệu lực. Khách thuê đang ở tại phòng."}
          {contract.status === "TERMINATED" && `Đã thanh lý vào ngày ${contract.terminationDate ? new Date(contract.terminationDate).toLocaleDateString("vi-VN") : ""}.`}
          {contract.status === "CANCELLED" && `Đã hủy hợp đồng nháp.`}
        </span>
      </div>

      <div className="flex gap-2">
        {contract.status === "DRAFT" && (
          <>
            <Button variant="primary" size="sm" onClick={handleActivate} isLoading={loading}>
              🚀 Kích Hoạt Hợp Đồng
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={handleCancel} isLoading={loading}>
              ❌ Hủy Hợp Đồng DRAFT
            </Button>
          </>
        )}

        {(contract.status === "ACTIVE" || contract.status === "EXPIRING") && (
          <Button variant="danger" size="sm" onClick={() => setIsTerminateOpen(true)} isLoading={loading}>
            🏁 Thanh Lý Hợp Đồng
          </Button>
        )}
      </div>

      {/* Modal Thanh Lý Hợp Đồng */}
      <Dialog isOpen={isTerminateOpen} onClose={() => setIsTerminateOpen(false)} title="Thanh Lý Hợp Đồng Thuê Trọ" maxWidth="sm">
        <form onSubmit={handleTerminateSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

          <Input label="Lý Do Thanh Lý (*)" placeholder="Hết hạn hợp đồng / Khách chuyển đi..." value={terminationReason} onChange={(e) => setTerminationReason(e.target.value)} required />
          <Input label="Số Tiền Cọc Hoàn Trả Cho Khách (VNĐ) (*)" type="number" value={depositReturnedAmount} onChange={(e) => setDepositReturnedAmount(Number(e.target.value))} required />
          <Input label="Số Tiền Khấu Trừ Cọc (Bồi thường/Hư hỏng) (VNĐ) (*)" type="number" value={depositDeductionAmount} onChange={(e) => setDepositDeductionAmount(Number(e.target.value))} required />

          <p className="text-slate-400 italic">Tổng tiền trả cọc + khấu trừ không được vượt quá cọc ban đầu ({contract.depositAmount.toLocaleString("vi-VN")}đ).</p>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsTerminateOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" variant="danger" isLoading={loading}>
              Xác Nhận Thanh Lý
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
