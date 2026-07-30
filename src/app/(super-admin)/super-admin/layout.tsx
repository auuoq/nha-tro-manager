import React from "react";
import { Sidebar, SidebarNavSection } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const superAdminSections: SidebarNavSection[] = [
    {
      title: "Tổng Quan",
      items: [
        { label: "Tổng Quan Nền Tảng", href: "/super-admin/dashboard", iconName: "dashboard" },
      ],
    },
    {
      title: "Vận Hành Nền Tảng",
      items: [
        { label: "Quản Lý Chủ Nhà", href: "/super-admin/owners", iconName: "owner" },
        { label: "System Audit Logs", href: "/super-admin/audit-logs", iconName: "audit" },
      ],
    },
    {
      title: "Hệ Thống",
      items: [
        { label: "Cấu Hình Hệ Thống", href: "/super-admin/system-settings", iconName: "settings" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      <Sidebar portalTitle="Super Admin Portal" sections={superAdminSections} userProfile={{ name: "Super Admin", role: "SUPER_ADMIN" }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Quản Trị Nền Tảng" userName="Super Admin" userRole="SUPER_ADMIN" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
