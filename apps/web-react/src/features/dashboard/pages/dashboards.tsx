import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Building2, DoorOpen, Users, Receipt } from "lucide-react";

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
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng Điều Khiển Khách Thuê"
        description="Xem thông tin phòng, hợp đồng và hóa đơn cần thanh toán."
      />
      <Card>
        <CardHeader>
          <CardTitle>Chào mừng bạn đến với Nha Tro Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[#73766F]">
            Tra cứu thông tin hợp đồng, hóa đơn tiền nhà và gửi phản hồi bảo trì dễ dàng.
          </p>
        </CardContent>
      </Card>
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
