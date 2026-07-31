import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSuperAdminDashboardStats } from "@/features/dashboard/queries/get-super-admin-dashboard-stats.query";
import { Users, Building2, UserCheck, ArrowRight, Sparkles, Plus, CheckCircle2 } from "lucide-react";

export default async function SuperAdminDashboardPage() {
  const stats = await getSuperAdminDashboardStats();

  const statCards = [
    {
      title: "Tổng Số Chủ Nhà (Owners)",
      value: `${stats.totalOwners} Chủ nhà`,
      subtext: `${stats.activeOwners} Đang hoạt động, ${stats.suspendedOwners} Tạm khóa`,
      icon: Users,
      badge: "Hệ thống v1.0",
      variant: "success" as const,
    },
    {
      title: "Tổng Tòa Nhà Vận Hành",
      value: `${stats.totalBuildings} Tòa nhà`,
      subtext: `Tổng số ${stats.totalRooms} phòng trọ toàn sàn`,
      icon: Building2,
      badge: stats.totalBuildings > 0 ? "Vận hành tốt" : "Khởi tạo",
      variant: "info" as const,
    },
    {
      title: "Tổng Khách Thuê Hoạt Động",
      value: `${stats.totalTenants} Khách thuê`,
      subtext: `Tỷ lệ lấp đầy toàn sàn ${stats.platformOccupancyRate}%`,
      icon: UserCheck,
      badge: `${stats.platformOccupancyRate}% Lấp đầy`,
      variant: "success" as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-[#1F2421] text-white rounded-2xl p-6 sm:p-8 border border-[#2E3632] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#3F594F]/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C8B8A8] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trung tâm Quản trị Hệ thống</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
            Tổng quan nền tảng Nhà Trọ Manager
          </h2>
          <p className="text-xs text-[#A3A9A1]">
            Theo dõi danh sách Chủ nhà, quy mô tòa nhà vận hành và nhật ký Audit Log toàn sàn theo thời gian thực.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link href="/super-admin/owners">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Cấp Tài Khoản Chủ Nhà</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} className="hover:border-[#C8B8A8] transition-all p-6 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F2EFE9] text-[#3F594F] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant={s.variant} className="whitespace-nowrap shrink-0">{s.badge}</Badge>
              </div>
              <p className="text-xs text-[#73766F] font-medium truncate">{s.title}</p>
              <h3 className="text-2xl font-semibold text-[#252724] tracking-tight mt-1 whitespace-nowrap">{s.value}</h3>
              <p className="text-xs text-[#A3A69F] mt-1 truncate">{s.subtext}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Owners Table */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3F594F]" />
              <span>Danh Sách Chủ Nhà Gần Đây</span>
            </div>
            <Link href="/super-admin/owners" className="text-xs text-[#3F594F] hover:underline font-medium flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      >
        {stats.recentOwners.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#73766F] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#3F594F] mx-auto opacity-70" />
            <p className="font-medium text-[#252724]">Chưa có chủ nhà nào trong hệ thống</p>
            <p className="text-[11px] text-[#A3A69F]">Nhấn nút "Cấp Tài Khoản Chủ Nhà" ở trên để khởi tạo chủ nhà đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E5DF] text-[#73766F] font-semibold bg-[#F2EFE9]/50">
                  <th className="py-3 px-4 rounded-l-xl">Tên Chủ Nhà</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Tên Doanh Nghiệp</th>
                  <th className="py-3 px-4 text-center">Số Tòa Nhà</th>
                  <th className="py-3 px-4 rounded-r-xl text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE9]">
                {stats.recentOwners.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#252724]">{o.name}</td>
                    <td className="py-3.5 px-4 text-[#52554E] font-mono">{o.phone}</td>
                    <td className="py-3.5 px-4 text-[#52554E]">{o.businessName}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-[#252724]">{o.buildingsCount} tòa</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={o.status === "ACTIVE" ? "success" : "danger"}>
                        {o.status === "ACTIVE" ? "Đang hoạt động" : "Tạm khóa"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
