import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, translateInvoiceStatus } from "@/lib/formatters";
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
  Sparkles
} from "lucide-react";

export default function AdminDashboardPage() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng ☀️";
    if (hour < 18) return "Chào buổi chiều 🌿";
    return "Chào buổi tối 🌙";
  };

  const kpis = [
    {
      title: "Tỷ lệ Lấp Đầy",
      value: "85%",
      subtext: "17 / 20 phòng đang thuê",
      icon: DoorOpen,
      badge: "85% Hoạt động",
      variant: "success" as const,
    },
    {
      title: "Doanh Thu Tháng Này",
      value: formatCurrency(68500000),
      subtext: `Đã thu: ${formatCurrency(52000000)}`,
      icon: TrendingUp,
      badge: "+12% so tháng trước",
      variant: "success" as const,
    },
    {
      title: "Công Nợ Chưa Thu",
      value: formatCurrency(16500000),
      subtext: "3 hóa đơn chưa thanh toán",
      icon: AlertCircle,
      badge: "Cần theo dõi",
      variant: "danger" as const,
    },
    {
      title: "Số Tòa Nhà Vận Hành",
      value: "2 Tòa nhà",
      subtext: "Tòa UAT Yên Hòa & Cầu Giấy",
      icon: Building2,
      badge: "Hoạt động tốt",
      variant: "info" as const,
    },
    {
      title: "Báo Hỏng Đang Xử Lý",
      value: "2 Yêu cầu",
      subtext: "1 sự cố ưu tiên cao",
      icon: Wrench,
      badge: "Đang xử lý",
      variant: "warning" as const,
    },
  ];

  const actionItems = [
    {
      id: "act-1",
      title: "Chốt chỉ số Điện/Nước tháng 07",
      desc: "Còn 3 phòng chưa chốt chỉ số điện nước cuối kỳ",
      link: "/admin/meters",
      btnText: "Chốt chỉ số",
      tag: "Vận hành",
    },
    {
      id: "act-2",
      title: "Duyệt báo hỏng Phòng 201 - Điều hòa kêu to",
      desc: "Khách thuê Nguyễn Văn UAT vừa gửi báo hỏng sáng nay",
      link: "/admin/maintenance",
      btnText: "Xem yêu cầu",
      tag: "Sự cố",
    },
    {
      id: "act-3",
      title: "Gửi nhắc nhở hóa đơn quá hạn",
      desc: `Hóa đơn INV-UAT-001 quá hạn 5 ngày (${formatCurrency(410000)})`,
      link: "/admin/invoices",
      btnText: "Gửi nhắc nhở",
      tag: "Tài chính",
    },
  ];

  const overdueInvoices = [
    { code: "INV-202607-001", room: "Phòng 201", tenant: "Nguyễn Văn UAT", amount: 410000, dueDate: "25/07/2026", statusCode: "PARTIALLY_PAID" },
    { code: "INV-202607-004", room: "Phòng 102", tenant: "Trần Thị Mai", amount: 4800000, dueDate: "20/07/2026", statusCode: "OVERDUE" },
    { code: "INV-202607-009", room: "Phòng 304", tenant: "Lê Hoàng Nam", amount: 5100000, dueDate: "22/07/2026", statusCode: "OVERDUE" },
  ];

  const expiringContracts = [
    { code: "HD-201-UAT", room: "Phòng 201", tenant: "Nguyễn Văn UAT", endDate: "15/08/2026", daysLeft: "16 ngày" },
    { code: "HD-104-CG", room: "Phòng 104", tenant: "Phạm Minh Đức", endDate: "20/08/2026", daysLeft: "21 ngày" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Greeting Section */}
      <div className="bg-[#1F2421] text-white rounded-2xl p-6 sm:p-8 border border-[#2E3632] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#3F594F]/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C8B8A8] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getGreeting()}, Chủ Nhà</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
            Tổng quan hiệu suất & danh mục nhà trọ hôm nay
          </h2>
          <p className="text-xs text-[#A3A9A1]">
            Hệ thống tự động đồng bộ doanh thu, chỉ số điện nước và trạng thái công nợ theo thời gian thực.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:border-[#C8B8A8] transition-all p-5 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#F2EFE9] text-[#3F594F] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant={kpi.variant}>{kpi.badge}</Badge>
              </div>
              <p className="text-xs text-[#73766F] font-medium">{kpi.title}</p>
              <h3 className="text-lg sm:text-xl font-semibold text-[#252724] tracking-tight mt-1">{kpi.value}</h3>
              <p className="text-[11px] text-[#A3A69F] mt-1">{kpi.subtext}</p>
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
            subtitle="Danh sách tác vụ ưu tiên cho quản lý vận hành"
          >
            <div className="divide-y divide-[#F2EFE9]">
              {actionItems.map((item) => (
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
                  {overdueInvoices.map((inv) => {
                    const statusInfo = translateInvoiceStatus(inv.statusCode);
                    return (
                      <tr key={inv.code} className="hover:bg-[#F8F7F4] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#252724]">{inv.code}</td>
                        <td className="py-3 px-3 text-[#52554E]">{inv.room}</td>
                        <td className="py-3 px-3 text-[#52554E]">{inv.tenant}</td>
                        <td className="py-3 px-3 text-right font-semibold text-[#A84646]">
                          {formatCurrency(inv.amount)}
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
            <div className="space-y-3">
              {expiringContracts.map((c) => (
                <div key={c.code} className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#252724]">{c.room} - {c.tenant}</p>
                    <p className="text-[11px] text-[#73766F] mt-0.5">Hạn hợp đồng: {c.endDate}</p>
                  </div>
                  <Badge variant="warning">{c.daysLeft}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Room Status Summary */}
          <Card title="Trạng Thái Sơ Đồ Phòng Trọ">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F2EFE9]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3E6148]" />
                  <span className="text-[#52554E]">Phòng đang thuê</span>
                </div>
                <span className="font-semibold text-[#252724]">17 phòng (85%)</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F2EFE9]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8C765C]" />
                  <span className="text-[#52554E]">Phòng còn trống</span>
                </div>
                <span className="font-semibold text-[#252724]">2 phòng (10%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A36E35]" />
                  <span className="text-[#52554E]">Đang bảo trì</span>
                </div>
                <span className="font-semibold text-[#252724]">1 phòng (5%)</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
