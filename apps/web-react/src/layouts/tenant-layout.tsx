import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarNavSection } from "@/layouts/components/sidebar";
import { Header } from "@/layouts/components/header";
import { StagingBanner } from "@/layouts/components/staging-banner";
import { useAuth } from "@/auth/hooks/use-auth";

const tenantSections: SidebarNavSection[] = [
  {
    title: "TỔNG QUAN",
    items: [
      { label: "Trang chủ", href: "/tenant/dashboard", iconName: "dashboard" },
    ],
  },
  {
    title: "THÔNG TIN CỦA TÔI",
    items: [
      { label: "Phòng của tôi", href: "/tenant/room", iconName: "room" },
      { label: "Hợp đồng thuê", href: "/tenant/contract", iconName: "contract" },
      { label: "Hóa đơn thanh toán", href: "/tenant/invoices", iconName: "invoice" },
      { label: "Yêu cầu bảo trì", href: "/tenant/maintenance", iconName: "maintenance" },
      { label: "Hồ sơ cá nhân", href: "/tenant/profile", iconName: "tenant" },
    ],
  },
];

export const TenantLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <StagingBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          portalTitle="Tenant Portal"
          sections={tenantSections}
          userProfile={{
            name: user?.fullName || "Khách thuê",
            role: user?.role || "TENANT",
          }}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            title="Dịch Vụ Khách Thuê"
            userName={user?.fullName || "Khách thuê"}
            userRole={user?.role || "TENANT"}
          />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
