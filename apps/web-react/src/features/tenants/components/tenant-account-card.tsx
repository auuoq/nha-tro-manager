import React, { useState } from "react";
import { Tenant } from "../types/tenant.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { tenantsApi } from "../api/tenants.api";
import { KeyRound, Lock, Unlock, CheckCircle } from "lucide-react";

export interface TenantAccountCardProps {
  tenant: Tenant;
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

    try {
      const res = await tenantsApi.createAccount(tenant.id, { phone, email });
      setTempPasswordModal(res.tempPassword);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (confirm("Reset mật khẩu tài khoản khách thuê này?")) {
      setLoading(true);
      try {
        const res = await tenantsApi.resetPassword(tenant.id);
        setTempPasswordModal(res.tempPassword);
        onSuccess();
      } catch (err: any) {
        alert(err?.response?.data?.message || "Reset mật khẩu thất bại");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!tenant.account) return;
    setLoading(true);
    try {
      await tenantsApi.updateAccountStatus(tenant.id, !tenant.account.isActive);
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#3F594F]" /> Quản Lý Tài Khoản Đăng Nhập (Tenant Portal)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tempPasswordModal && (
          <div className="mb-4 bg-[#EBF3ED] border border-[#D6E6DA] p-4 rounded-xl text-xs space-y-2">
            <p className="text-[#3E6148] font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Cấp mật khẩu thành công!
            </p>
            <div className="p-2 bg-white rounded-lg font-mono font-bold text-[#A36E35] border border-[#F4E3CD]">
              Mật khẩu tạm: {tempPasswordModal}
            </div>
            <p className="text-[#73766F] italic">Vui lòng gửi mật khẩu tạm này cho Khách thuê. Mật khẩu này chỉ hiển thị ĐÚNG 1 LẦN!</p>
            <Button variant="outline" size="sm" onClick={() => setTempPasswordModal(null)}>
              Đã Sao Chép
            </Button>
          </div>
        )}

        {tenant.account ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-[#F8F7F4] p-4 rounded-xl border border-[#E8E5DF]">
              <div>
                <span className="text-[#73766F] block">Tên đăng nhập (SĐT)</span>
                <span className="font-mono font-bold text-[#252724]">{tenant.account.phone}</span>
              </div>
              <div>
                <span className="text-[#73766F] block mb-1">Trạng thái</span>
                <Badge variant={tenant.account.isActive ? "success" : "danger"}>
                  {tenant.account.isActive ? "Hoạt Động" : "Tạm Khóa"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetPassword} disabled={loading}>
                <KeyRound className="w-3.5 h-3.5" /> Reset Mật Khẩu Tạm
              </Button>
              {tenant.account.isActive ? (
                <Button variant="danger" size="sm" onClick={handleToggleStatus} disabled={loading}>
                  <Lock className="w-3.5 h-3.5" /> Tạm Khóa Account
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleToggleStatus} disabled={loading}>
                  <Unlock className="w-3.5 h-3.5" /> Mở Khóa Account
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-3 bg-[#F8F7F4] p-4 rounded-xl border border-[#E8E5DF] text-xs">
            <span className="font-bold text-[#252724] block">Tạo Tài Khoản Cho Khách Thuê Này</span>
            {error && <div className="p-2 bg-[#FDF0F0] text-[#A84646] rounded-lg border border-[#F5D5D5]">{error}</div>}
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Số Điện Thoại Đăng Nhập (*)</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#252724] mb-1">Email Đăng Nhập (Không bắt buộc)</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              + Cấp Tài Khoản & Sinh Password Tạm
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
