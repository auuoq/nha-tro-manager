"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOwnerAction } from "../actions/create-owner.action";
import { CreateOwnerResult } from "../types/owner.types";

export interface CreateOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOwnerDialog: React.FC<CreateOwnerDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultData, setResultData] = useState<CreateOwnerResult | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createOwnerAction({ fullName, phone, email, businessName });
    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.error || "Tạo tài khoản thất bại");
      return;
    }

    setResultData(res.data);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl text-slate-100">
        <h2 className="text-xl font-bold text-amber-400 mb-4">Tạo Tài Khoản Chủ Nhà (Owner)</h2>

        {resultData ? (
          <div className="space-y-4 bg-slate-800 p-4 rounded-lg border border-emerald-500/50">
            <p className="text-sm text-emerald-400 font-semibold">✅ Đã tạo tài khoản thành công!</p>
            <div className="text-xs space-y-1 font-mono text-slate-300">
              <div>Chủ nhà: {resultData.fullName}</div>
              <div>Số điện thoại: {resultData.phone}</div>
              <div className="p-2 bg-slate-950 rounded text-amber-300 font-bold border border-amber-500/30">
                Mật khẩu tạm: {resultData.tempPassword}
              </div>
            </div>
            <p className="text-xs text-rose-400 italic">
              ⚠️ Vui lòng sao chép mật khẩu này để gửi cho Chủ nhà. Mật khẩu tạm này chỉ hiển thị ĐÚNG 1 LẦN duy nhất!
            </p>
            <Button variant="primary" className="w-full mt-2" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-lg">{error}</div>}
            <Input
              label="Họ và Tên Chủ Nhà"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Số Điện Thoại (Tên đăng nhập)"
              placeholder="0988888888"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email (Không bắt buộc)"
              placeholder="owner@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Tên Doanh Nghiệp / Chuỗi Trọ"
              placeholder="Nhà Trọ An Bình"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Tạo Tài Khoản
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
