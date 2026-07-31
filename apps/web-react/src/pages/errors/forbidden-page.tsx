import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { ShieldAlert } from "lucide-react";

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E5DF] shadow-lg max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FBF3E8] text-[#A36E35] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#252724]">403 - Không có quyền truy cập</h1>
        <p className="text-xs text-[#73766F] mt-2 mb-6 leading-relaxed">
          Tài khoản của bạn không có quyền truy cập vào tài nguyên này.
        </p>
        <Link to="/login">
          <Button variant="primary" className="w-full">
            Quay lại trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};
