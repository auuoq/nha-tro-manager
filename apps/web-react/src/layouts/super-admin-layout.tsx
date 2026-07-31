import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarNavSection } from "@/layouts/components/sidebar";
import { Header } from "@/layouts/components/header";
import { StagingBanner } from "@/layouts/components/staging-banner";
import { useAuth } from "@/auth/hooks/use-auth";

const superAdminSections: SidebarNavSection[] = [
  {
    title: "TỔNG QUAN HỆ THỐNG",
    items: [
      { label: "Dashboard", href: "/super-admin/dashboard", iconName: "dashboard" },
    ],
  },
  {
    title: "QUẢN TRỊ HỆ THỐNG",
    items: [
      { label: "Quản lý Chủ nhà", href: "/super-admin/owners", iconName: "owner" },
      { label: "Cấu hình Hệ thống", href: "/super-admin/system-settings", iconName: "settings" },
      { label: "Nhật ký Hệ thống", href: "/super-admin/audit-logs", iconName: "audit" },
    ],
  },
];

export const SuperAdminLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <StagingBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          portalTitle="Super Admin Portal"
          sections={superAdminSections}
          userProfile={{
            name: user?.fullName || "Quản trị viên",
            role: user?.role || "SUPER_ADMIN",
          }}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            title="Quản Trị Hệ Thống"
            userName={user?.fullName || "Quản trị viên"}
            userRole={user?.role || "SUPER_ADMIN"}
          />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
