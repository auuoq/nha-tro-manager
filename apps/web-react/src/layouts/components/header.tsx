import React from "react";
import { LogOut } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useAuth } from "@/auth/hooks/use-auth";
import { translateUserRole } from "@/shared/lib/formatters";

export interface HeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Quản Lý Vận Hành",
  userName = "Chủ Nhà",
  userRole = "OWNER",
}) => {
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E8E5DF] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#73766F] uppercase tracking-wider">Hệ Thống</span>
        <span className="text-[#D9D5CC]">/</span>
        <span className="text-sm font-medium text-[#252724]">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-[#E8E5DF]">
          <div className="w-8 h-8 rounded-full bg-[#EBF0ED] border border-[#D1E3D5] text-[#3F594F] flex items-center justify-center font-semibold text-xs shrink-0">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-[#252724]">{userName}</p>
            <Badge variant="neutral" className="text-[10px] py-0 px-1.5 font-medium mt-0.5">
              {translateUserRole(userRole)}
            </Badge>
          </div>
          <button
            onClick={() => logout()}
            type="button"
            title="Đăng xuất"
            className="p-2 text-[#73766F] hover:text-[#A84646] hover:bg-[#FDF0F0] rounded-xl transition-colors shrink-0 ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
