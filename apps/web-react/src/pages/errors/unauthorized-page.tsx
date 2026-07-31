import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Lock } from "lucide-react";

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E5DF] shadow-lg max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FDF0F0] text-[#A84646] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#252724]">401 - Chưa đăng nhập</h1>
        <p className="text-xs text-[#73766F] mt-2 mb-6 leading-relaxed">
          Bạn cần đăng nhập tài khoản hợp lệ để truy cập hệ thống quản lý.
        </p>
        <Link to="/login">
          <Button variant="primary" className="w-full">
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    </div>
  );
};
