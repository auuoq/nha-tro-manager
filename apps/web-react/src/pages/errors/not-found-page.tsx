import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { FileQuestion } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E5DF] shadow-lg max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F2EFE9] text-[#73766F] flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#252724]">404 - Trang không tồn tại</h1>
        <p className="text-xs text-[#73766F] mt-2 mb-6 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển.
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
