import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/auth/hooks/use-auth";
import { invoicesApi } from "@/features/invoices/api/invoices.api";
import { Invoice } from "@/features/invoices/types/invoice.types";
import { formatCurrency } from "@/shared/lib/formatters";
import {
  Building2, DoorOpen, Users, Receipt, Home, Wrench, Wifi,
  Calendar, CreditCard, ArrowRight, ShieldCheck, CheckCircle2
} from "lucide-react";

export const OwnerDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng Quan Vận Hành"
        description="Theo dõi tình hình kinh doanh, doanh thu và vận hành nhà trọ."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-[#73766F] uppercase tracking-wider font-semibold">Tòa nhà</CardTitle>
            <Building2 className="w-4 h-4 text-[#3F594F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#252724]">--</div>
            <p className="text-[11px] text-[#73766F] mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-[#73766F] uppercase tracking-wider font-semibold">Phòng trọ</CardTitle>
            <DoorOpen className="w-4 h-4 text-[#3F594F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#252724]">--</div>
            <p className="text-[11px] text-[#73766F] mt-1">Tổng số phòng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-[#73766F] uppercase tracking-wider font-semibold">Khách thuê</CardTitle>
            <Users className="w-4 h-4 text-[#3F594F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#252724]">--</div>
            <p className="text-[11px] text-[#73766F] mt-1">Khách đang ở</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-[#73766F] uppercase tracking-wider font-semibold">Hóa đơn</CardTitle>
            <Receipt className="w-4 h-4 text-[#3F594F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#252724]">--</div>
            <p className="text-[11px] text-[#73766F] mt-1">Chờ thanh toán</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const TenantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    invoicesApi
      .listTenantInvoices({ pageSize: 5 })
      .then((res) => {
        const unpaid = res.items.find((i) => i.status === "ISSUED" || i.status === "PARTIALLY_PAID" || i.status === "OVERDUE");
        setCurrentInvoice(unpaid || res.items[0] || null);
      })
      .catch(() => {
        setCurrentInvoice(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Welcome Header */}
      <div className="bg-[#1F2421] text-white rounded-2xl p-6 sm:p-8 border border-[#2E3632] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#3F594F]/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C8B8A8] tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cổng Thông Tin Khách Thuê</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
            Xin chào {user?.fullName || "Khách thuê"} 🌿
          </h2>
          <p className="text-xs text-[#A3A9A1]">
            Theo dõi hóa đơn tiền phòng, lịch sử thanh toán và thông tin tiện ích phòng trọ của bạn.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link to="/tenant/invoices">
            <Button variant="primary" size="md" className="bg-gradient-to-r from-[#3F594F] to-[#344B42] text-white">
              <CreditCard className="w-4 h-4 mr-1.5" />
              <span>Thanh Toán Hóa Đơn</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Unpaid Invoice Highlight & Room Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Current Unpaid Invoice Highlight */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border-[#C8B8A8]/60 bg-gradient-to-br from-white to-[#FDFCFB]">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#F2EFE9]">
              <div className="flex items-center gap-2 font-semibold text-sm text-[#252724]">
                <Receipt className="w-4 h-4 text-[#3F594F]" />
                <span>Hóa Đơn Cần Thanh Toán Kỳ Này</span>
              </div>
              {currentInvoice && (
                <Badge variant={currentInvoice.status === "PAID" ? "success" : currentInvoice.status === "OVERDUE" ? "danger" : "warning"}>
                  {currentInvoice.status === "PAID" ? "Đã thanh toán" : currentInvoice.status === "OVERDUE" ? "Quá hạn" : "Chờ thanh toán"}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="pt-4">
              {loading ? (
                <div className="py-8 text-center text-xs text-[#73766F]">Đang tải dữ liệu hóa đơn...</div>
              ) : !currentInvoice || currentInvoice.status === "PAID" ? (
                <div className="py-8 text-center text-xs text-[#73766F] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#3E6148] mx-auto opacity-80" />
                  <p className="font-medium text-[#252724]">Hiện không có hóa đơn cần thanh toán</p>
                  <p className="text-[11px] text-[#A3A69F]">Bạn đã hoàn tất tất cả nghĩa vụ tài chính kỳ này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[#73766F]">Mã Hóa Đơn: <strong className="text-[#252724] font-medium">{currentInvoice.invoiceCode}</strong></p>
                      <p className="text-[#73766F] mt-0.5">Hạn thanh toán: <strong className="text-[#A84646] font-semibold">{new Date(currentInvoice.dueDate).toLocaleDateString("vi-VN")}</strong></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#73766F]">Tổng tiền hóa đơn</p>
                      <p className="text-sm font-semibold text-[#252724]">{formatCurrency(currentInvoice.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#EBF3ED] border border-[#D1E3D5] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#3E6148] font-medium block">Số tiền còn thiếu cần trả:</span>
                      <h3 className="text-2xl font-bold text-[#3E6148] tracking-tight mt-0.5">
                        {formatCurrency(currentInvoice.remainingAmount)}
                      </h3>
                    </div>
                    <Link to={`/tenant/invoices/${currentInvoice.id}`}>
                      <Button variant="primary" size="md">
                        <span>Quét Mã VietQR</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>

                  <div className="text-[11px] text-[#73766F] space-y-1 pt-1">
                    <p>• Đã thanh toán trước đó: <strong>{formatCurrency(currentInvoice.paidAmount)}</strong></p>
                    <p>• Sau khi chuyển khoản, hệ thống sẽ tự động đối soát và cập nhật trạng thái hóa đơn của bạn trong vòng vài giây.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Room Details & Wifi */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-[#F2EFE9]">
              <div className="flex items-center gap-2 font-semibold text-sm text-[#252724]">
                <Home className="w-4 h-4 text-[#3F594F]" />
                <span>Thông Tin Phòng Trọ</span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] space-y-1">
                <p className="text-base font-bold text-[#252724]">Phòng 101 - Standard Studio</p>
                <p className="text-xs text-[#52554E] font-medium">Tòa Nhà Staging Boutique Q1</p>
                <p className="text-[11px] text-[#73766F]">123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EEF4F8] border border-[#D4E3ED] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#4D6779] flex items-center justify-center shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#252724]">Mật Khẩu Internet / Wifi</p>
                  <p className="text-xs text-[#4D6779] font-mono mt-0.5">SSID: Staging_Q1 | Pass: 88888888</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#73766F] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#252724]">Hạn Hợp Đồng Thuê</p>
                  <p className="text-xs text-[#73766F] mt-0.5">Thời hạn đến: 31/12/2027</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export const SuperAdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Trị Hệ Thống"
        description="Giám sát toàn bộ các tài khoản chủ nhà và cấu hình hệ thống."
      />
      <Card>
        <CardHeader>
          <CardTitle>Hệ Thống Vận Hành An Toàn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[#73766F]">
            Quản lý danh sách Chủ nhà và giám sát nhật ký truy cập toàn bộ hệ thống.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
