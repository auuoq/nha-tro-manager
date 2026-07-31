import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarNavSection } from "@/layouts/components/sidebar";
import { Header } from "@/layouts/components/header";
import { StagingBanner } from "@/layouts/components/staging-banner";
import { useAuth } from "@/auth/hooks/use-auth";

const ownerSections: SidebarNavSection[] = [
  {
    title: "Tổng Quan",
    items: [
      { label: "Tổng Quan", href: "/admin/dashboard", iconName: "dashboard" },
      { label: "Tòa Nhà", href: "/admin/buildings", iconName: "building" },
      { label: "Sơ Đồ Phòng", href: "/admin/rooms", iconName: "room" },
    ],
  },
  {
    title: "Vận Hành",
    items: [
      { label: "Khách Thuê", href: "/admin/tenants", iconName: "tenant" },
      { label: "Hợp Đồng", href: "/admin/contracts", iconName: "contract" },
      { label: "Chốt Điện Nước", href: "/admin/meters", iconName: "meter" },
      { label: "Báo Hỏng", href: "/admin/maintenance", iconName: "maintenance" },
    ],
  },
  {
    title: "Tài Chính",
    items: [
      { label: "Hóa Đơn", href: "/admin/invoices", iconName: "invoice" },
      { label: "Thanh Toán", href: "/admin/payments", iconName: "payment" },
    ],
  },
  {
    title: "Hệ Thống",
    items: [
      { label: "Audit Logs", href: "/admin/audit-logs", iconName: "audit" },
    ],
  },
];

export const OwnerLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <StagingBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          portalTitle="Owner Management"
          sections={ownerSections}
          userProfile={{
            name: user?.fullName || "Chủ Nhà",
            role: user?.role || "OWNER",
          }}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            title="Quản Lý Vận Hành"
            userName={user?.fullName || "Chủ Nhà"}
            userRole={user?.role || "OWNER"}
          />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
