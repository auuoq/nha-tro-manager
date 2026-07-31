import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarNavSection } from "@/layouts/components/sidebar";
import { Header } from "@/layouts/components/header";
import { StagingBanner } from "@/layouts/components/staging-banner";
import { useAuth } from "@/auth/hooks/use-auth";

const ownerSections: SidebarNavSection[] = [
  {
    title: "TỔNG QUAN",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", iconName: "dashboard" },
    ],
  },
  {
    title: "QUẢN LÝ VẬN HÀNH",
    items: [
      { label: "Tòa nhà", href: "/admin/buildings", iconName: "building" },
      { label: "Phòng trọ", href: "/admin/rooms", iconName: "room" },
      { label: "Khách thuê", href: "/admin/tenants", iconName: "tenant" },
      { label: "Hợp đồng", href: "/admin/contracts", iconName: "contract" },
    ],
  },
  {
    title: "ĐIỆN NƯỚC & HÓA ĐƠN",
    items: [
      { label: "Chỉ số điện nước", href: "/admin/meters", iconName: "meter" },
      { label: "Hóa đơn", href: "/admin/invoices", iconName: "invoice" },
      { label: "Thanh toán", href: "/admin/payments", iconName: "payment" },
    ],
  },
  {
    title: "YÊU CẦU & HỆ THỐNG",
    items: [
      { label: "Yêu cầu bảo trì", href: "/admin/maintenance", iconName: "maintenance" },
      { label: "Nhật ký hoạt động", href: "/admin/audit-logs", iconName: "audit" },
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
          portalTitle="Owner Portal"
          sections={ownerSections}
          userProfile={{
            name: user?.fullName || "Chủ nhà",
            role: user?.role || "OWNER",
          }}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            title="Quản Lý Vận Hành"
            userName={user?.fullName || "Chủ nhà"}
            userRole={user?.role || "OWNER"}
          />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
