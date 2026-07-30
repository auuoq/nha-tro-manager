"use client";

import React, { useState } from "react";
import { TenantDetailDTO } from "../types/tenant.types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createTenantAccountAction } from "../actions/create-tenant-account.action";
import { resetTenantPasswordAction } from "../actions/reset-tenant-password.action";
import { suspendTenantAccountAction } from "../actions/suspend-tenant-account.action";
import { reactivateTenantAccountAction } from "../actions/reactivate-tenant-account.action";

export interface TenantAccountCardProps {
  tenant: TenantDetailDTO;
  onSuccess: () => void;
}

export const TenantAccountCard: React.FC<TenantAccountCardProps> = ({ tenant, onSuccess }) => {
  const [phone, setPhone] = useState(tenant.phone || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPasswordModal, setTempPasswordModal] = useState<string | null>(null);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createTenantAccountAction({ tenantId: tenant.id, phone, email });
    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.error || "Tạo tài khoản thất bại");
      return;
    }

    setTempPasswordModal(res.data.tempPassword);
    onSuccess();
  };

  const handleResetPassword = async () => {
    if (confirm("Reset mật khẩu tài khoản khách thuê này?")) {
      setLoading(true);
      const res = await resetTenantPasswordAction(tenant.id);
      setLoading(false);
      if (res.success && res.tempPassword) {
        setTempPasswordModal(res.tempPassword);
        onSuccess();
      } else {
        alert(res.error);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!tenant.account) return;
    setLoading(true);
    if (tenant.account.isActive) {
      await suspendTenantAccountAction(tenant.id);
    } else {
      await reactivateTenantAccountAction(tenant.id);
    }
    setLoading(false);
    onSuccess();
  };

  return (
    <Card title="Quản Lý Tài Khoản Đăng Nhập (Tenant Portal)">
      {tempPasswordModal && (
        <div className="mb-4 bg-emerald-50 border border-emerald-300 p-4 rounded-lg text-xs space-y-2">
          <p className="text-emerald-800 font-bold">✅ Thao tác thành công!</p>
          <div className="p-2 bg-white rounded font-mono font-bold text-amber-600 border border-amber-300">
            Mật khẩu tạm: {tempPasswordModal}
          </div>
          <p className="text-slate-500 italic">Vui lòng gửi mật khẩu tạm này cho Khách thuê. Mật khẩu này chỉ hiển thị ĐÚNG 1 LẦN!</p>
          <Button variant="outline" size="sm" onClick={() => setTempPasswordModal(null)}>
            Đã Sao Chép
          </Button>
        </div>
      )}

      {tenant.account ? (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-500 block">Tên đăng nhập (SĐT)</span>
              <span className="font-mono font-bold text-slate-800">{tenant.account.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Trạng thái</span>
              <Badge variant={tenant.account.isActive ? "success" : "danger"}>
                {tenant.account.isActive ? "Hoạt Động" : "Tạm Khóa"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleResetPassword} isLoading={loading}>
              🔑 Reset Mật Khẩu Tạm
            </Button>
            {tenant.account.isActive ? (
              <Button variant="danger" size="sm" onClick={handleToggleStatus} isLoading={loading}>
                🔒 Tạm Khóa Account
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleToggleStatus} isLoading={loading}>
                🔓 Mở Khóa Account
              </Button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateAccount} className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-700 block">Tạo Tài Khoản Cho Khách Thuê Này</span>
          {error && <div className="p-2 bg-red-50 text-red-600 rounded border border-red-200">{error}</div>}
          <Input label="Số Điện Thoại Đăng Nhập (*)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email Đăng Nhập (Không bắt buộc)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            + Cấp Tài Khoản & Sinh Password Tạm
          </Button>
        </form>
      )}
    </Card>
  );
};
