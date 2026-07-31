import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, translateInvoiceStatus } from "@/lib/formatters";
import { getAdminDashboardStats } from "@/features/dashboard/queries/get-admin-dashboard-stats.query";
import {
  Building2,
  DoorOpen,
  TrendingUp,
  AlertCircle,
  Clock,
  Wrench,
  ChevronRight,
  Plus,
  Zap,
  Receipt,
  FileText,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng ☀️";
    if (hour < 18) return "Chào buổi chiều 🌿";
    return "Chào buổi tối 🌙";
  };

  const kpis = [
    {
      title: "Tỷ lệ Lấp Đầy",
      value: `${stats.occupancyRate}%`,
      subtext: `${stats.rentedRooms} / ${stats.totalRooms} phòng đang thuê`,
      icon: DoorOpen,
      badge: `${stats.occupancyRate}% Hoạt động`,
      variant: "success" as const,
    },
    {
      title: "Doanh Thu Tháng Này",
      value: formatCurrency(stats.monthlyRevenue),
      subtext: `Đã thu: ${formatCurrency(stats.collectedRevenue)}`,
      icon: TrendingUp,
      badge: stats.monthlyRevenue > 0 ? "+Doanh thu" : "Chưa phát hành",
      variant: "success" as const,
    },
    {
      title: "Công Nợ Chưa Thu",
      value: formatCurrency(stats.unpaidDebt),
      subtext: `${stats.unpaidInvoicesCount} hóa đơn chưa thu đủ`,
      icon: AlertCircle,
      badge: stats.unpaidDebt > 0 ? "Cần theo dõi" : "Không có nợ",
      variant: stats.unpaidDebt > 0 ? ("danger" as const) : ("success" as const),
    },
    {
      title: "Số Tòa Nhà Vận Hành",
      value: `${stats.totalBuildings} Tòa nhà`,
      subtext: stats.buildingNamesSummary,
      icon: Building2,
      badge: stats.totalBuildings > 0 ? "Hoạt động tốt" : "Khởi tạo",
      variant: "info" as const,
    },
    {
      title: "Báo Hỏng Đang Xử Lý",
      value: `${stats.pendingMaintenanceCount} Yêu cầu`,
      subtext: stats.urgentMaintenanceCount > 0 ? `${stats.urgentMaintenanceCount} sự cố ưu tiên cao` : "Trạng thái bình thường",
      icon: Wrench,
      badge: stats.pendingMaintenanceCount > 0 ? "Đang xử lý" : "Sạch sự cố",
      variant: stats.pendingMaintenanceCount > 0 ? ("warning" as const) : ("success" as const),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Greeting Section */}
      <div className="bg-[#1F2421] text-white rounded-2xl p-6 sm:p-8 border border-[#2E3632] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#3F594F]/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C8B8A8] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getGreeting()}, {stats.greetingName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
            Tổng quan hiệu suất & danh mục nhà trọ hôm nay
          </h2>
          <p className="text-xs text-[#A3A9A1]">
            Hệ thống tự động đồng bộ doanh thu, chỉ số điện nước và trạng thái công nợ theo thời gian thực từ cơ sở dữ liệu.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link href="/admin/meters">
            <Button variant="secondary" size="md" className="bg-[#2E3632] text-white hover:bg-[#38423E] border border-[#3A453F]">
              <Zap className="w-4 h-4 text-[#C8B8A8]" />
              <span>Chốt Điện Nước</span>
            </Button>
          </Link>
          <Link href="/admin/invoices">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Tạo Hóa Đơn Mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-3.5 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:border-[#C8B8A8] transition-all p-4 sm:p-4.5 hover:-translate-y-0.5 min-w-0 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F2EFE9] text-[#3F594F] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant={kpi.variant} className="whitespace-nowrap shrink-0">{kpi.badge}</Badge>
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs text-[#73766F] font-medium truncate" title={kpi.title}>{kpi.title}</p>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#252724] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mt-1" title={kpi.value}>{kpi.value}</h3>
                <p className="text-[11px] text-[#A3A69F] truncate" title={kpi.subtext}>{kpi.subtext}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3F594F]" />
                <span>Việc Cần Xử Lý Sớm</span>
              </div>
            }
            subtitle="Danh sách tác vụ ưu tiên theo thời gian thực"
          >
            <div className="divide-y divide-[#F2EFE9]">
              {stats.actionItems.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-[#F8F7F4]/50 p-2 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#252724]">{item.title}</h4>
                      <Badge variant="neutral" className="text-[10px]">{item.tag}</Badge>
                    </div>
                    <p className="text-xs text-[#73766F]">{item.desc}</p>
                  </div>
                  <Link href={item.link}>
                    <Button variant="outline" size="sm" className="shrink-0 text-xs">
                      <span>{item.btnText}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#73766F]" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Overdue Invoices List */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#A84646]" />
                  <span>Hóa Đơn Quá Hạn & Công Nợ</span>
                </div>
                <Link href="/admin/invoices" className="text-xs text-[#3F594F] hover:underline font-medium">
                  Xem tất cả
                </Link>
              </div>
            }
          >
            {stats.overdueInvoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#73766F] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#3E6148] mx-auto opacity-80" />
                <p className="font-medium text-[#252724]">Không có hóa đơn tồn đọng công nợ</p>
                <p className="text-[11px] text-[#A3A69F]">Tất cả khách thuê đã hoàn tất thanh toán hóa đơn.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E5DF] text-[#73766F] font-semibold bg-[#F2EFE9]/50">
                      <th className="py-2.5 px-3 rounded-l-lg">Mã Hóa Đơn</th>
                      <th className="py-2.5 px-3">Phòng</th>
                      <th className="py-2.5 px-3">Khách Thuê</th>
                      <th className="py-2.5 px-3 text-right">Còn Thiếu</th>
                      <th className="py-2.5 px-3 rounded-r-lg text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EFE9]">
                    {stats.overdueInvoices.map((inv) => {
                      const statusInfo = translateInvoiceStatus(inv.status);
                      return (
                        <tr key={inv.code} className="hover:bg-[#F8F7F4] transition-colors">
                          <td className="py-3 px-3 font-medium text-[#252724]">{inv.code}</td>
                          <td className="py-3 px-3 text-[#52554E]">{inv.roomNumber}</td>
                          <td className="py-3 px-3 text-[#52554E]">{inv.tenantName}</td>
                          <td className="py-3 px-3 text-right font-semibold text-[#A84646]">
                            {formatCurrency(inv.remainingAmount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#A36E35]" />
                <span>Hợp Đồng Sắp Hết Hạn</span>
              </div>
            }
            subtitle="Cần gia hạn hoặc thanh lý trong 30 ngày tới"
          >
            {stats.expiringContracts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#73766F] space-y-1">
                <p className="font-medium text-[#252724]">Không có hợp đồng sắp hết hạn</p>
                <p className="text-[11px] text-[#A3A69F]">Tất cả hợp đồng thuê đều đang trong hạn dài.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.expiringContracts.map((c) => (
                  <div key={c.code} className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#252724]">{c.roomNumber} - {c.tenantName}</p>
                      <p className="text-[11px] text-[#73766F] mt-0.5">Hạn hợp đồng: {c.endDate}</p>
                    </div>
                    <Badge variant="warning">{c.daysLeft}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Room Status Summary */}
          <Card title="Trạng Thái Sơ Đồ Phòng Trọ">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F2EFE9]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3E6148]" />
                  <span className="text-[#52554E]">Phòng đang thuê</span>
                </div>
                <span className="font-semibold text-[#252724]">
                  {stats.rentedRooms} phòng ({stats.occupancyRate}%)
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F2EFE9]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8C765C]" />
                  <span className="text-[#52554E]">Phòng còn trống</span>
                </div>
                <span className="font-semibold text-[#252724]">
                  {stats.vacantRooms} phòng ({stats.totalRooms > 0 ? Math.round((stats.vacantRooms / stats.totalRooms) * 100) : 0}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A36E35]" />
                  <span className="text-[#52554E]">Đang bảo trì</span>
                </div>
                <span className="font-semibold text-[#252724]">
                  {stats.maintenanceRooms} phòng ({stats.totalRooms > 0 ? Math.round((stats.maintenanceRooms / stats.totalRooms) * 100) : 0}%)
                </span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
