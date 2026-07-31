import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, translateInvoiceStatus } from "@/lib/formatters";
import { getTenantDashboardStats } from "@/features/dashboard/queries/get-tenant-dashboard-stats.query";
import { Home, Receipt, Wrench, Wifi, Calendar, CreditCard, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function TenantDashboardPage() {
  const stats = await getTenantDashboardStats();
  const currentInvoice = stats.currentInvoice;
  const statusInfo = currentInvoice ? translateInvoiceStatus(currentInvoice.status) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Header */}
      <div className="bg-[#1F2421] text-white rounded-2xl p-6 sm:p-8 border border-[#2E3632] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#3F594F]/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C8B8A8] tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cổng Thông Tin Khách Thuê</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
            Xin chào {stats.greetingName} 🌿
          </h2>
          <p className="text-xs text-[#A3A9A1]">
            Theo dõi hóa đơn tiền phòng, lịch sử thanh toán và thông tin tiện ích phòng trọ của bạn.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link href="/tenant/maintenance">
            <Button variant="secondary" size="md" className="bg-[#2E3632] text-white hover:bg-[#38423E] border border-[#3A453F]">
              <Wrench className="w-4 h-4 text-[#C8B8A8]" />
              <span>Gửi Báo Hỏng</span>
            </Button>
          </Link>
          <Link href="/tenant/invoices">
            <Button variant="primary" size="md">
              <CreditCard className="w-4 h-4" />
              <span>Thanh Toán Hóa Đơn</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Unpaid Invoice Highlight & Room Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Current Unpaid Invoice Highlight */}
        <div className="md:col-span-7 space-y-6">
          <Card
            className="border-[#C8B8A8]/60 bg-gradient-to-br from-white to-[#FDFCFB]"
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#3F594F]" />
                  <span>Hóa Đơn Cần Thanh Toán Kỳ Này</span>
                </div>
                {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
              </div>
            }
          >
            {!currentInvoice ? (
              <div className="py-8 text-center text-xs text-[#73766F] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#3E6148] mx-auto opacity-80" />
                <p className="font-medium text-[#252724]">Hiện không có hóa đơn cần thanh toán</p>
                <p className="text-[11px] text-[#A3A69F]">Bạn đã hoàn tất tất cả nghĩa vụ tài chính kỳ này.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#73766F]">Mã Hóa Đơn: <strong className="text-[#252724] font-medium">{currentInvoice.code}</strong></p>
                    <p className="text-xs text-[#73766F] mt-0.5">Hạn thanh toán: <strong className="text-[#A84646] font-semibold">{currentInvoice.dueDate}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#73766F]">Tổng tiền hóa đơn</p>
                    <p className="text-sm font-semibold text-[#252724]">{formatCurrency(currentInvoice.amount)}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#EBF3ED] border border-[#D1E3D5] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#3E6148] font-medium block">Số tiền còn thiếu cần trả:</span>
                    <h3 className="text-2xl font-bold text-[#3E6148] tracking-tight mt-0.5">
                      {formatCurrency(currentInvoice.remainingAmount)}
                    </h3>
                  </div>
                  <Link href={`/tenant/invoices/${currentInvoice.id}`}>
                    <Button variant="primary" size="md">
                      <span>Quét Mã VietQR</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-[#73766F] space-y-1 pt-1">
                  <p>• Đã thanh toán trước đó: <strong>{formatCurrency(currentInvoice.paidAmount)}</strong></p>
                  <p>• Sau khi chuyển khoản, hệ thống sẽ tự động đối soát và cập nhật trạng thái hóa đơn của bạn trong vòng vài giây.</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Room Details & Wifi */}
        <div className="md:col-span-5 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#3F594F]" />
                <span>Thông Tin Phòng Trọ</span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] space-y-1">
                <p className="text-base font-bold text-[#252724]">Phòng {stats.roomNumber}</p>
                <p className="text-xs text-[#52554E] font-medium">{stats.buildingName}</p>
                <p className="text-[11px] text-[#73766F]">{stats.buildingAddress}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EEF4F8] border border-[#D4E3ED] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#4D6779] flex items-center justify-center shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#252724]">Mật Khẩu Internet / Wifi</p>
                  <p className="text-xs text-[#4D6779] font-mono mt-0.5">{stats.wifiInfo}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#73766F] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#252724]">Hạn Hợp Đồng Thuê</p>
                  <p className="text-xs text-[#73766F] mt-0.5">Thời hạn đến: {stats.contractEnd}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
