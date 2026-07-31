import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/auth/hooks/use-auth";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  Zap,
  Receipt,
  CreditCard,
  Wrench,
  ShieldCheck,
  LogOut,
  Settings,
  HelpCircle
} from "lucide-react";
import { translateUserRole } from "@/shared/lib/formatters";

export type IconType =
  | "dashboard"
  | "building"
  | "room"
  | "tenant"
  | "contract"
  | "meter"
  | "invoice"
  | "payment"
  | "maintenance"
  | "audit"
  | "owner"
  | "settings";

const iconMap: Record<IconType, React.ElementType> = {
  dashboard: LayoutDashboard,
  building: Building2,
  room: DoorOpen,
  tenant: Users,
  contract: FileText,
  meter: Zap,
  invoice: Receipt,
  payment: CreditCard,
  maintenance: Wrench,
  audit: ShieldCheck,
  owner: Users,
  settings: Settings,
};

export interface SidebarNavSection {
  title: string;
  items: {
    label: string;
    href: string;
    iconName: IconType;
  }[];
}

export interface SidebarProps {
  portalTitle?: string;
  sections: SidebarNavSection[];
  userProfile?: {
    name: string;
    role: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalTitle = "Boutique Manager",
  sections,
  userProfile = { name: "Quản trị viên", role: "ADMIN" },
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#1F2421] text-[#D9DDD8] flex flex-col border-r border-[#2A312C] h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[#2A312C]/60">
        <div className="w-8 h-8 rounded-lg bg-[#3F594F] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
          N
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-wide">NHÀ TRỌ MANAGER</h1>
          <p className="text-[11px] text-[#868D84] tracking-wider uppercase">{portalTitle}</p>
        </div>
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx}>
            <p className="px-3 text-[11px] uppercase tracking-wider font-semibold text-[#6E7B73] mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.iconName] || HelpCircle;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    item.href !== "/super-admin/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-[#2E3632] text-white font-semibold shadow-xs border-l-2 border-[#C8B8A8] pl-2.5"
                        : "text-[#B2B8AF] hover:bg-[#282F2B] hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-[#C8B8A8]" : "text-[#7B837A] group-hover:text-white"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#2A312C]/60 bg-[#1A1E1B]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#242A26] border border-[#2E3632]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#3F594F] text-[#EBF0ED] font-semibold text-xs flex items-center justify-center shrink-0">
              {userProfile.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{userProfile.name}</p>
              <p className="text-[10px] text-[#868D84] uppercase tracking-wider">{translateUserRole(userProfile.role)}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            type="button"
            title="Đăng xuất"
            className="p-1.5 text-[#7B837A] hover:text-white hover:bg-[#2E3632] rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
