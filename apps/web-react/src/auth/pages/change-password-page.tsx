import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { authApi } from "@/auth/api/auth.api";
import { KeyRound } from "lucide-react";

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      localStorage.clear();
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E5DF] shadow-lg max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF0ED] border border-[#D1E3D5] text-[#3F594F] flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#252724]">Đổi Mật Khẩu</h1>
            <p className="text-xs text-[#73766F]">Cập nhật mật khẩu cá nhân</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-[#A84646] bg-[#FDF0F0] border border-[#F5D5D5] rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#252724]">Mật khẩu hiện tại</label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#252724]">Mật khẩu mới</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#252724]">Xác nhận mật khẩu mới</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        </form>
      </div>
    </div>
  );
};
